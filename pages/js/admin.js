document.addEventListener('DOMContentLoaded', () => {

  /* ================= Sidebar mobile toggle ================= */
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const menuToggle = document.getElementById('menuToggle');

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  }
  menuToggle.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);

  /* ================= Section tab switching ================= */
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.admin-section');
  const sectionCrumb = document.getElementById('sectionCrumb');
  const sectionLabels = {
    overview: 'Overview',
    users: 'User Management',
    applications: 'Applications',
    analytics: 'Platform Analytics',
    system: 'System Status'
  };

  function switchSection(key) {
    sections.forEach(s => s.classList.toggle('active', s.id === `section-${key}`));
    navItems.forEach(n => n.classList.toggle('active', n.dataset.section === key));
    sectionCrumb.textContent = `/ ${sectionLabels[key]}`;
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(item.dataset.section);
    });
  });

  /* ================= Toast ================= */
  const saveToast = document.getElementById('saveToast');
  let toastTimer;
  function showToast(message) {
    saveToast.textContent = `✅ ${message}`;
    saveToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => saveToast.classList.remove('show'), 3000);
  }

  /* ================= Storage keys ================= */
  const KEY_APPS = 'topg_admin_applications';
  const KEY_USERS = 'topg_admin_users';
  const KEY_ACTIVITY = 'topg_admin_activity';

  /* ================= Sample data generators ================= */
  const FIRST_NAMES = ['James','Maria','Chris','Aisha','Daniel','Sofia','Ethan','Priya','Lucas','Nina','Omar','Grace','Noah','Lena','Victor','Amara','Felix','Ivy','Marcus','Zara'];
  const LAST_NAMES = ['Rivera','Chen','Okafor','Patel','Novak','Kim','Santos','Dubois','Hartman','Okonkwo','Lindqvist','Rossi','Tanaka','Kowalski','Mensah','Ortiz','Fischer','Haddad','Thompson','Nilsson'];
  const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

  function randomName() {
    const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${f} ${l}`;
  }

  function emailFromName(name) {
    return name.toLowerCase().replace(/\s+/g, '.') + '@example.com';
  }

  function randomPastDate(maxDaysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * maxDaysAgo));
    return d.toISOString();
  }

  function generateApplications() {
    const statuses = ['pending','pending','pending','pending','pending','approved','approved','approved','rejected','rejected'];
    const apps = [];
    for (let i = 0; i < 10; i++) {
      const name = randomName();
      apps.push({
        id: `APP-${1000 + i}`,
        name,
        email: emailFromName(name),
        appliedOn: randomPastDate(30),
        experience: EXPERIENCE_LEVELS[Math.floor(Math.random() * EXPERIENCE_LEVELS.length)],
        status: statuses[i]
      });
    }
    return apps;
  }

  function generateUsers() {
    const users = [];
    for (let i = 0; i < 18; i++) {
      const name = randomName();
      users.push({
        id: `TG-${2000 + i}`,
        name,
        email: emailFromName(name),
        registeredOn: randomPastDate(180),
        status: Math.random() < 0.85 ? 'active' : 'suspended'
      });
    }
    return users;
  }

  function generateInitialActivity() {
    const now = Date.now();
    return [
      { text: 'New application submitted by Priya Patel', time: now - 1000 * 60 * 20 },
      { text: 'User Marcus Thompson registered an account', time: now - 1000 * 60 * 90 },
      { text: 'Application from Lena Fischer was approved', time: now - 1000 * 60 * 60 * 5 },
      { text: 'User Omar Haddad was suspended', time: now - 1000 * 60 * 60 * 20 },
      { text: 'Application from Victor Rossi was rejected', time: now - 1000 * 60 * 60 * 36 },
      { text: 'User Grace Mensah reactivated after review', time: now - 1000 * 60 * 60 * 72 }
    ];
  }

  /* ================= Load / persist state ================= */
  function loadState() {
    let apps = JSON.parse(localStorage.getItem(KEY_APPS) || 'null');
    let users = JSON.parse(localStorage.getItem(KEY_USERS) || 'null');
    let activity = JSON.parse(localStorage.getItem(KEY_ACTIVITY) || 'null');

    if (!apps) { apps = generateApplications(); localStorage.setItem(KEY_APPS, JSON.stringify(apps)); }
    if (!users) { users = generateUsers(); localStorage.setItem(KEY_USERS, JSON.stringify(users)); }
    if (!activity) { activity = generateInitialActivity(); localStorage.setItem(KEY_ACTIVITY, JSON.stringify(activity)); }

    return { apps, users, activity };
  }

  let { apps, users, activity } = loadState();

  function persist() {
    localStorage.setItem(KEY_APPS, JSON.stringify(apps));
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    localStorage.setItem(KEY_ACTIVITY, JSON.stringify(activity));
  }

  function logActivity(text) {
    activity.unshift({ text, time: Date.now() });
    activity = activity.slice(0, 40);
  }

  /* ================= Date / time helpers ================= */
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  /* ================= Overview rendering ================= */
  function renderOverview() {
    document.getElementById('statTotalUsers').textContent = users.length;
    document.getElementById('statPendingApps').textContent = apps.filter(a => a.status === 'pending').length;
    document.getElementById('statApprovedApps').textContent = apps.filter(a => a.status === 'approved').length;
    document.getElementById('statActiveUsers').textContent = users.filter(u => u.status === 'active').length;

    renderActivityList('activityLogOverview', 6);
  }

  function renderActivityList(elementId, limit) {
    const container = document.getElementById(elementId);
    const items = limit ? activity.slice(0, limit) : activity;
    container.innerHTML = items.map(item => `
      <li>
        <span class="activity-text">${item.text}</span>
        <span class="activity-time">${timeAgo(item.time)}</span>
      </li>
    `).join('') || '<li><span class="activity-text">No activity yet.</span></li>';
  }

  /* ================= Applications rendering ================= */
  const appSearchInput = document.getElementById('appSearch');
  const appStatusFilter = document.getElementById('appStatusFilter');

  function getFilteredApps() {
    const q = appSearchInput.value.trim().toLowerCase();
    const statusVal = appStatusFilter.value;
    return apps.filter(a => {
      const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
      const matchesStatus = statusVal === 'all' || a.status === statusVal;
      return matchesQuery && matchesStatus;
    });
  }

  function renderApplications() {
    const filtered = getFilteredApps();
    const tbody = document.getElementById('appsTableBody');
    document.getElementById('appResultCount').textContent = `${filtered.length} application${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="cell-muted">No applications match your filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(app => {
      let actionsHtml;
      if (app.status === 'pending') {
        actionsHtml = `
          <div class="action-btns">
            <button class="btn-approve" data-id="${app.id}" data-action="approve">Approve</button>
            <button class="btn-reject" data-id="${app.id}" data-action="reject">Reject</button>
          </div>`;
      } else {
        actionsHtml = `<span class="decision-note">Decision recorded (demo)</span>`;
      }

      return `
        <tr>
          <td>${app.name}</td>
          <td class="cell-muted">${app.email}</td>
          <td class="cell-muted">${formatDate(app.appliedOn)}</td>
          <td class="cell-muted">${app.experience}</td>
          <td><span class="badge ${app.status}">${app.status}</span></td>
          <td>${actionsHtml}</td>
        </tr>`;
    }).join('');
  }

  document.getElementById('appsTableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const app = apps.find(a => a.id === id);
    if (!app) return;

    if (action === 'approve') {
      app.status = 'approved';
      logActivity(`Application from ${app.name} was approved by admin`);
      showToast(`Application approved (demo only — not synced to backend)`);
    } else if (action === 'reject') {
      app.status = 'rejected';
      logActivity(`Application from ${app.name} was rejected by admin`);
      showToast(`Application rejected (demo only — not synced to backend)`);
    }

    persist();
    renderApplications();
    renderOverview();
    renderAnalytics();
  });

  appSearchInput.addEventListener('input', renderApplications);
  appStatusFilter.addEventListener('change', renderApplications);

  /* ================= Users rendering ================= */
  const userSearchInput = document.getElementById('userSearch');
  const userStatusFilter = document.getElementById('userStatusFilter');

  function getFilteredUsers() {
    const q = userSearchInput.value.trim().toLowerCase();
    const statusVal = userStatusFilter.value;
    return users.filter(u => {
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesStatus = statusVal === 'all' || u.status === statusVal;
      return matchesQuery && matchesStatus;
    });
  }

  function renderUsers() {
    const filtered = getFilteredUsers();
    const tbody = document.getElementById('usersTableBody');
    document.getElementById('userResultCount').textContent = `${filtered.length} user${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="cell-muted">No users match your filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(user => {
      const actionHtml = user.status === 'active'
        ? `<button class="btn-suspend" data-id="${user.id}" data-action="suspend">Suspend</button>`
        : `<button class="btn-reactivate" data-id="${user.id}" data-action="reactivate">Reactivate</button>`;

      return `
        <tr>
          <td class="cell-muted">${user.id}</td>
          <td>${user.name}</td>
          <td class="cell-muted">${user.email}</td>
          <td class="cell-muted">${formatDate(user.registeredOn)}</td>
          <td><span class="badge ${user.status}">${user.status}</span></td>
          <td><div class="action-btns">${actionHtml}</div></td>
        </tr>`;
    }).join('');
  }

  document.getElementById('usersTableBody').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (action === 'suspend') {
      user.status = 'suspended';
      logActivity(`User ${user.name} was suspended by admin`);
      showToast(`User suspended (demo only — not synced to backend)`);
    } else if (action === 'reactivate') {
      user.status = 'active';
      logActivity(`User ${user.name} was reactivated by admin`);
      showToast(`User reactivated (demo only — not synced to backend)`);
    }

    persist();
    renderUsers();
    renderOverview();
  });

  userSearchInput.addEventListener('input', renderUsers);
  userStatusFilter.addEventListener('change', renderUsers);

  /* ================= Analytics ================= */
  let registrationChart, approvalChart;
  Chart.defaults.font.family = 'Inter';
  Chart.defaults.color = '#9aa0a6';
  const GRID_COLOR = 'rgba(255,255,255,0.05)';

  function getRegistrationCountsByMonth() {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), count: 0 });
    }
    users.forEach(u => {
      const d = new Date(u.registeredOn);
      const match = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (match) match.count++;
    });
    return months;
  }

  function renderAnalytics() {
    const months = getRegistrationCountsByMonth();
    const ctx1 = document.getElementById('registrationChart').getContext('2d');
    if (registrationChart) registrationChart.destroy();
    registrationChart = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: months.map(m => m.label),
        datasets: [{
          label: 'New Users',
          data: months.map(m => m.count),
          backgroundColor: '#10d97a',
          borderRadius: 6,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: GRID_COLOR }, ticks: { precision: 0 } }
        }
      }
    });

    const approvedCount = apps.filter(a => a.status === 'approved').length;
    const pendingCount = apps.filter(a => a.status === 'pending').length;
    const rejectedCount = apps.filter(a => a.status === 'rejected').length;

    document.getElementById('legendApproved').textContent = approvedCount;
    document.getElementById('legendPending').textContent = pendingCount;
    document.getElementById('legendRejected').textContent = rejectedCount;

    const ctx2 = document.getElementById('approvalChart').getContext('2d');
    if (approvalChart) approvalChart.destroy();
    approvalChart = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [{
          data: [approvedCount, pendingCount, rejectedCount],
          backgroundColor: ['#10d97a', '#e0b23c', '#f04c4c'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: { legend: { display: false } }
      }
    });

    renderActivityList('activityLogFull', null);
  }

  /* ================= System status recheck ================= */
  document.getElementById('recheckBtn').addEventListener('click', () => {
    document.getElementById('lastChecked').textContent = 'just now';
    showToast('Status refreshed — this is a static preview, no real system check was performed.');
  });

  /* ================= Reset demo data ================= */
  document.getElementById('resetDemoBtn').addEventListener('click', () => {
    if (!confirm('Reset all demo applications, users, and activity logs back to fresh sample data?')) return;
    localStorage.removeItem(KEY_APPS);
    localStorage.removeItem(KEY_USERS);
    localStorage.removeItem(KEY_ACTIVITY);
    const fresh = loadState();
    apps = fresh.apps;
    users = fresh.users;
    activity = fresh.activity;
    renderAll();
    showToast('Demo data reset successfully.');
  });

  /* ================= Render everything ================= */
  function renderAll() {
    renderOverview();
    renderApplications();
    renderUsers();
    renderAnalytics();
  }

  renderAll();

});
