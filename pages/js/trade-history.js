// ===================================================
// TopG Algo — Trade History Page Logic
// FRONTEND PROTOTYPE ONLY — all data shown is sample/demo data.
// No real trading account or MT5 connection exists.
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

// ===================================================
// Sample Trade Data
// ===================================================
const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY'];
const sampleTrades = [];

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date;
}

function generateSampleTrades(count) {
  for (let i = 1; i <= count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = Math.random() > 0.5 ? 'Buy' : 'Sell';
    const daysAgo = Math.floor(Math.random() * 95);
    const isOpen = i <= 2; // first couple of trades are "open"
    const basePrice = symbol === 'XAUUSD' ? 2030 + Math.random() * 40 :
                       symbol === 'EURUSD' ? 1.07 + Math.random() * 0.02 :
                       symbol === 'GBPUSD' ? 1.25 + Math.random() * 0.02 :
                       148 + Math.random() * 3;

    const decimals = symbol === 'XAUUSD' ? 2 : symbol === 'USDJPY' ? 3 : 5;
    const entry = basePrice;
    const plDollar = isOpen ? 0 : parseFloat(((Math.random() - 0.42) * 150).toFixed(2));
    const priceMove = plDollar / 100;
    const exit = isOpen ? entry : entry + (type === 'Buy' ? priceMove : -priceMove);

    const sl = type === 'Buy' ? entry - Math.abs(priceMove) - 2 : entry + Math.abs(priceMove) + 2;
    const tp = type === 'Buy' ? entry + Math.abs(priceMove) + 3 : entry - Math.abs(priceMove) - 3;

    sampleTrades.push({
      id: `TG-${10000 + i}`,
      datetime: randomDate(daysAgo),
      symbol,
      type,
      lot: (Math.random() * 1.5 + 0.1).toFixed(2),
      entry: entry.toFixed(decimals),
      exit: exit.toFixed(decimals),
      sl: sl.toFixed(decimals),
      tp: tp.toFixed(decimals),
      pl: plDollar,
      status: isOpen ? 'Open' : 'Closed'
    });
  }
}

generateSampleTrades(42);

// ===================================================
// State
// ===================================================
let filteredTrades = [...sampleTrades];
let currentSort = 'date-desc';

// ===================================================
// DOM References
// ===================================================
const historyTableBody = document.getElementById('historyTableBody');
const resultsCount = document.getElementById('resultsCount');

const dateRangeFilter = document.getElementById('dateRangeFilter');
const symbolFilter = document.getElementById('symbolFilter');
const typeFilter = document.getElementById('typeFilter');
const resultFilter = document.getElementById('resultFilter');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

const totalTradesStat = document.getElementById('totalTradesStat');
const winningTradesStat = document.getElementById('winningTradesStat');
const losingTradesStat = document.getElementById('losingTradesStat');
const netPlStat = document.getElementById('netPlStat');
const netPlCard = document.getElementById('netPlCard');

const detailsOverlay = document.getElementById('detailsOverlay');
const detailsPanel = document.getElementById('detailsPanel');
const detailsClose = document.getElementById('detailsClose');
const detailsBody = document.getElementById('detailsBody');

const exportCsvBtn = document.getElementById('exportCsvBtn');

// ===================================================
// Formatting Helpers
// ===================================================
function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatPL(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}$${value.toFixed(2)}`;
}

// ===================================================
// Filtering Logic
// ===================================================
function applyFilters() {
  const dateRange = dateRangeFilter.value;
  const symbol = symbolFilter.value;
  const type = typeFilter.value;
  const result = resultFilter.value;
  const search = searchInput.value.trim().toLowerCase();

  const now = new Date();

  filteredTrades = sampleTrades.filter(trade => {
    // Date range filter
    if (dateRange !== 'all') {
      const daysDiff = (now - trade.datetime) / (1000 * 60 * 60 * 24);
      if (dateRange === '7d' && daysDiff > 7) return false;
      if (dateRange === '30d' && daysDiff > 30) return false;
      if (dateRange === '90d' && daysDiff > 90) return false;
    }

    // Symbol filter
    if (symbol !== 'all' && trade.symbol !== symbol) return false;

    // Type filter
    if (type !== 'all' && trade.type !== type) return false;

    // Result filter
    if (result === 'win' && trade.pl <= 0) return false;
    if (result === 'loss' && trade.pl >= 0) return false;

    // Search filter
    if (search && !trade.id.toLowerCase().includes(search)) return false;

    return true;
  });

  applySort();
  renderTable();
  updateStats();
}

function applySort() {
  filteredTrades.sort((a, b) => {
    switch (currentSort) {
      case 'date-desc': return b.datetime - a.datetime;
      case 'date-asc': return a.datetime - b.datetime;
      case 'pl-desc': return b.pl - a.pl;
      case 'pl-asc': return a.pl - b.pl;
      default: return 0;
    }
  });
}

// ===================================================
// Render Table
// ===================================================
function renderTable() {
  historyTableBody.innerHTML = '';

  if (filteredTrades.length === 0) {
    historyTableBody.innerHTML = `
      <tr class="no-results">
        <td colspan="11">No trades match your current filters.</td>
      </tr>`;
    resultsCount.textContent = 'Showing 0 of ' + sampleTrades.length + ' trades';
    return;
  }

  filteredTrades.forEach(trade => {
    const plClass = trade.pl > 0 ? 'pl-positive' : trade.pl < 0 ? 'pl-negative' : '';
    const directionClass = trade.type === 'Buy' ? 'buy' : 'sell';
    const statusClass = trade.status === 'Closed' ? 'closed' : '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="trade-id-cell">${trade.id}</td>
      <td>${formatDateTime(trade.datetime)}</td>
      <td>${trade.symbol}</td>
      <td><span class="direction-badge ${directionClass}">${trade.type}</span></td>
      <td>${trade.lot}</td>
      <td>${trade.entry}</td>
      <td>${trade.status === 'Open' ? '—' : trade.exit}</td>
      <td>${trade.sl}</td>
      <td>${trade.tp}</td>
      <td class="${plClass}">${trade.status === 'Open' ? '—' : formatPL(trade.pl)}</td>
      <td><span class="status-badge-table ${statusClass}">${trade.status}</span></td>
    `;
    row.addEventListener('click', () => openDetailsPanel(trade));
    historyTableBody.appendChild(row);
  });

  resultsCount.textContent = `Showing ${filteredTrades.length} of ${sampleTrades.length} trades`;
}

// ===================================================
// Update Summary Stats
// ===================================================
function updateStats() {
  const closedTrades = filteredTrades.filter(t => t.status === 'Closed');
  const wins = closedTrades.filter(t => t.pl > 0);
  const losses = closedTrades.filter(t => t.pl < 0);
  const netPl = closedTrades.reduce((sum, t) => sum + t.pl, 0);

  totalTradesStat.textContent = filteredTrades.length;
  winningTradesStat.textContent = wins.length;
  losingTradesStat.textContent = losses.length;
  netPlStat.textContent = formatPL(netPl);

  netPlCard.classList.remove('positive', 'negative');
  netPlCard.classList.add(netPl >= 0 ? 'positive' : 'negative');
}

// ===================================================
// Trade Details Panel
// ===================================================
function openDetailsPanel(trade) {
  const plClass = trade.pl > 0 ? 'positive' : trade.pl < 0 ? 'negative' : '';

  detailsBody.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Trade ID</span>
      <span class="detail-value">${trade.id}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Date & Time</span>
      <span class="detail-value">${formatDateTime(trade.datetime)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Symbol</span>
      <span class="detail-value">${trade.symbol}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Type</span>
      <span class="detail-value">${trade.type}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Lot Size</span>
      <span class="detail-value">${trade.lot}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Entry Price</span>
      <span class="detail-value">${trade.entry}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Exit Price</span>
      <span class="detail-value">${trade.status === 'Open' ? 'Position still open' : trade.exit}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Stop Loss</span>
      <span class="detail-value">${trade.sl}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Take Profit</span>
      <span class="detail-value">${trade.tp}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Profit/Loss</span>
      <span class="detail-value ${plClass}">${trade.status === 'Open' ? 'Pending' : formatPL(trade.pl)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Status</span>
      <span class="detail-value">${trade.status}</span>
    </div>
  `;

  detailsPanel.classList.add('open');
  detailsOverlay.classList.add('active');
}

function closeDetailsPanel() {
  detailsPanel.classList.remove('open');
  detailsOverlay.classList.remove('active');
}

detailsClose.addEventListener('click', closeDetailsPanel);
detailsOverlay.addEventListener('click', closeDetailsPanel);

// ===================================================
// CSV Export
// ===================================================
function exportToCSV() {
  const headers = ['Trade ID', 'Date & Time', 'Symbol', 'Type', 'Lot Size', 'Entry', 'Exit', 'SL', 'TP', 'P/L', 'Status'];

  const rows = filteredTrades.map(trade => [
    trade.id,
    formatDateTime(trade.datetime),
    trade.symbol,
    trade.type,
    trade.lot,
    trade.entry,
    trade.status === 'Open' ? 'N/A' : trade.exit,
    trade.sl,
    trade.tp,
    trade.status === 'Open' ? 'N/A' : trade.pl.toFixed(2),
    trade.status
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(val => `"${val}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `topg-algo-trade-history-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

exportCsvBtn.addEventListener('click', exportToCSV);

// ===================================================
// Event Listeners
// ===================================================
dateRangeFilter.addEventListener('change', applyFilters);
symbolFilter.addEventListener('change', applyFilters);
typeFilter.addEventListener('change', applyFilters);
resultFilter.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  applySort();
  renderTable();
});

resetFiltersBtn.addEventListener('click', () => {
  dateRangeFilter.value = 'all';
  symbolFilter.value = 'all';
  typeFilter.value = 'all';
  resultFilter.value = 'all';
  searchInput.value = '';
  sortSelect.value = 'date-desc';
  currentSort = 'date-desc';
  applyFilters();
});

// ===================================================
// Initial Render
// ===================================================
applyFilters();
