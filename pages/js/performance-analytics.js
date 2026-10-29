document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Sidebar mobile toggle ---------- */
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const menuToggle = document.getElementById('menuToggle');

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  }
  menuToggle.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);

  /* ---------- Sample trade generation ---------- */
  const STARTING_BALANCE = 10000;
  const TOTAL_DAYS = 180;

  function generateSampleTrades() {
    const trades = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let id = 1;
    let runningBalance = STARTING_BALANCE;

    for (let d = TOTAL_DAYS; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);

      const tradesToday = Math.floor(Math.random() * 4); // 0 - 3 trades per day
      for (let t = 0; t < tradesToday; t++) {
        const isWin = Math.random() < 0.58;
        const side = Math.random() < 0.52 ? 'BUY' : 'SELL';
        let pnl;
        if (isWin) {
          pnl = parseFloat((Math.random() * 220 + 20).toFixed(2));
        } else {
          pnl = parseFloat((-(Math.random() * 150 + 15)).toFixed(2));
        }
        runningBalance += pnl;
        trades.push({
          id: id++,
          date: new Date(date),
          side,
          pnl,
          result: pnl >= 0 ? 'WIN' : 'LOSS',
          balanceAfter: parseFloat(runningBalance.toFixed(2))
        });
      }
    }
    return trades;
  }

  const allTrades = generateSampleTrades();

  /* ---------- Helpers ---------- */
  function filterByRange(trades, range) {
    if (range === 'all') return trades;
    const days = parseInt(range, 10);
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);
    return trades.filter(t => t.date >= cutoff);
  }

  function formatMoney(n) {
    const sign = n < 0 ? '-' : '';
    return `${sign}$${Math.abs(n).toFixed(2)}`;
  }

  function formatDateShort(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function computeStats(trades) {
    if (trades.length === 0) {
      return {
        netPL: 0, winRate: 0, profitFactor: 0, maxDrawdown: 0,
        wins: 0, losses: 0, buyCount: 0, buyPL: 0, sellCount: 0, sellPL: 0,
        avgWin: 0, avgLoss: 0, bestTrade: 0, worstTrade: 0
      };
    }

    let netPL = 0, grossProfit = 0, grossLoss = 0, wins = 0, losses = 0;
    let buyCount = 0, buyPL = 0, sellCount = 0, sellPL = 0;
    let best = -Infinity, worst = Infinity;

    trades.forEach(t => {
      netPL += t.pnl;
      if (t.pnl >= 0) { grossProfit += t.pnl; wins++; }
      else { grossLoss += Math.abs(t.pnl); losses++; }

      if (t.side === 'BUY') { buyCount++; buyPL += t.pnl; }
      else { sellCount++; sellPL += t.pnl; }

      if (t.pnl > best) best = t.pnl;
      if (t.pnl < worst) worst = t.pnl;
    });

    const winRate = (wins / trades.length) * 100;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit;
    const avgWin = wins > 0 ? grossProfit / wins : 0;
    const avgLoss = losses > 0 ? -(grossLoss / losses) : 0;

    // Max drawdown based on running equity within this filtered set
    let equity = STARTING_BALANCE, peak = equity, maxDD = 0;
    trades.forEach(t => {
      equity += t.pnl;
      if (equity > peak) peak = equity;
      const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
      if (dd > maxDD) maxDD = dd;
    });

    return {
      netPL, winRate, profitFactor, maxDrawdown: maxDD,
      wins, losses, buyCount, buyPL, sellCount, sellPL,
      avgWin, avgLoss, bestTrade: best, worstTrade: worst
    };
  }

  /* ---------- Chart instances ---------- */
  let equityChart, winLossChart, buySellChart, dailyPLChart;

  const CHART_FONT = { family: 'Inter', size: 12 };
  const GRID_COLOR = 'rgba(255,255,255,0.05)';
  const TEXT_MUTED = '#9aa0a6';

  Chart.defaults.font.family = 'Inter';
  Chart.defaults.color = TEXT_MUTED;

  function renderEquityChart(trades) {
    const ctx = document.getElementById('equityChart').getContext('2d');
    const labels = trades.map(t => formatDateShort(t.date));
    const data = trades.map(t => t.balanceAfter);

    if (trades.length === 0) {
      labels.push('No data');
      data.push(STARTING_BALANCE);
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(16, 217, 122, 0.35)');
    gradient.addColorStop(1, 'rgba(16, 217, 122, 0)');

    if (equityChart) equityChart.destroy();
    equityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Equity',
          data,
          borderColor: '#10d97a',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Balance: ${formatMoney(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
          y: {
            grid: { color: GRID_COLOR },
            ticks: { callback: (v) => `$${v.toLocaleString()}` }
          }
        }
      }
    });
  }

  function renderWinLossChart(stats) {
    const ctx = document.getElementById('winLossChart').getContext('2d');
    if (winLossChart) winLossChart.destroy();
    winLossChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Wins', 'Losses'],
        datasets: [{
          data: [stats.wins, stats.losses],
          backgroundColor: ['#10d97a', '#f04c4c'],
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
  }

  function renderBuySellChart(stats) {
    const ctx = document.getElementById('buySellChart').getContext('2d');
    if (buySellChart) buySellChart.destroy();
    buySellChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Buy', 'Sell'],
        datasets: [{
          data: [stats.buyPL, stats.sellPL],
          backgroundColor: [
            stats.buyPL >= 0 ? '#10d97a' : '#f04c4c',
            stats.sellPL >= 0 ? '#10d97a' : '#f04c4c'
          ],
          borderRadius: 6,
          barThickness: 60
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Net P/L: ${formatMoney(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: GRID_COLOR },
            ticks: { callback: (v) => `$${v}` }
          }
        }
      }
    });
  }

  function renderDailyPLChart(trades) {
    // Always last 30 calendar days, independent of main timeframe filter
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push({ date: d, pl: 0 });
    }

    trades.forEach(t => {
      const match = days.find(day => day.date.toDateString() === t.date.toDateString());
      if (match) match.pl += t.pnl;
    });

    const ctx = document.getElementById('dailyPLChart').getContext('2d');
    if (dailyPLChart) dailyPLChart.destroy();
    dailyPLChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days.map(d => formatDateShort(d.date)),
        datasets: [{
          label: 'Daily P/L',
          data: days.map(d => parseFloat(d.pl.toFixed(2))),
          backgroundColor: days.map(d => d.pl >= 0 ? '#10d97a' : '#f04c4c'),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `P/L: ${formatMoney(ctx.parsed.y)}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
          y: {
            grid: { color: GRID_COLOR },
            ticks: { callback: (v) => `$${v}` }
          }
        }
      }
    });
  }

  /* ---------- Update UI ---------- */
  function updateSummaryCards(stats) {
    const plEl = document.getElementById('totalPL');
    plEl.textContent = formatMoney(stats.netPL);
    plEl.classList.toggle('negative', stats.netPL < 0);

    document.getElementById('winRate').textContent = `${stats.winRate.toFixed(1)}%`;
    document.getElementById('profitFactor').textContent = stats.profitFactor === Infinity
      ? '∞' : stats.profitFactor.toFixed(2);
    document.getElementById('maxDrawdown').textContent = `${stats.maxDrawdown.toFixed(1)}%`;
  }

  function updateStatsPanels(stats) {
    document.getElementById('winCount').textContent = stats.wins;
    document.getElementById('lossCount').textContent = stats.losses;
    document.getElementById('buyCount').textContent = stats.buyCount;
    document.getElementById('sellCount').textContent = stats.sellCount;
    document.getElementById('avgWin').textContent = formatMoney(stats.avgWin);
    document.getElementById('avgLoss').textContent = formatMoney(stats.avgLoss);
    document.getElementById('bestTrade').textContent = formatMoney(
      stats.bestTrade === -Infinity ? 0 : stats.bestTrade
    );
    document.getElementById('worstTrade').textContent = formatMoney(
      stats.worstTrade === Infinity ? 0 : stats.worstTrade
    );
  }

  function refreshAll(range) {
    const filtered = filterByRange(allTrades, range);
    const stats = computeStats(filtered);

    updateSummaryCards(stats);
    updateStatsPanels(stats);
    renderEquityChart(filtered);
    renderWinLossChart(stats);
    renderBuySellChart(stats);
  }

  /* ---------- Timeframe filter buttons ---------- */
  const tfButtons = document.querySelectorAll('.tf-btn');
  tfButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tfButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshAll(btn.dataset.range);
    });
  });

  /* ---------- CSV Export ---------- */
  document.getElementById('exportBtn').addEventListener('click', () => {
    const headers = ['ID', 'Date', 'Side', 'Result', 'P/L ($)', 'Balance After ($)'];
    const rows = allTrades.map(t => [
      t.id,
      t.date.toISOString().split('T')[0],
      t.side,
      t.result,
      t.pnl.toFixed(2),
      t.balanceAfter.toFixed(2)
    ]);

    let csv = '# DEMO DATA - 
