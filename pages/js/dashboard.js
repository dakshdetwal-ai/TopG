// ===================================================
// TopG Algo — Trader Dashboard Logic
// FRONTEND PROTOTYPE ONLY — all data shown is sample/demo data.
// No real trading account, bot or backend is connected.
// ===================================================

// ---- Sidebar toggle (mobile) ----
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('active');
});

sidebarOverlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
});

// ---- Sidebar nav active state + smooth scroll ----
const navItems = document.querySelectorAll('.nav-item[data-section]');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const sectionId = item.getAttribute('data-section');
    const target = document.getElementById(sectionId);

    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Close sidebar on mobile after navigation
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  });
});

// ===================================================
// Equity Curve Chart (Canvas based, sample data)
// ===================================================
const canvas = document.getElementById('equityChart');
const ctx = canvas.getContext('2d');

// Sample datasets for different timeframes
const chartDatasets = {
  '1D': generateSampleData(24, 10400, 150),
  '7D': generateSampleData(7, 10200, 400),
  '30D': generateSampleData(30, 9800, 800),
  'All': generateSampleData(90, 8500, 2200)
};

function generateSampleData(points, base, volatility) {
  const data = [];
  let value = base;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.42) * (volatility / points) * 3;
    data.push(Math.max(base * 0.8, value));
  }
  return data;
}

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width - 48; // account for padding
  canvas.height = rect.height - 48;
}

function drawChart(data) {
  resizeCanvas();
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 10;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - padding - ((value - min) / range) * (h - padding * 2);
    return { x, y };
  });

  // Gradient fill under line
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, 'rgba(16, 217, 122, 0.25)');
  gradient.addColorStop(1, 'rgba(16, 217, 122, 0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = '#10d97a';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // End point dot
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#10d97a';
  ctx.fill();
  ctx.strokeStyle = '#0a0b0d';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Grid lines (horizontal, subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

let currentRange = '30D';
drawChart(chartDatasets[currentRange]);

// ---- Chart timeframe filter buttons ----
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRange = btn.getAttribute('data-range');
    drawChart(chartDatasets[currentRange]);
  });
});

// Redraw chart on window resize
window.addEventListener('resize', () => {
  drawChart(chartDatasets[currentRange]);
});

// ===================================================
// Bot Control Panel (visual preview only)
// ===================================================
const startBotBtn = document.getElementById('startBotBtn');
const stopBotBtn = document.getElementById('stopBotBtn');
const botStatusDot = document.getElementById('botStatusDot');
const botStatusText = document.getElementById('botStatusText');

startBotBtn.addEventListener('click', () => {
  botStatusDot.classList.add('running');
  botStatusText.textContent = 'Running';
  startBotBtn.disabled = true;
  stopBotBtn.disabled = false;
});

stopBotBtn.addEventListener('click', () => {
  botStatusDot.classList.remove('running');
  botStatusText.textContent = 'Stopped';
  startBotBtn.disabled = false;
  stopBotBtn.disabled = true;
});

// ---- Risk slider ----
const riskSlider = document.getElementById('riskSlider');
const riskValue = document.getElementById('riskValue');

riskSlider.addEventListener('input', () => {
  riskValue.textContent = parseFloat(riskSlider.value).toFixed(1) + '%';
});

// ===================================================
// Recent Trades Table (sample data)
// ===================================================
const sampleTrades = [
  { symbol: 'XAUUSD', direction: 'Buy', entry: '2034.50', exit: '2041.20', pl: '+67.00', status: 'Closed' },
  { symbol: 'XAUUSD', direction: 'Sell', entry: '2045.80', exit: '2039.10', pl: '+67.00', status: 'Closed' },
  { symbol: 'XAUUSD', direction: 'Buy', entry: '2028.30', exit: '2022.90', pl: '-54.00', status: 'Closed' },
  { symbol: 'XAUUSD', direction: 'Buy', entry: '2039.00', exit: '2048.75', pl: '+97.50', status: 'Closed' },
  { symbol: 'XAUUSD', direction: 'Sell', entry: '2052.10', exit: '2057.40', pl: '-53.00', status: 'Closed' },
  { symbol: 'XAUUSD', direction: 'Buy', entry: '2031.60', exit: '2031.60', pl: '0.00', status: 'Open' },
  { symbol: 'XAUUSD', direction: 'Sell', entry: '2048.90', exit: '2041.30', pl: '+76.00', status: 'Closed' },
  { symbol: 'XAUUSD', direction: 'Buy', entry: '2025.40', exit: '2018.70', pl: '-67.00', status: 'Closed' },
];

const tradesTableBody = document.getElementById('tradesTableBody');

function renderTrades(filter = 'all') {
  tradesTableBody.innerHTML = '';

  const filtered = sampleTrades.filter(trade => {
    const plValue = parseFloat(trade.pl);
    if (filter === 'win') return plValue > 0;
    if (filter === 'loss') return plValue < 0;
    return true;
  });

  if (filtered.length === 0) {
    tradesTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-faint); padding:30px;">No trades match this filter.</td></tr>`;
    return;
  }

  filtered.forEach(trade => {
    const plValue = parseFloat(trade.pl);
    const plClass = plValue > 0 ? 'pl-positive' : plValue < 0 ? 'pl-negative' : '';
    const directionClass = trade.direction === 'Buy' ? 'buy' : 'sell';
    const statusClass = trade.status === 'Closed' ? 'closed' : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.symbol}</td>
      <td><span class="direction-badge ${directionClass}">${trade.direction}</span></td>
      <td>${trade.entry}</td>
      <td>${trade.exit}</td>
      <td class="${plClass}">${plValue > 0 ? '+' : ''}${trade.pl}</td>
      <td><span class="status-badge-table ${statusClass}">${trade.status}</span></td>
    `;
    tradesTableBody.appendChild(row);
  });
}

renderTrades('all');

// ---- Table filter buttons ----
const tableFilterBtns = document.querySelectorAll('.table-filter-btn');
tableFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tableFilterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTrades(btn.getAttribute('data-filter'));
  });
});
