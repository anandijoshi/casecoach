#!/usr/bin/env python3
"""Case Coach server — serves static files and proxies Anthropic API calls."""

import json
import os
import time
import urllib.request
import urllib.error
import shutil
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

BASE_DIR = Path(__file__).parent
PUBLIC_DIR = BASE_DIR / 'public'
DATA_DIR = BASE_DIR / 'data'
UPLOADS_DIR = BASE_DIR / 'uploads'
CASEBOOKS_FILE = DATA_DIR / 'casebooks.json'

DATA_DIR.mkdir(exist_ok=True)
UPLOADS_DIR.mkdir(exist_ok=True)
if not CASEBOOKS_FILE.exists():
    CASEBOOKS_FILE.write_text(json.dumps({'casebooks': []}))

MIME = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.json': 'application/json', '.ico': 'image/x-icon', '.png': 'image/png',
}

def read_casebooks():
    return json.loads(CASEBOOKS_FILE.read_text())

def write_casebooks(data):
    CASEBOOKS_FILE.write_text(json.dumps(data, indent=2))

def call_claude(api_key, system, user_message, max_tokens=1024):
    body = json.dumps({
        'model': 'claude-sonnet-4-6',
        'max_tokens': max_tokens,
        'system': system,
        'messages': [{'role': 'user', 'content': user_message}]
    }).encode()
    req = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=body,
        headers={
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        method='POST'
    )
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read())
        return data['content'][0]['text']

def parse_json_response(text):
    try:
        return json.loads(text)
    except Exception:
        import re
        m = re.search(r'\{[\s\S]*\}', text)
        if m:
            try:
                return json.loads(m.group())
            except Exception:
                pass
    return None

def parse_multipart(data, content_type):
    """Parse multipart/form-data. Returns (fields, files) dicts."""
    boundary = None
    for part in content_type.split(';'):
        part = part.strip()
        if part.startswith('boundary='):
            boundary = part[9:].strip('"').encode()
            break
    if not boundary:
        return {}, {}

    fields, files = {}, {}
    delimiter = b'--' + boundary
    parts = data.split(delimiter)
    for raw in parts[1:]:
        if raw.startswith(b'--') or len(raw) < 4:
            continue
        header_end = raw.find(b'\r\n\r\n')
        if header_end == -1:
            continue
        header_bytes = raw[2:header_end]
        body = raw[header_end + 4:]
        if body.endswith(b'\r\n'):
            body = body[:-2]
        headers = {}
        for line in header_bytes.decode('utf-8', errors='replace').split('\r\n'):
            if ':' in line:
                k, v = line.split(':', 1)
                headers[k.strip().lower()] = v.strip()
        disp = headers.get('content-disposition', '')
        name = None
        filename = None
        for seg in disp.split(';'):
            seg = seg.strip()
            if seg.startswith('name='):
                name = seg[5:].strip('"')
            elif seg.startswith('filename='):
                filename = seg[9:].strip('"')
        if name is None:
            continue
        if filename:
            files[name] = {'filename': filename, 'data': body, 'content_type': headers.get('content-type', '')}
        else:
            fields[name] = body.decode('utf-8', errors='replace')
    return fields, files

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # suppress default access logs

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, msg, status=500):
        self.send_json({'error': msg}, status)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/casebooks':
            data = read_casebooks()
            safe = [{'id':b['id'],'name':b['name'],'firm':b.get('firm','Unknown'),
                     'caseCount':b.get('caseCount'),'topics':b.get('topics',[]),
                     'uploadedAt':b.get('uploadedAt',''),'pages':b.get('pages',0)}
                    for b in data['casebooks']]
            self.send_json(safe)
            return
        # Serve static files
        if path == '/':
            path = '/index.html'
        file_path = PUBLIC_DIR / path.lstrip('/')
        if file_path.exists() and file_path.is_file():
            ext = file_path.suffix.lower()
            mime = MIME.get(ext, 'application/octet-stream')
            body = file_path.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def do_DELETE(self):
        path = urlparse(self.path).path
        if path.startswith('/api/casebooks/'):
            book_id = path.split('/')[-1]
            data = read_casebooks()
            idx = next((i for i, b in enumerate(data['casebooks']) if b['id'] == book_id), -1)
            if idx == -1:
                self.send_error_json('Not found', 404); return
            book = data['casebooks'][idx]
            fp = UPLOADS_DIR / book.get('storedFile', '')
            if fp.exists():
                try: fp.unlink()
                except: pass
            data['casebooks'].pop(idx)
            write_casebooks(data)
            self.send_json({'ok': True})
        else:
            self.send_response(404); self.end_headers()

    def do_POST(self):
        path = urlparse(self.path).path
        length = int(self.headers.get('Content-Length', 0))
        raw_body = self.rfile.read(length) if length else b''

        if path == '/api/feedback':
            self._handle_feedback(raw_body)
        elif path == '/api/casebooks/upload':
            self._handle_upload(raw_body)
        elif path == '/api/casebooks/generate':
            self._handle_generate(raw_body)
        else:
            self.send_response(404); self.end_headers()

    def _handle_feedback(self, raw_body):
        try:
            body = json.loads(raw_body)
        except Exception:
            self.send_error_json('Invalid JSON', 400); return

        api_key = body.get('apiKey') or os.environ.get('ANTHROPIC_API_KEY', '')
        if not api_key:
            self.send_json({'error': 'NO_KEY'}, 400); return

        system = """You are a senior McKinsey partner conducting case interview feedback. Be direct, specific, and actionable.
Return ONLY valid JSON — no markdown, no backticks:
{"overall_score":<1-10>,"framework_score":<1-10>,"communication_score":<1-10>,"hypothesis_score":<1-10>,"strengths":["<strength>","<strength>"],"improvements":["<improvement>","<improvement>","<improvement>"],"overall_feedback":"<3-4 sentence assessment>","ideal_framework":"<2-3 sentences on optimal approach>","pass":<true if overall>=7>}"""

        user_msg = f"Case Type: {body.get('caseType')}\n\nCase Prompt:\n{body.get('casePrompt')}\n\nCandidate Response:\n{body.get('userResponse')}"

        try:
            text = call_claude(api_key, system, user_msg)
            result = parse_json_response(text)
            if result:
                self.send_json(result)
            else:
                self.send_error_json('Could not parse AI response')
        except urllib.error.HTTPError as e:
            err_body = json.loads(e.read()) if e.fp else {}
            self.send_error_json(err_body.get('error', {}).get('message', f'API error {e.code}'), e.code)
        except Exception as e:
            self.send_error_json(str(e))

    def _handle_upload(self, raw_body):
        content_type = self.headers.get('Content-Type', '')
        fields, files = parse_multipart(raw_body, content_type)

        if 'file' not in files:
            self.send_error_json('No file uploaded', 400); return

        f = files['file']
        api_key = fields.get('apiKey', '') or os.environ.get('ANTHROPIC_API_KEY', '')

        filename = f['filename']
        stored_name = f"{int(time.time())}_{filename}"
        stored_path = UPLOADS_DIR / stored_name
        stored_path.write_bytes(f['data'])

        # Extract text with pdfplumber
        text = ''
        pages = 0
        try:
            import pdfplumber
            with pdfplumber.open(str(stored_path)) as pdf:
                pages = len(pdf.pages)
                text = '\n'.join(p.extract_text() or '' for p in pdf.pages)
        except Exception as e:
            stored_path.unlink(missing_ok=True)
            self.send_error_json(f'Could not parse PDF: {e}', 422); return

        if not text or len(text.strip()) < 200:
            stored_path.unlink(missing_ok=True)
            self.send_error_json('PDF appears image-based or empty. Please use a text-based PDF.', 422); return

        # Extract metadata with Claude if key available
        metadata = {'title': filename.replace('.pdf', ''), 'firm': 'Unknown', 'caseCount': None, 'topics': []}
        if api_key:
            try:
                meta_system = 'Analyze this case book and return ONLY valid JSON:\n{"title":"<title>","firm":"<firm or Unknown>","caseCount":<int or null>,"topics":["<topic>"]}\nTopics from: Profitability, Market Entry, Market Sizing, M&A, Operations, Pricing, Competitive, Growth'
                meta_text = call_claude(api_key, meta_system, text[:3000], 256)
                parsed = parse_json_response(meta_text)
                if parsed:
                    metadata.update(parsed)
            except Exception:
                pass

        book_id = f"book_{int(time.time())}"
        casebook = {
            'id': book_id, 'name': metadata['title'], 'firm': metadata['firm'],
            'caseCount': metadata.get('caseCount'), 'topics': metadata.get('topics', []),
            'pages': pages, 'uploadedAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'filename': filename, 'storedFile': stored_name,
            'excerpt': text[:8000]
        }

        data = read_casebooks()
        data['casebooks'].append(casebook)
        write_casebooks(data)

        self.send_json({'id': casebook['id'], 'name': casebook['name'], 'firm': casebook['firm'],
                        'caseCount': casebook['caseCount'], 'topics': casebook['topics'],
                        'pages': pages, 'uploadedAt': casebook['uploadedAt']})

    def _handle_generate(self, raw_body):
        try:
            body = json.loads(raw_body)
        except Exception:
            self.send_error_json('Invalid JSON', 400); return

        api_key = body.get('apiKey') or os.environ.get('ANTHROPIC_API_KEY', '')
        if not api_key:
            self.send_json({'error': 'NO_KEY'}, 400); return

        book_id = body.get('bookId')
        difficulty = body.get('difficulty', 'Intermediate')

        data = read_casebooks()
        book = next((b for b in data['casebooks'] if b['id'] == book_id), None)
        if not book:
            self.send_error_json('Case book not found', 404); return

        diff_guide = {
            'Beginner': 'Simple, clear problem. Single main driver. Obvious framework. Include 2 helpful hints.',
            'Intermediate': 'Moderate complexity, standard MBB format, some ambiguity, one follow-up question.',
            'Hard': 'Complex, multi-dimensional, requires cross-framework synthesis, significant ambiguity.'
        }.get(difficulty, 'Standard difficulty.')

        system = f"""You are a case interview coach generating practice cases from consulting case books. Match the firm's style.
Difficulty: {difficulty} — {diff_guide}
Return ONLY valid JSON:
{{"company":"<realistic company>","type":"<Profitability|Market Entry|Market Sizing|M&A|Operations|Pricing|Competitive>","difficulty":"{difficulty}","prompt":"<120-200 word case prompt>","followup":"<one follow-up question>","hints":["<hint>","<hint>"]}}"""

        try:
            text = call_claude(api_key, system, f"Case book excerpt:\n{book['excerpt']}\n\nGenerate a {difficulty} case matching this firm's style.", 768)
            result = parse_json_response(text)
            if result:
                result['id'] = f"gen_{int(time.time())}"
                result['source'] = book['name']
                result['bookId'] = book_id
                self.send_json(result)
            else:
                self.send_error_json('Could not generate case')
        except urllib.error.HTTPError as e:
            err_body = json.loads(e.read()) if e.fp else {}
            self.send_error_json(err_body.get('error', {}).get('message', f'API error {e.code}'), e.code)
        except Exception as e:
            self.send_error_json(str(e))


if __name__ == '__main__':
    PORT = 3000
    server = HTTPServer(('', PORT), Handler)
    print(f'\n✓ Case Coach running → http://localhost:{PORT}\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
