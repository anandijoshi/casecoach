// ===================================================================
// SCHEDULE.JS — Progress & Schedule tab
// Injected into the Case Coach SPA via DOMContentLoaded
// ===================================================================

(function () {

  // ─── CONSTANTS ──────────────────────────────────────────────────
  const SCHEDULE_KEY = 'cc_schedule_v1';
  const GCAL_CLIENT_ID_KEY = 'cc_gcal_client_id';

  // ─── MODULE STATE ───────────────────────────────────────────────
  const schedState = {
    viewWeekStart: getWeekStart(new Date()),   // Monday of displayed week
    gcalToken: null,
    gcalUserEmail: null,
    gcalClientId: localStorage.getItem(GCAL_CLIENT_ID_KEY) || '',
    gisLoaded: false,
    gapiLoaded: false,
    tokenClient: null,
  };

  // ─── DATE HELPERS ───────────────────────────────────────────────

  /** Return the Monday of the week containing `date` */
  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun … 6=Sat
    const diff = (day === 0) ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function addMinutes(dateStr, timeStr, mins) {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(`${dateStr}T${timeStr}:00`);
    d.setMinutes(d.getMinutes() + mins);
    return d.toISOString();
  }

  function shortDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function dayLabel(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  function formatTime(t) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  // ─── SCHEDULE PERSISTENCE ───────────────────────────────────────

  function loadSessions() {
    try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY) || '[]'); } catch { return []; }
  }

  function saveSessions(sessions) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(sessions));
  }

  function getSessionsForWeek(weekStart) {
    const ws = isoDate(weekStart);
    return loadSessions().filter(s => s.weekStart === ws);
  }

  // ─── INJECT CSS ─────────────────────────────────────────────────

  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
/* ===== PROGRESS TAB LAYOUT ===== */
#tab-progress .content { padding: 32px; }

/* ===== PROGRESS STAT CARDS ===== */
.progress-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
  margin-bottom: 28px;
}

/* ===== CSS BAR CHART ===== */
.bar-chart-wrap {
  margin: 16px 0 0;
}
.bar-chart-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-muted);
  margin-bottom: 12px;
}
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
  padding-bottom: 28px;
  position: relative;
  border-bottom: 1px solid var(--border);
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  position: relative;
}
.bar-col-inner {
  width: 100%;
  min-height: 3px;
  border-radius: 3px 3px 0 0;
  transition: height .3s ease;
  position: relative;
}
.bar-col-inner:hover::after {
  content: attr(data-tip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: #fff;
  font-size: 11px;
  padding: 3px 7px;
  border-radius: 4px;
  white-space: nowrap;
  margin-bottom: 4px;
  pointer-events: none;
  z-index: 10;
}
.bar-col-label {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 9.5px;
  color: var(--text-muted);
  white-space: nowrap;
  text-align: center;
}
.bar-empty {
  background: var(--border);
  opacity: .5;
}
.bar-green { background: var(--success); }
.bar-yellow { background: var(--warning); }
.bar-red { background: var(--danger); }

/* ===== SCORE TREND TABLE ===== */
.score-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.score-table th {
  background: var(--bg);
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.score-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--bg);
  color: var(--text);
  vertical-align: middle;
}
.score-table tr:last-child td { border-bottom: none; }
.score-table tr:hover td { background: var(--bg); }
.pass-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
}
.pass-pill.pass { background: var(--success-light); color: var(--success); }
.pass-pill.fail { background: #fef2f2; color: var(--danger); }

/* ===== WEEKLY SCHEDULE ===== */
.week-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.week-nav-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  flex: 1;
  text-align: center;
}
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}
.week-day-col {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  min-height: 160px;
  overflow: hidden;
  transition: border-color .15s;
}
.week-day-col.today { border-color: var(--primary); }
.week-day-header {
  padding: 8px 10px 6px;
  border-bottom: 1px solid var(--border);
  text-align: center;
  background: var(--bg);
}
.week-day-name {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
}
.week-day-date {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.1;
  margin-top: 2px;
}
.week-day-col.today .week-day-date {
  color: var(--primary);
}
.week-day-col.today .week-day-name {
  color: var(--primary);
}
.week-day-body {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.session-block {
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  font-size: 11.5px;
  position: relative;
  cursor: default;
  transition: box-shadow .15s;
}
.session-block:hover { box-shadow: var(--shadow); }
.session-block.type-drill {
  background: #fffbeb;
  border-color: #fde68a;
}
.session-block.type-both {
  background: #ecfdf5;
  border-color: #a7f3d0;
}
.session-block-time {
  font-weight: 700;
  color: var(--primary);
  font-size: 11px;
}
.session-block.type-drill .session-block-time { color: #d97706; }
.session-block.type-both .session-block-time { color: var(--success); }
.session-block-type {
  color: var(--text);
  font-weight: 600;
  line-height: 1.3;
  margin-top: 1px;
}
.session-block-duration {
  color: var(--text-muted);
  font-size: 10.5px;
}
.session-block-notes {
  color: var(--text-muted);
  font-size: 10.5px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-block-synced {
  font-size: 10px;
  color: var(--success);
  font-weight: 600;
  margin-top: 2px;
}
.session-delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 10px;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .15s, background .15s;
  padding: 0;
}
.session-block:hover .session-delete-btn { opacity: 1; }
.session-delete-btn:hover { background: #fecaca; color: var(--danger); }

/* ===== ADD SESSION FORM ===== */
.add-session-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  align-items: end;
}
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-muted);
}
.form-control {
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13.5px;
  font-family: inherit;
  color: var(--text);
  background: var(--surface);
  transition: border-color .15s;
}
.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .1);
}
.week-summary {
  padding: 12px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 16px;
}
.week-summary strong { color: var(--text); }

/* ===== GCAL SECTION ===== */
.gcal-setup-steps {
  counter-reset: gcal-step;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0 0 20px;
  padding: 0;
}
.gcal-setup-steps li {
  counter-increment: gcal-step;
  display: flex;
  gap: 12px;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--text);
}
.gcal-setup-steps li::before {
  content: counter(gcal-step);
  min-width: 22px;
  height: 22px;
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}
.gcal-connected-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--success-light);
  border: 1.5px solid #a7f3d0;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: #065f46;
  margin-bottom: 16px;
}
.gcal-connected-badge::before {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  flex-shrink: 0;
}
.session-sync-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--bg);
  font-size: 13px;
}
.session-sync-row:last-child { border-bottom: none; }
.sync-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
  margin-right: 6px;
}
.sync-status-dot.synced { background: var(--success); }
.sync-status-dot.unsynced { background: var(--border); }

/* ===== PROGRESS SECTION NAV ===== */
#tab-progress .sidebar-item { cursor: pointer; }
`;
    document.head.appendChild(style);
  }

  // ─── INJECT HTML ────────────────────────────────────────────────

  function injectHTML() {
    // 1. Add nav button
    const nav = document.querySelector('.main-nav');
    if (nav && !document.getElementById('nav-btn-progress')) {
      const btn = document.createElement('button');
      btn.className = 'main-nav-btn';
      btn.id = 'nav-btn-progress';
      btn.textContent = 'Progress & Schedule';
      btn.setAttribute('onclick', 'switchToProgressTab()');
      nav.appendChild(btn);
    }

    // 2. Add tab pane
    if (!document.getElementById('tab-progress')) {
      const appBody = document.querySelector('.app-body');
      const tabDiv = document.createElement('div');
      tabDiv.id = 'tab-progress';
      tabDiv.className = 'tab-pane';
      tabDiv.innerHTML = `
        <aside class="sidebar">
          <div class="sidebar-section">
            <div class="sidebar-label">Analytics</div>
            <button class="sidebar-item active" onclick="showProgressSection('section-progress-overview')" id="pnav-overview">
              <span class="sidebar-icon">📊</span><span>Overview</span>
            </button>
          </div>
          <div class="sidebar-section">
            <div class="sidebar-label">Planning</div>
            <button class="sidebar-item" onclick="showProgressSection('section-schedule')" id="pnav-schedule">
              <span class="sidebar-icon">📅</span><span>Weekly Schedule</span>
            </button>
            <button class="sidebar-item" onclick="showProgressSection('section-gcal')" id="pnav-gcal">
              <span class="sidebar-icon">🔗</span><span>GCal Sync</span>
            </button>
          </div>
          <div class="sidebar-spacer"></div>
        </aside>

        <div class="content" id="progress-content">

          <!-- OVERVIEW SECTION -->
          <div id="section-progress-overview" class="section active">
            <div class="section-header">
              <div class="section-title">Progress Overview</div>
              <div class="section-subtitle">Your complete performance history across cases and drills.</div>
            </div>
            <div id="progress-overview-body">
              <!-- rendered by renderProgressOverview() -->
            </div>
          </div>

          <!-- SCHEDULE SECTION -->
          <div id="section-schedule" class="section">
            <div class="section-header">
              <div class="section-title">Weekly Schedule Planner</div>
              <div class="section-subtitle">Plan your case interview practice sessions for the week.</div>
            </div>
            <div id="schedule-body">
              <!-- rendered by renderWeeklySchedule() -->
            </div>
          </div>

          <!-- GCAL SECTION -->
          <div id="section-gcal" class="section">
            <div class="section-header">
              <div class="section-title">Google Calendar Sync</div>
              <div class="section-subtitle">Push your scheduled sessions directly to Google Calendar.</div>
            </div>
            <div id="gcal-body">
              <!-- rendered by renderGcalSection() -->
            </div>
          </div>

        </div><!-- /content -->
      `;
      appBody.appendChild(tabDiv);
    }
  }

  // ─── TAB SWITCHING ──────────────────────────────────────────────

  window.switchToProgressTab = function () {
    state.tab = 'progress';
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-progress').classList.add('active');
    document.querySelectorAll('.main-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.main-nav-btn').forEach(b => {
      if (b.textContent.includes('Progress')) b.classList.add('active');
    });
    renderProgressOverview();
  };

  window.showProgressSection = function (sectionId) {
    document.querySelectorAll('#tab-progress .section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('#tab-progress .sidebar-item').forEach(b => b.classList.remove('active'));
    const navMap = {
      'section-progress-overview': 'pnav-overview',
      'section-schedule': 'pnav-schedule',
      'section-gcal': 'pnav-gcal',
    };
    document.getElementById(navMap[sectionId])?.classList.add('active');
    if (sectionId === 'section-progress-overview') renderProgressOverview();
    if (sectionId === 'section-schedule') renderWeeklySchedule();
    if (sectionId === 'section-gcal') renderGcalSection();
  };

  // ─── PROGRESS OVERVIEW ──────────────────────────────────────────

  window.renderProgressOverview = function () {
    const el = document.getElementById('progress-overview-body');
    if (!el) return;
    const cases = state.stats.cases || [];
    const drills = state.stats.drills || [];

    // ── Stat cards ──
    const totalCases = cases.length;
    const avgScore = cases.length
      ? (cases.reduce((a, c) => a + (c.score || 0), 0) / cases.length).toFixed(1)
      : '—';
    const streak = calcCaseStreak(cases);
    const totalDrills = drills.length;
    const bestAcc = drills.length
      ? Math.max(...drills.map(d => d.accuracy || 0)).toFixed(0) + '%'
      : '—';

    const statsHTML = `
      <div class="progress-stats-row">
        <div class="stat-card"><div class="stat-card-val">${totalCases}</div><div class="stat-card-label">Total Cases Done</div></div>
        <div class="stat-card"><div class="stat-card-val">${avgScore}</div><div class="stat-card-label">Average Score</div></div>
        <div class="stat-card"><div class="stat-card-val">${streak}</div><div class="stat-card-label">Current Streak (days)</div></div>
        <div class="stat-card"><div class="stat-card-val">${totalDrills}</div><div class="stat-card-label">Total Drills Done</div></div>
        <div class="stat-card"><div class="stat-card-val">${bestAcc}</div><div class="stat-card-label">Best Drill Accuracy</div></div>
      </div>`;

    // ── Case performance chart (last 14 days) ──
    const caseChartHTML = buildCaseBarChart(cases);

    // ── Score trend table (last 15 cases) ──
    const recentCases = cases.slice(-15).reverse();
    const tableHTML = recentCases.length ? `
      <div class="card" style="margin-top: 16px">
        <div class="card-header" style="margin-bottom:0">
          <div class="card-title">Recent Case Sessions</div>
        </div>
        <div style="overflow-x:auto">
          <table class="score-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Case Type</th>
                <th>Score</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              ${recentCases.map(c => `
                <tr>
                  <td style="color:var(--text-muted)">${c.date}</td>
                  <td>${c.type || 'Practice'}</td>
                  <td><strong>${typeof c.score === 'number' ? c.score.toFixed(1) : c.score}</strong>/10</td>
                  <td><span class="pass-pill ${c.score >= 7 ? 'pass' : 'fail'}">${c.score >= 7 ? 'Pass' : 'Needs Work'}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>` : `<div class="card" style="margin-top:16px">
        <div style="text-align:center;padding:32px;color:var(--text-muted)">
          <div style="font-size:36px;margin-bottom:10px">📋</div>
          <div style="font-weight:700;color:var(--text);margin-bottom:4px">No cases yet</div>
          <div style="font-size:13px">Complete a case in the Case Interview tab to see your score history here.</div>
        </div>
      </div>`;

    // ── Drill accuracy chart ──
    const drillChartHTML = buildDrillBarChart(drills);

    el.innerHTML = statsHTML + caseChartHTML + tableHTML + drillChartHTML;
  };

  function calcCaseStreak(cases) {
    if (!cases.length) return 0;
    const daySet = new Set(cases.map(c => c.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (daySet.has(d.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  function buildCaseBarChart(cases) {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    const dayData = days.map(d => {
      const dStr = d.toDateString();
      const dayCases = cases.filter(c => c.date === dStr);
      const count = dayCases.length;
      const avg = count ? dayCases.reduce((a, c) => a + (c.score || 0), 0) / count : 0;
      return { date: d, count, avg };
    });
    const maxCount = Math.max(1, ...dayData.map(d => d.count));

    const bars = dayData.map(d => {
      const heightPct = d.count > 0 ? Math.max(8, Math.round((d.count / maxCount) * 100)) : 4;
      let colorClass = d.count === 0 ? 'bar-empty' : (d.avg >= 7 ? 'bar-green' : d.avg >= 5 ? 'bar-yellow' : 'bar-red');
      const tip = d.count > 0
        ? `${shortDate(d.date)}: ${d.count} case${d.count > 1 ? 's' : ''}, avg ${d.avg.toFixed(1)}`
        : `${shortDate(d.date)}: no cases`;
      return `<div class="bar-col">
        <div class="bar-col-inner ${colorClass}" style="height:${heightPct}%" data-tip="${tip}"></div>
        <span class="bar-col-label">${shortDate(d.date)}</span>
      </div>`;
    }).join('');

    return `<div class="card" style="margin-top:0">
      <div class="card-title">Case Activity — Last 14 Days</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:3px;margin-bottom:4px">Bar height = number of cases; color = avg score (green ≥7, yellow 5-7, red &lt;5)</div>
      <div class="bar-chart-wrap">
        <div class="bar-chart">${bars}</div>
      </div>
    </div>`;
  }

  function buildDrillBarChart(drills) {
    if (!drills.length) return `<div class="card" style="margin-top:16px">
      <div class="card-title">Drill Accuracy — Last 14 Sessions</div>
      <div style="padding:24px 0;text-align:center;color:var(--text-muted);font-size:13px">No drill history yet. Complete a Quick Drill to see your accuracy trend.</div>
    </div>`;

    const recent = drills.slice(-14);
    const maxAcc = 100;
    const bars = recent.map((d, i) => {
      const heightPct = Math.max(4, Math.round((d.accuracy / maxAcc) * 100));
      const colorClass = d.accuracy >= 80 ? 'bar-green' : d.accuracy >= 60 ? 'bar-yellow' : 'bar-red';
      const label = (i === 0 || i === Math.floor(recent.length / 2) || i === recent.length - 1) ? d.date.split(' ').slice(1, 3).join(' ') : '';
      return `<div class="bar-col">
        <div class="bar-col-inner ${colorClass}" style="height:${heightPct}%" data-tip="${d.date}: ${d.accuracy}% accuracy (${d.correct}/${d.total})"></div>
        <span class="bar-col-label">${label}</span>
      </div>`;
    }).join('');

    return `<div class="card" style="margin-top:16px">
      <div class="card-title">Drill Accuracy — Last ${recent.length} Sessions</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:3px;margin-bottom:4px">Bar height = accuracy %; hover for details</div>
      <div class="bar-chart-wrap">
        <div class="bar-chart">${bars}</div>
      </div>
    </div>`;
  }

  // ─── WEEKLY SCHEDULE ────────────────────────────────────────────

  window.renderWeeklySchedule = function () {
    const el = document.getElementById('schedule-body');
    if (!el) return;
    const ws = schedState.viewWeekStart;
    const sessions = getSessionsForWeek(ws);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Week navigation
    const weekLabel = `${shortDate(ws)} – ${shortDate(addDays(ws, 6))}`;

    // Grid columns: Mon(0) … Sun(6)
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const cols = dayNames.map((name, i) => {
      const date = addDays(ws, i);
      const isToday = isoDate(date) === isoDate(today);
      const daySessions = sessions
        .filter(s => s.dayOfWeek === i + 1)
        .sort((a, b) => a.time.localeCompare(b.time));

      const blocks = daySessions.map(s => {
        const typeClass = s.type === 'Math Drills' ? 'type-drill' : s.type === 'Full Session (Both)' ? 'type-both' : '';
        const syncedHTML = s.gcalEventId
          ? `<div class="session-block-synced">✓ In Google Calendar</div>`
          : '';
        return `<div class="session-block ${typeClass}">
          <button class="session-delete-btn" onclick="deleteSession('${s.id}')" title="Delete">✕</button>
          <div class="session-block-time">${formatTime(s.time)}</div>
          <div class="session-block-type">${s.type}</div>
          <div class="session-block-duration">${s.duration} min</div>
          ${s.notes ? `<div class="session-block-notes">${escapeHTML(s.notes)}</div>` : ''}
          ${syncedHTML}
        </div>`;
      }).join('');

      return `<div class="week-day-col${isToday ? ' today' : ''}">
        <div class="week-day-header">
          <div class="week-day-name">${name}</div>
          <div class="week-day-date">${date.getDate()}</div>
        </div>
        <div class="week-day-body">${blocks || ''}</div>
      </div>`;
    }).join('');

    // Weekly summary
    const totalSessions = sessions.length;
    const totalMins = sessions.reduce((a, s) => a + s.duration, 0);
    const hours = (totalMins / 60).toFixed(1);

    el.innerHTML = `
      <div class="week-nav">
        <button class="btn btn-secondary btn-sm" onclick="schedNavWeek(-1)">← Previous</button>
        <div class="week-nav-title">${weekLabel}</div>
        <button class="btn btn-secondary btn-sm" onclick="schedNavWeek(1)">Next →</button>
        <button class="btn btn-ghost btn-sm" onclick="schedGoToCurrentWeek()">Today</button>
      </div>

      <div class="week-grid">${cols}</div>

      <div class="week-summary">
        This week: <strong>${totalSessions} session${totalSessions !== 1 ? 's' : ''}</strong> planned,
        <strong>${hours} hour${hours !== '1.0' ? 's' : ''}</strong> of practice
      </div>

      <div class="card" style="margin-top:20px">
        <div class="card-title" style="margin-bottom:16px">Add Session</div>
        <div class="add-session-form" id="add-session-form">
          <div class="form-group">
            <label class="form-label">Day</label>
            <select class="form-control" id="sched-day">
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="7">Sunday</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Time</label>
            <input type="time" class="form-control" id="sched-time" value="09:00">
          </div>
          <div class="form-group">
            <label class="form-label">Duration</label>
            <select class="form-control" id="sched-duration">
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60" selected>60 min</option>
              <option value="90">90 min</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Type</label>
            <select class="form-control" id="sched-type">
              <option>Case Practice</option>
              <option>Math Drills</option>
              <option>Full Session (Both)</option>
            </select>
          </div>
          <div class="form-group" style="flex:2;min-width:200px">
            <label class="form-label">Notes (optional)</label>
            <input type="text" class="form-control" id="sched-notes" placeholder="e.g. Focus on M&A frameworks">
          </div>
          <div class="form-group" style="justify-content:flex-end">
            <label class="form-label" style="visibility:hidden">Add</label>
            <button class="btn btn-primary" onclick="addSession()">Add to Schedule</button>
          </div>
        </div>
      </div>`;

    // Pre-select today's day if we're on the current week
    const wsIso = isoDate(ws);
    const currentWsIso = isoDate(getWeekStart(new Date()));
    if (wsIso === currentWsIso) {
      const todayDow = today.getDay(); // 0=Sun … 6=Sat
      const mondayBased = todayDow === 0 ? 7 : todayDow; // Mon=1 … Sun=7
      const daySelect = document.getElementById('sched-day');
      if (daySelect) daySelect.value = String(mondayBased);
    }
  };

  window.schedNavWeek = function (direction) {
    schedState.viewWeekStart = addDays(schedState.viewWeekStart, direction * 7);
    renderWeeklySchedule();
  };

  window.schedGoToCurrentWeek = function () {
    schedState.viewWeekStart = getWeekStart(new Date());
    renderWeeklySchedule();
  };

  window.addSession = function () {
    const day = parseInt(document.getElementById('sched-day').value, 10);
    const time = document.getElementById('sched-time').value;
    const duration = parseInt(document.getElementById('sched-duration').value, 10);
    const type = document.getElementById('sched-type').value;
    const notes = document.getElementById('sched-notes').value.trim();

    if (!time) { toast('Please select a time.', 'error'); return; }

    const sessions = loadSessions();
    const newSession = {
      id: 'sess_' + Date.now(),
      dayOfWeek: day,
      weekStart: isoDate(schedState.viewWeekStart),
      time,
      duration,
      type,
      notes,
      gcalEventId: null,
    };
    sessions.push(newSession);
    saveSessions(sessions);
    document.getElementById('sched-notes').value = '';
    toast('Session added to schedule.', 'success');
    renderWeeklySchedule();
  };

  window.deleteSession = function (id) {
    const sessions = loadSessions().filter(s => s.id !== id);
    saveSessions(sessions);
    toast('Session removed.', 'info');
    renderWeeklySchedule();
    // Refresh gcal section if open
    const gcalSection = document.getElementById('section-gcal');
    if (gcalSection && gcalSection.classList.contains('active')) renderGcalSection();
  };

  // ─── GCAL SECTION ───────────────────────────────────────────────

  window.renderGcalSection = function () {
    const el = document.getElementById('gcal-body');
    if (!el) return;

    const sessions = getSessionsForWeek(schedState.viewWeekStart);
    const weekLabel = `${shortDate(schedState.viewWeekStart)} – ${shortDate(addDays(schedState.viewWeekStart, 6))}`;

    const setupHTML = `
      <div class="card" style="margin-bottom:16px">
        <div class="card-title" style="margin-bottom:14px">Setup</div>
        <ol class="gcal-setup-steps">
          <li>Go to <a href="https://console.cloud.google.com" target="_blank" style="color:var(--primary);font-weight:600">Google Cloud Console</a>, create a project, enable the <strong>Google Calendar API</strong>.</li>
          <li>Under <strong>APIs &amp; Services → Credentials</strong>, create an <strong>OAuth 2.0 Web Client ID</strong>.</li>
          <li>Add <code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:12px">https://anandijoshi.github.io</code> as an authorized JavaScript origin.</li>
          <li>Paste your OAuth Client ID below and click Connect.</li>
        </ol>
        <div class="form-group" style="max-width:480px;margin-bottom:12px">
          <label class="form-label">Google OAuth Client ID</label>
          <input type="text" class="form-control" id="gcal-client-id" placeholder="xxxxxxxx.apps.googleusercontent.com" value="${escapeHTML(schedState.gcalClientId)}">
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          ${schedState.gcalToken ? `
            <div class="gcal-connected-badge">Connected${schedState.gcalUserEmail ? ' as ' + escapeHTML(schedState.gcalUserEmail) : ''}</div>
            <button class="btn btn-secondary btn-sm" onclick="disconnectGcal()">Disconnect</button>
          ` : `
            <button class="btn btn-primary" onclick="connectGcal()">Connect Google Calendar</button>
          `}
        </div>
      </div>`;

    const syncHTML = schedState.gcalToken ? `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Sync Sessions to Calendar</div>
            <div class="card-subtitle">Week of ${weekLabel}</div>
          </div>
          <button class="btn btn-primary" onclick="syncToGcal()" id="gcal-sync-btn">Sync to Google Calendar</button>
        </div>
        ${sessions.length ? `
          <div style="border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;margin-top:4px">
            ${sessions.map(s => {
              const dayName = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][s.dayOfWeek - 1];
              const date = addDays(schedState.viewWeekStart, s.dayOfWeek - 1);
              return `<div class="session-sync-row">
                <div>
                  <span class="sync-status-dot ${s.gcalEventId ? 'synced' : 'unsynced'}"></span>
                  <strong>${dayName} ${shortDate(date)}</strong> — ${formatTime(s.time)}, ${s.duration} min — ${s.type}
                  ${s.notes ? `<span style="color:var(--text-muted)"> · ${escapeHTML(s.notes)}</span>` : ''}
                </div>
                <div style="font-size:12px;color:${s.gcalEventId ? 'var(--success)' : 'var(--text-muted)'}">
                  ${s.gcalEventId ? 'Synced' : 'Not synced'}
                </div>
              </div>`;
            }).join('')}
          </div>
        ` : `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">No sessions scheduled for this week. Add sessions in the Weekly Schedule tab first.</div>`}
      </div>` : `
      <div class="card" style="text-align:center;padding:32px">
        <div style="font-size:36px;margin-bottom:12px">📆</div>
        <div style="font-weight:700;color:var(--text);margin-bottom:6px">Connect Google Calendar to sync sessions</div>
        <div style="font-size:13px;color:var(--text-muted)">Enter your OAuth Client ID above and click Connect.</div>
      </div>`;

    el.innerHTML = setupHTML + syncHTML;
  };

  window.connectGcal = function () {
    const clientIdInput = document.getElementById('gcal-client-id');
    const clientId = clientIdInput ? clientIdInput.value.trim() : schedState.gcalClientId;
    if (!clientId) {
      toast('Enter your Google OAuth Client ID first.', 'error');
      return;
    }
    schedState.gcalClientId = clientId;
    localStorage.setItem(GCAL_CLIENT_ID_KEY, clientId);
    loadGoogleLibraries(() => {
      try {
        schedState.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email',
          callback: (tokenResponse) => {
            if (tokenResponse.error) {
              toast('Google authorization failed: ' + tokenResponse.error, 'error');
              return;
            }
            schedState.gcalToken = tokenResponse.access_token;
            // Try to get user email
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${schedState.gcalToken}` }
            }).then(r => r.json()).then(info => {
              schedState.gcalUserEmail = info.email || null;
              toast('Connected to Google Calendar' + (info.email ? ' as ' + info.email : '') + '.', 'success');
              renderGcalSection();
            }).catch(() => {
              toast('Connected to Google Calendar.', 'success');
              renderGcalSection();
            });
          },
        });
        schedState.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        toast('Failed to initialize Google auth: ' + err.message, 'error');
      }
    });
  };

  window.disconnectGcal = function () {
    if (schedState.gcalToken) {
      try { google.accounts.oauth2.revoke(schedState.gcalToken); } catch {}
    }
    schedState.gcalToken = null;
    schedState.gcalUserEmail = null;
    schedState.gcalClientId = '';
    localStorage.removeItem(GCAL_CLIENT_ID_KEY);
    toast('Disconnected from Google Calendar.', 'info');
    renderGcalSection();
  };

  window.syncToGcal = async function () {
    if (!schedState.gcalToken) { toast('Not connected to Google Calendar.', 'error'); return; }
    const sessions = getSessionsForWeek(schedState.viewWeekStart);
    const unsynced = sessions.filter(s => !s.gcalEventId);
    if (!unsynced.length) { toast('All sessions are already synced.', 'info'); return; }

    const btn = document.getElementById('gcal-sync-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Syncing...'; }

    let synced = 0;
    let failed = 0;
    const allSessions = loadSessions();

    for (const session of unsynced) {
      const date = addDays(schedState.viewWeekStart, session.dayOfWeek - 1);
      const dateStr = isoDate(date);
      const startISO = `${dateStr}T${session.time}:00`;
      const endISO = addMinutes(dateStr, session.time, session.duration);

      const eventBody = {
        summary: `Case Coach: ${session.type}`,
        description: session.notes || 'Case interview practice session',
        start: { dateTime: startISO, timeZone: 'America/Los_Angeles' },
        end: { dateTime: endISO, timeZone: 'America/Los_Angeles' },
      };

      try {
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${schedState.gcalToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventBody),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (res.status === 401) {
            toast('Google token expired. Please reconnect.', 'error');
            schedState.gcalToken = null;
            renderGcalSection();
            return;
          }
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }
        const event = await res.json();
        // Store gcalEventId back on session
        const idx = allSessions.findIndex(s => s.id === session.id);
        if (idx !== -1) allSessions[idx].gcalEventId = event.id;
        synced++;
      } catch (err) {
        console.error('Sync error for session', session.id, err);
        failed++;
      }
    }

    saveSessions(allSessions);
    if (btn) { btn.disabled = false; btn.textContent = 'Sync to Google Calendar'; }

    if (synced > 0 && failed === 0) toast(`${synced} session${synced > 1 ? 's' : ''} synced to Google Calendar.`, 'success');
    else if (synced > 0) toast(`${synced} synced, ${failed} failed.`, 'info');
    else toast(`Sync failed for all ${failed} session${failed > 1 ? 's' : ''}. Check your token.`, 'error');

    renderGcalSection();
  };

  // ─── GOOGLE LIBRARY LOADER ──────────────────────────────────────

  function loadGoogleLibraries(callback) {
    let gisReady = schedState.gisLoaded;
    let checkReady = () => { if (gisReady) callback(); };

    if (!gisReady) {
      if (!document.getElementById('gis-script')) {
        const script = document.createElement('script');
        script.id = 'gis-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          schedState.gisLoaded = true;
          gisReady = true;
          checkReady();
        };
        script.onerror = () => toast('Failed to load Google Identity Services library.', 'error');
        document.head.appendChild(script);
      } else {
        // Script tag exists but may still be loading
        const existing = document.getElementById('gis-script');
        existing.addEventListener('load', () => {
          schedState.gisLoaded = true;
          gisReady = true;
          checkReady();
        });
      }
    } else {
      checkReady();
    }
  }

  // ─── UTILITY ────────────────────────────────────────────────────

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ─── INIT ────────────────────────────────────────────────────────

  function initSchedule() {
    injectCSS();
    injectHTML();
  }

  document.addEventListener('DOMContentLoaded', initSchedule);

})();
