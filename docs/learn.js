// ===================================================================
// LEARN.JS — Framework Learn Mode + Quiz & Voice Transcription
// ===================================================================

// ===================================================================
// INIT — inject styles, HTML, and wire everything up
// ===================================================================

function initLearn() {
  // ---- 1. Inject CSS ----
  const style = document.createElement('style');
  style.textContent = `
    /* ===== LEARN MODE — SIDEBAR BUTTON ===== */
    /* (uses existing .sidebar-item styles) */

    /* ===== LEARN SECTION HEADER ===== */
    #section-learn .section-header { margin-bottom: 28px; }

    /* ===== FRAMEWORK LEARN CARDS ===== */
    .learn-fw-card {
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: var(--shadow-md);
      transition: border-color .18s;
    }
    .learn-fw-card:hover { border-color: var(--primary-border); }

    .learn-fw-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }
    .learn-fw-icon {
      font-size: 32px;
      flex-shrink: 0;
    }
    .learn-fw-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -.2px;
    }
    .learn-fw-when {
      font-size: 12.5px;
      color: var(--text-muted);
      margin-top: 3px;
      line-height: 1.4;
    }

    /* ===== HORIZONTAL TREE ===== */
    .htree {
      display: flex;
      align-items: flex-start;
      overflow-x: auto;
      padding-bottom: 8px;
      margin-bottom: 20px;
      gap: 0;
    }

    /* Root node */
    .htree-root-wrap {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .htree-root-node {
      background: var(--primary);
      color: #fff;
      border-radius: var(--radius-sm);
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: var(--shadow-md);
      flex-shrink: 0;
      max-width: 160px;
      white-space: normal;
      line-height: 1.4;
    }

    /* Horizontal connector after root */
    .htree-root-connector {
      width: 32px;
      height: 2px;
      background: var(--primary-border);
      flex-shrink: 0;
    }

    /* L1 branches column */
    .htree-l1-col {
      display: flex;
      flex-direction: column;
      gap: 0;
      flex-shrink: 0;
    }

    /* Each L1 branch row (node + optional L2 children) */
    .htree-branch {
      display: flex;
      align-items: flex-start;
      position: relative;
    }

    /* Vertical rail connecting L1 nodes */
    .htree-l1-rail-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      position: relative;
    }

    /* The vertical line + horizontal stub to each L1 node */
    .htree-branch-connector {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .htree-branch-connector .v-seg {
      width: 2px;
      background: var(--primary-border);
      flex-shrink: 0;
    }
    .htree-branch-connector .h-stub {
      width: 20px;
      height: 2px;
      background: var(--primary-border);
      flex-shrink: 0;
    }

    /* L1 node */
    .htree-l1-node {
      background: var(--primary-light);
      border: 1.5px solid var(--primary-border);
      color: var(--primary);
      border-radius: var(--radius-sm);
      padding: 8px 14px;
      font-size: 12.5px;
      font-weight: 600;
      white-space: normal;
      line-height: 1.4;
      flex-shrink: 0;
      max-width: 170px;
      min-width: 120px;
      cursor: default;
      transition: background .15s;
    }
    .htree-l1-node:hover { background: #dde4fe; }

    /* Connector from L1 to its L2 children */
    .htree-l2-connector {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .htree-l2-connector .h-line {
      width: 20px;
      height: 2px;
      background: var(--border);
      flex-shrink: 0;
    }

    /* L2 children column */
    .htree-l2-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex-shrink: 0;
      position: relative;
    }
    /* Vertical rail through L2 children */
    .htree-l2-col::before {
      content: '';
      position: absolute;
      left: 0;
      top: 13px;
      bottom: 13px;
      width: 2px;
      background: var(--border);
    }

    /* Each L2 row */
    .htree-l2-row {
      display: flex;
      align-items: center;
      gap: 0;
      position: relative;
    }
    .htree-l2-row::before {
      content: '';
      width: 14px;
      height: 2px;
      background: var(--border);
      flex-shrink: 0;
    }

    /* L2 node */
    .htree-l2-node {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 6px 12px;
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
      max-width: 210px;
      min-width: 100px;
      white-space: normal;
      transition: background .15s, border-color .15s;
    }
    .htree-l2-node:hover {
      background: var(--surface);
      border-color: var(--primary-border);
      color: var(--text);
    }

    /* ===== OPENING BLOCKQUOTE ===== */
    .learn-opening {
      border-left: 3px solid var(--primary);
      background: var(--primary-light);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      padding: 14px 18px;
      margin-top: 20px;
      margin-bottom: 20px;
      font-style: italic;
      font-size: 13.5px;
      color: #3730a3;
      line-height: 1.7;
    }
    .learn-opening-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: var(--primary);
      font-style: normal;
      margin-bottom: 6px;
    }

    .learn-quiz-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 20px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: background .15s;
    }
    .learn-quiz-btn:hover { background: var(--primary-hover, #4338ca); }

    /* ===== QUIZ VIEW ===== */
    #learn-quiz-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.55);
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(3px);
      animation: fadeIn .2s ease;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }

    #learn-quiz-box {
      background: var(--surface);
      border-radius: var(--radius-lg, 16px);
      padding: 32px;
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,.2);
      animation: slideUp .22s ease;
    }
    @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

    .quiz-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 22px;
    }
    .quiz-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--text);
      flex: 1;
    }
    .quiz-close-btn {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 18px;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all .15s;
    }
    .quiz-close-btn:hover { background: var(--danger-light, #fef2f2); color: var(--danger); }

    .quiz-instructions {
      background: var(--primary-light);
      border: 1px solid var(--primary-border);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      font-size: 12.5px;
      color: #3730a3;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    /* Quiz tree — same layout as learn tree but with inputs */
    .quiz-tree-section {
      margin-bottom: 20px;
    }
    .quiz-tree-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    /* Inline blank input in tree nodes */
    .quiz-blank {
      background: var(--bg);
      border: 1.5px solid var(--primary-border);
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 12px;
      font-family: inherit;
      color: var(--text);
      min-width: 80px;
      max-width: 180px;
      width: 100%;
      outline: none;
      transition: border-color .15s, background .15s;
    }
    .quiz-blank:focus {
      border-color: var(--primary);
      background: #fff;
      box-shadow: 0 0 0 2px rgba(79,70,229,.1);
    }
    .quiz-blank.correct {
      background: var(--success-light);
      border-color: var(--success);
      color: var(--success);
    }
    .quiz-blank.wrong {
      background: var(--danger-light, #fef2f2);
      border-color: var(--danger);
      color: var(--danger);
    }
    .quiz-blank.wrong::placeholder { color: var(--danger); }

    .quiz-node-correct-reveal {
      font-size: 11px;
      color: var(--success);
      margin-top: 3px;
      display: none;
    }
    .quiz-blank.wrong ~ .quiz-node-correct-reveal { display: block; }

    .quiz-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    .quiz-score-badge {
      margin-left: auto;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      display: none;
    }
    .quiz-score-badge.visible { display: block; }

    /* ===== VOICE BUTTON ===== */
    #voice-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text-muted);
      font-size: 15px;
      cursor: pointer;
      transition: all .15s;
      flex-shrink: 0;
      margin-right: 6px;
      position: relative;
    }
    #voice-btn:hover:not(.recording) {
      background: var(--primary-light);
      border-color: var(--primary-border);
      color: var(--primary);
    }
    #voice-btn.recording {
      background: #fef2f2;
      border-color: var(--danger);
      color: var(--danger);
      animation: pulse-ring .9s ease-in-out infinite;
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(239,68,68,.4); }
      70%  { box-shadow: 0 0 0 7px rgba(239,68,68,0); }
      100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
    }

    /* interim voice text */
    #voice-interim-text {
      color: var(--text-light);
      font-style: italic;
      pointer-events: none;
    }

    /* ===== LEARN NAV SELECTOR (between all-frameworks and individual) ===== */
    .learn-fw-nav {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .learn-fw-pill {
      padding: 6px 14px;
      border-radius: 100px;
      border: 1.5px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      transition: all .15s;
    }
    .learn-fw-pill:hover { border-color: var(--primary-border); color: var(--primary); }
    .learn-fw-pill.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);

  // ---- 2. Inject sidebar button ----
  // Find the second .sidebar-section in #tab-coach (the "Learn" section)
  const coachSidebar = document.querySelector('#tab-coach .sidebar');
  if (coachSidebar) {
    const learnSection = coachSidebar.querySelectorAll('.sidebar-section')[1];
    if (learnSection) {
      const btn = document.createElement('button');
      btn.className = 'sidebar-item';
      btn.id = 'nav-learn';
      btn.onclick = () => showCoachSection('learn');
      btn.innerHTML = '<span class="sidebar-icon">🎓</span><span>Learn Mode</span>';
      learnSection.appendChild(btn);
    }
  }

  // ---- 3. Inject content section ----
  const coachContent = document.querySelector('#tab-coach .content');
  if (coachContent) {
    const section = document.createElement('div');
    section.id = 'section-learn';
    section.className = 'section';
    section.innerHTML = `
      <div class="section-header">
        <div class="section-title">Learn Mode</div>
        <div class="section-subtitle">Study each framework as an interactive tree chart, then test yourself with a fill-in-the-blank quiz.</div>
      </div>
      <div class="learn-fw-nav" id="learn-fw-nav"></div>
      <div id="learn-fw-list"></div>
    `;
    coachContent.appendChild(section);
  }

  // ---- 4. Inject voice button next to word count in response area ----
  injectVoiceButton();

  // ---- 5. Render the learn section ----
  renderLearnSection();
}

// ===================================================================
// LEARN SECTION RENDERING
// ===================================================================

function renderLearnSection() {
  const navEl = document.getElementById('learn-fw-nav');
  const listEl = document.getElementById('learn-fw-list');
  if (!navEl || !listEl) return;

  // Build filter pills: All + each framework
  const allPills = [{ id: 'all', name: 'All Frameworks', icon: '' }].concat(
    FRAMEWORKS.map(fw => ({ id: fw.id, name: fw.name, icon: fw.icon }))
  );

  navEl.innerHTML = allPills.map(p => `
    <button class="learn-fw-pill ${p.id === 'all' ? 'active' : ''}"
      onclick="showLearnFramework('${p.id}')"
      id="learn-pill-${p.id}">
      ${p.icon ? p.icon + ' ' : ''}${p.name}
    </button>
  `).join('');

  // Show all by default
  showLearnFramework('all');
}

function showLearnFramework(id) {
  // Update active pill
  document.querySelectorAll('.learn-fw-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.getElementById(`learn-pill-${id}`);
  if (activePill) activePill.classList.add('active');

  const listEl = document.getElementById('learn-fw-list');
  if (!listEl) return;

  const frameworks = id === 'all' ? FRAMEWORKS : FRAMEWORKS.filter(fw => fw.id === id);

  listEl.innerHTML = frameworks.map(fw => buildLearnCard(fw)).join('');
}

function buildLearnCard(fw) {
  return `
    <div class="learn-fw-card" id="learn-card-${fw.id}">
      <div class="learn-fw-header">
        <div class="learn-fw-icon">${fw.icon}</div>
        <div>
          <div class="learn-fw-title">${fw.name}</div>
          <div class="learn-fw-when">Use when: ${fw.when}</div>
        </div>
      </div>
      <div class="htree" id="htree-${fw.id}">${buildHTree(fw)}</div>
      <div class="learn-opening">
        <div class="learn-opening-label">Sample Opening</div>
        ${escapeHtml(fw.opening)}
      </div>
      <button class="learn-quiz-btn" onclick="startQuiz('${fw.id}')">
        ✏️ Quiz Me on This
      </button>
    </div>
  `;
}

// ===================================================================
// HORIZONTAL TREE BUILDER
// ===================================================================

function buildHTree(fw) {
  const structure = fw.structure;

  // Group: parse into [{l1: item, children: [l2, l2...]}, ...]
  const groups = [];
  let currentGroup = null;
  structure.forEach(item => {
    if (item.l === 1) {
      currentGroup = { l1: item, children: [] };
      groups.push(currentGroup);
    } else if (item.l === 2 && currentGroup) {
      currentGroup.children.push(item);
    }
  });

  const rootLabel = fw.name.replace(' Framework', '').replace(' Strategy', '');

  // Build HTML
  let html = `
    <div class="htree-root-wrap">
      <div class="htree-root-node">${escapeHtml(rootLabel)}</div>
      <div class="htree-root-connector"></div>
    </div>
    <div class="htree-l1-col">
  `;

  groups.forEach((group, gi) => {
    const isFirst = gi === 0;
    const isLast = gi === groups.length - 1;

    // Build L2 column if there are children
    let l2Html = '';
    if (group.children.length > 0) {
      const childNodes = group.children.map(child => `
        <div class="htree-l2-row">
          <div class="htree-l2-node">${escapeHtml(child.t)}</div>
        </div>
      `).join('');
      l2Html = `
        <div class="htree-l2-connector"><div class="h-line"></div></div>
        <div class="htree-l2-col">${childNodes}</div>
      `;
    }

    html += `
      <div class="htree-branch" style="margin-bottom: ${gi < groups.length - 1 ? '10px' : '0'}; align-items: center;">
        <div class="htree-l1-node">${escapeHtml(group.l1.t)}</div>
        ${l2Html}
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

// ===================================================================
// QUIZ
// ===================================================================

// State for active quiz
const quizState = {
  frameworkId: null,
  blanks: [],   // [{nodeIndex, correct, el}]
  checked: false
};

function startQuiz(frameworkId) {
  const fw = FRAMEWORKS.find(f => f.id === frameworkId);
  if (!fw) return;

  quizState.frameworkId = frameworkId;
  quizState.blanks = [];
  quizState.checked = false;

  // Decide which nodes to blank: always show root/l1 as text, blank ~60% of l2 nodes
  const allNodes = fw.structure;
  const blankIndices = new Set();
  allNodes.forEach((node, i) => {
    if (node.l === 2) {
      if (Math.random() < 0.6) blankIndices.add(i);
    }
    // Also blank some l1 nodes (about 30%)
    if (node.l === 1) {
      if (Math.random() < 0.3) blankIndices.add(i);
    }
  });
  // Ensure at least 2 blanks
  if (blankIndices.size < 2) {
    allNodes.forEach((node, i) => {
      if (blankIndices.size >= 3) return;
      if (node.l === 2) blankIndices.add(i);
    });
  }

  // Build quiz HTML — same tree structure but with inputs for blanked nodes
  const groups = [];
  let currentGroup = null;
  allNodes.forEach((item, i) => {
    if (item.l === 1) {
      currentGroup = { l1: item, l1Idx: i, children: [] };
      groups.push(currentGroup);
    } else if (item.l === 2 && currentGroup) {
      currentGroup.children.push({ item, idx: i });
    }
  });

  const rootLabel = fw.name.replace(' Framework', '').replace(' Strategy', '');

  let treeHtml = `
    <div class="htree" style="overflow-x:auto; padding-bottom:8px;">
      <div class="htree-root-wrap">
        <div class="htree-root-node">${escapeHtml(rootLabel)}</div>
        <div class="htree-root-connector"></div>
      </div>
      <div class="htree-l1-col">
  `;

  const blankMeta = []; // {nodeIdx, correct}

  groups.forEach((group, gi) => {
    const isL1Blank = blankIndices.has(group.l1Idx);
    let l1Content;
    if (isL1Blank) {
      const bId = `qb-${group.l1Idx}`;
      l1Content = `<input class="quiz-blank" id="${bId}" data-idx="${group.l1Idx}" placeholder="?" onkeydown="quizKeyDown(event)" autocomplete="off">`;
      blankMeta.push({ nodeIdx: group.l1Idx, correct: group.l1.t, inputId: bId });
    } else {
      l1Content = escapeHtml(group.l1.t);
    }

    let l2Html = '';
    if (group.children.length > 0) {
      const childNodes = group.children.map(({ item, idx }) => {
        const isBlank = blankIndices.has(idx);
        let nodeContent;
        if (isBlank) {
          const bId = `qb-${idx}`;
          nodeContent = `<div style="display:flex;flex-direction:column;gap:2px">
            <input class="quiz-blank" id="${bId}" data-idx="${idx}" placeholder="?" onkeydown="quizKeyDown(event)" autocomplete="off">
            <div class="quiz-node-correct-reveal" id="qcr-${idx}"></div>
          </div>`;
          blankMeta.push({ nodeIdx: idx, correct: item.t, inputId: bId });
        } else {
          nodeContent = `<div class="htree-l2-node">${escapeHtml(item.t)}</div>`;
        }
        return `<div class="htree-l2-row">${nodeContent}</div>`;
      }).join('');
      l2Html = `
        <div class="htree-l2-connector"><div class="h-line"></div></div>
        <div class="htree-l2-col">${childNodes}</div>
      `;
    }

    treeHtml += `
      <div class="htree-branch" style="margin-bottom: ${gi < groups.length - 1 ? '10px' : '0'}; align-items: center;">
        <div class="htree-l1-node">${l1Content}</div>
        ${l2Html}
      </div>
    `;
  });

  treeHtml += `</div></div>`;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.id = 'learn-quiz-overlay';
  overlay.innerHTML = `
    <div id="learn-quiz-box">
      <div class="quiz-header">
        <div style="font-size:24px">${fw.icon}</div>
        <div class="quiz-title">${fw.name} — Fill in the Blanks</div>
        <button class="quiz-close-btn" onclick="closeQuiz()" title="Close">✕</button>
      </div>
      <div class="quiz-instructions">
        Fill in the <strong>highlighted blanks</strong>. Partial answers are fine — just include the key terms.
        Press <kbd style="background:var(--bg);padding:1px 5px;border-radius:3px;border:1px solid var(--border);font-size:11px">Enter</kbd> or click <strong>Check Answers</strong> when ready.
      </div>
      <div class="quiz-tree-section">
        <div class="quiz-tree-label">Framework Structure</div>
        ${treeHtml}
      </div>
      <div class="quiz-actions">
        <button class="btn btn-primary" id="quiz-check-btn" onclick="checkQuiz()">Check Answers</button>
        <button class="btn btn-secondary" onclick="startQuiz('${frameworkId}')">Retry</button>
        <button class="btn btn-ghost btn-sm" onclick="closeQuiz()">Close</button>
        <div class="quiz-score-badge" id="quiz-score-badge"></div>
      </div>
    </div>
  `;

  // Remove any existing overlay
  const existing = document.getElementById('learn-quiz-overlay');
  if (existing) existing.remove();

  document.body.appendChild(overlay);

  // Store blank meta into quizState
  quizState.blanks = blankMeta;

  // Focus first blank
  if (blankMeta.length > 0) {
    const firstInput = document.getElementById(blankMeta[0].inputId);
    if (firstInput) setTimeout(() => firstInput.focus(), 80);
  }
}

function quizKeyDown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    // Move to next blank or check
    const blanks = quizState.blanks;
    const currentId = event.target.id;
    const currentIndex = blanks.findIndex(b => b.inputId === currentId);
    if (currentIndex >= 0 && currentIndex < blanks.length - 1) {
      const nextInput = document.getElementById(blanks[currentIndex + 1].inputId);
      if (nextInput) { nextInput.focus(); return; }
    }
    checkQuiz();
  }
}

function checkQuiz() {
  const blanks = quizState.blanks;
  if (!blanks.length) return;

  let correct = 0;
  let total = blanks.length;

  blanks.forEach(({ inputId, correct: correctText, nodeIdx }) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const userVal = input.value.trim().toLowerCase();
    const correctLower = correctText.toLowerCase();

    // Scoring: case-insensitive, partial match if length > 4 and is substring of correct
    let isCorrect = false;
    if (userVal === correctLower) {
      isCorrect = true;
    } else if (userVal.length > 4 && correctLower.includes(userVal)) {
      isCorrect = true;
    } else if (userVal.length > 4 && userVal.includes(correctLower.slice(0, Math.min(correctLower.length, 8)))) {
      isCorrect = true;
    }

    input.classList.remove('correct', 'wrong');
    input.classList.add(isCorrect ? 'correct' : 'wrong');
    input.disabled = true;
    if (isCorrect) {
      correct++;
    } else {
      // Reveal correct answer
      const revealEl = document.getElementById(`qcr-${nodeIdx}`);
      if (revealEl) {
        revealEl.textContent = `Correct: ${correctText}`;
        revealEl.style.display = 'block';
      }
    }
  });

  quizState.checked = true;

  // Show score
  const scoreEl = document.getElementById('quiz-score-badge');
  if (scoreEl) {
    scoreEl.textContent = `Score: ${correct} / ${total}`;
    scoreEl.classList.add('visible');
    const pct = total > 0 ? Math.round(correct / total * 100) : 0;
    scoreEl.style.color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
  }

  // Disable check button
  const checkBtn = document.getElementById('quiz-check-btn');
  if (checkBtn) checkBtn.disabled = true;

  // Persist quiz result
  state.stats.quizzes = state.stats.quizzes || [];
  state.stats.quizzes.push({
    date: new Date().toISOString().slice(0, 10),
    frameworkId: quizState.frameworkId,
    score: correct,
    total: total
  });
  saveStats();

  // Show toast
  const pct = total > 0 ? Math.round(correct / total * 100) : 0;
  if (pct === 100) {
    toast('Perfect score! You nailed it.', 'success');
  } else if (pct >= 70) {
    toast(`Good work — ${correct}/${total} correct (${pct}%)`, 'success');
  } else {
    toast(`${correct}/${total} correct — review the framework and retry.`, 'info');
  }
}

function closeQuiz() {
  const overlay = document.getElementById('learn-quiz-overlay');
  if (overlay) overlay.remove();
  quizState.frameworkId = null;
  quizState.blanks = [];
  quizState.checked = false;
}

// ===================================================================
// VOICE TRANSCRIPTION
// ===================================================================

const voiceState = {
  recognition: null,
  active: false,
  interimText: ''
};

function injectVoiceButton() {
  // Wait for the response-label div to exist (it's in the static HTML)
  const responseLabelRow = document.getElementById('response-label-row');
  if (responseLabelRow) {
    _doInjectVoiceButton(responseLabelRow);
    return;
  }

  // The response-label div exists in static HTML but may not have the id.
  // Find it by class and insert the button.
  const responseLabel = document.querySelector('#section-practice .response-label');
  if (responseLabel) {
    _doInjectVoiceButton(responseLabel);
  }
}

function _doInjectVoiceButton(container) {
  // Avoid double injection
  if (document.getElementById('voice-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'voice-btn';
  btn.title = 'Voice input (click to start/stop recording)';
  btn.setAttribute('onclick', 'toggleVoice()');
  btn.textContent = '🎤';

  // Insert before the word-count span (which is the last child of response-label)
  const wordCountSpan = container.querySelector('.word-count') || container.lastElementChild;
  if (wordCountSpan) {
    container.insertBefore(btn, wordCountSpan);
  } else {
    container.appendChild(btn);
  }
}

function toggleVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    toast('Voice input not supported in this browser. Use Chrome.', 'error');
    return;
  }

  const btn = document.getElementById('voice-btn');
  if (!btn) return;

  if (voiceState.active) {
    // Stop recording
    if (voiceState.recognition) {
      voiceState.recognition.stop();
    }
    _stopVoiceUI();
    return;
  }

  // Start recording
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  voiceState.recognition = recognition;
  voiceState.active = true;
  voiceState.interimText = '';

  btn.classList.add('recording');
  btn.title = 'Recording… click to stop';

  const textarea = document.getElementById('response-textarea');

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    if (finalTranscript) {
      // Append final transcript to textarea
      const current = textarea.value;
      const needsSpace = current.length > 0 && !current.endsWith(' ') && !current.endsWith('\n');
      textarea.value = current + (needsSpace ? ' ' : '') + finalTranscript.trim();
      voiceState.interimText = '';
      updateWordCount();
    }

    // Show interim as placeholder-like text (we use a data attribute trick)
    voiceState.interimText = interimTranscript;
    _updateInterimDisplay(textarea, interimTranscript);
  };

  recognition.onerror = (event) => {
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      toast('Microphone access denied. Allow microphone access in your browser settings.', 'error');
    } else if (event.error !== 'aborted') {
      toast(`Voice input error: ${event.error}`, 'error');
    }
    _stopVoiceUI();
  };

  recognition.onend = () => {
    if (voiceState.active) {
      // Auto-restarted if we're still supposed to be active (e.g. interim pause)
      // but we won't restart — just clean up
      _stopVoiceUI();
    }
    _clearInterimDisplay(textarea);
  };

  try {
    recognition.start();
  } catch (e) {
    toast('Could not start voice input. Try again.', 'error');
    _stopVoiceUI();
  }
}

function _stopVoiceUI() {
  voiceState.active = false;
  if (voiceState.recognition) {
    try { voiceState.recognition.stop(); } catch (e) {}
    voiceState.recognition = null;
  }
  const btn = document.getElementById('voice-btn');
  if (btn) {
    btn.classList.remove('recording');
    btn.title = 'Voice input (click to start/stop recording)';
  }
  const textarea = document.getElementById('response-textarea');
  if (textarea) _clearInterimDisplay(textarea);
}

function _updateInterimDisplay(textarea, interimText) {
  // We overlay interim text using a sibling span positioned absolutely over the textarea.
  // Simpler approach: append to a dedicated interim-display div below the textarea.
  let interimEl = document.getElementById('voice-interim-display');
  if (!interimEl) {
    interimEl = document.createElement('div');
    interimEl.id = 'voice-interim-display';
    interimEl.style.cssText = `
      font-size: 13px;
      color: var(--text-light);
      font-style: italic;
      padding: 4px 8px;
      min-height: 20px;
      line-height: 1.4;
    `;
    textarea.parentNode.insertBefore(interimEl, textarea.nextSibling);
  }
  interimEl.textContent = interimText ? `Listening: "${interimText}"` : '';
}

function _clearInterimDisplay(textarea) {
  const interimEl = document.getElementById('voice-interim-display');
  if (interimEl) interimEl.textContent = '';
  voiceState.interimText = '';
}

// ===================================================================
// UTILITY
// ===================================================================

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===================================================================
// BOOTSTRAP
// ===================================================================

document.addEventListener('DOMContentLoaded', initLearn);
