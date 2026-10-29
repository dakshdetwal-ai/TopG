// ===================================================
// TopG Algo — Bot Settings Page Logic
// FRONTEND PROTOTYPE ONLY — settings saved to localStorage only.
// No real bot, trading account or backend is connected.
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
// Default Settings
// ===================================================
const defaultSettings = {
  riskPerTrade: 0.5,
  maxDailyLoss: 5,
  maxOpenTrades: 3,
  riskRewardRatio: '1:2',
  stopLossPips: 25,
  takeProfitPips: 50,
  enableBuy: true,
  enableSell: true,
  tradingSession: 'all',
  newsFilter: true,
  tradingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  botRunning: false
};

const STORAGE_KEY = 'topg_bot_settings';

// ===================================================
// DOM References
// ===================================================
const riskPerTradeSlider = document.getElementById('riskPerTrade');
const riskPerTradeValue = document.getElementById('riskPerTradeValue');

const maxDailyLossSlider = document.getElementById('maxDailyLoss');
const maxDailyLossValue = document.getElementById('maxDailyLossValue');

const maxOpenTradesInput = document.getElementById('maxOpenTrades');
const maxTradesMinus = document.getElementById('maxTradesMinus');
const maxTradesPlus = document.getElementById('maxTradesPlus');

const riskRewardRatioSelect = document.getElementById('riskRewardRatio');

const stopLossInput = document.getElementById('stopLossPips');
const takeProfitInput = document.getElementById('takeProfitPips');
const stopLossError = document.getElementById('stopLossError');
const takeProfitError = document.getElementById('takeProfitError');

const enableBuyToggle = document.getElementById('enableBuy');
const enableSellToggle = document.getElementById('enableSell');
const tradingSessionSelect = document.getElementById('tradingSession');
const newsFilterToggle = document.getElementById('newsFilter');

const dayButtons = document.querySelectorAll('.day-btn');

const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const resetDefaultBtn = document.getElementById('resetDefaultBtn');
const saveToast = document.getElementById('saveToast');

const startBotBtn = document.getElementById('startBotBtn');
const stopBotBtn = document.getElementById('stopBotBtn');
const botStatusDot = document.getElementById('botStatusDot');
const botStatusText = document.getElementById('botStatusText');

// ===================================================
// Load settings (from localStorage or defaults)
// ===================================================
function loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const settings = saved ? JSON.parse(saved) : defaultSettings;
  applySettingsToUI(settings);
}

function applySettingsToUI(settings) {
  riskPerTradeSlider.value = settings.riskPerTrade;
  riskPerTradeValue.textContent = settings.riskPerTrade.toFixed(1) + '%';

  maxDailyLossSlider.value = settings.maxDailyLoss;
  maxDailyLossValue.textContent = settings.maxDailyLoss + '%';

  maxOpenTradesInput.value = settings.maxOpenTrades;

  riskRewardRatioSelect.value = settings.riskRewardRatio;

  stopLossInput.value = settings.stopLossPips;
  takeProfitInput.value = settings.takeProfitPips;

  enableBuyToggle.checked = settings.enableBuy;
  enableSellToggle.checked = settings.enableSell;

  tradingSessionSelect.value = settings.tradingSession;
  newsFilterToggle.checked = settings.newsFilter;

  dayButtons.forEach(btn => {
    const day = btn.getAttribute('data-day');
    btn.classList.toggle('active', settings.tradingDays.includes(day));
  });

  // Bot running state
  if (settings.botRunning) {
    setBotRunning(true);
  } else {
    setBotRunning(false);
  }
}

// ===================================================
// Collect current UI state into a settings object
// ===================================================
function collectSettings() {
  const activeDays = Array.from(dayButtons)
    .filter(btn => btn.classList.contains('active'))
    .map(btn => btn.getAttribute('data-day'));

  return {
    riskPerTrade: parseFloat(riskPerTradeSlider.value),
    maxDailyLoss: parseFloat(maxDailyLossSlider.value),
    maxOpenTrades: parseInt(maxOpenTradesInput.value),
    riskRewardRatio: riskRewardRatioSelect.value,
    stopLossPips: parseInt(stopLossInput.value),
    takeProfitPips: parseInt(takeProfitInput.value),
    enableBuy: enableBuyToggle.checked,
    enableSell: enableSellToggle.checked,
    tradingSession: tradingSessionSelect.value,
    newsFilter: newsFilterToggle.checked,
    tradingDays: activeDays,
    botRunning: botStatusText.textContent === 'Running'
  };
}

// ===================================================
// Slider live updates
// ===================================================
riskPerTradeSlider.addEventListener('input', () => {
  riskPerTradeValue.textContent = parseFloat(riskPerTradeSlider.value).toFixed(1) + '%';
});

maxDailyLossSlider.addEventListener('input', () => {
  maxDailyLossValue.textContent = parseFloat(maxDailyLossSlider.value) + '%';
});

// ===================================================
// Max open trades stepper
// ===================================================
maxTradesMinus.addEventListener('click', () => {
  let val = parseInt(maxOpenTradesInput.value) || 1;
  if (val > parseInt(maxOpenTradesInput.min)) {
    maxOpenTradesInput.value = val - 1;
  }
});

maxTradesPlus.addEventListener('click', () => {
  let val = parseInt(maxOpenTradesInput.value) || 1;
  if (val < parseInt(maxOpenTradesInput.max)) {
    maxOpenTradesInput.value = val + 1;
  }
});

maxOpenTradesInput.addEventListener('change', () => {
  let val = parseInt(maxOpenTradesInput.value);
  const min = parseInt(maxOpenTradesInput.min);
  const max = parseInt(maxOpenTradesInput.max);
  if (isNaN(val) || val < min) val = min;
  if (val > max) val = max;
  maxOpenTradesInput.value = val;
});

// ===================================================
// Trading days toggle buttons
// ===================================================
dayButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
  });
});

// ===================================================
// Validation for SL / TP numeric ranges
// ===================================================
function validateStopLoss() {
  const val = parseInt(stopLossInput.value);
  if (isNaN(val) || val < 1 || val > 500) {
    stopLossError.textContent = 'Enter a value between 1 and 500.';
    return false;
  }
  stopLossError.textContent = '';
  return true;
}

function validateTakeProfit() {
  const val = parseInt(takeProfitInput.value);
  if (isNaN(val) || val < 1 || val > 1000) {
    takeProfitError.textContent = 'Enter a value between 1 and 1000.';
    return false;
  }
  takeProfitError.textContent = '';
  return true;
}

stopLossInput.addEventListener('blur', validateStopLoss);
takeProfitInput.addEventListener('blur', validateTakeProfit);
stopLossInput.addEventListener('input', () => { stopLossError.textContent = ''; });
takeProfitInput.addEventListener('input', () => { takeProfitError.textContent = ''; });

// ===================================================
// Bot Start/Stop (visual preview only)
// ===================================================
function setBotRunning(isRunning) {
  botStatusDot.classList.toggle('running', isRunning);
  botStatusText.textContent = isRunning ? 'Running' : 'Stopped';
  startBotBtn.disabled = isRunning;
  stopBotBtn.disabled = !isRunning;
}

startBotBtn.addEventListener('click', () => {
  setBotRunning(true);
  persistCurrentSettings();
});

stopBotBtn.addEventListener('click', () => {
  setBotRunning(false);
  persistCurrentSettings();
});

function persistCurrentSettings() {
  const settings = collectSettings();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

// ===================================================
// Save Settings button
// ===================================================
saveSettingsBtn.addEventListener('click', () => {
  const slValid = validateStopLoss();
  const tpValid = validateTakeProfit();

  if (!slValid || !tpValid) {
    return;
  }

  // At least one trade direction must remain enabled (basic sanity check)
  if (!enableBuyToggle.checked && !enableSellToggle.checked) {
    alert('At least one of Buy or Sell trades must be enabled.');
    return;
  }

  // At least one trading day must be selected
  const activeDays = Array.from(dayButtons).filter(btn => btn.classList.contains('active'));
  if (activeDays.length === 0) {
    alert('Please select at least one trading day.');
    return;
  }

  const settings = collectSettings();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

  showSaveToast();
});

function showSaveToast() {
  saveToast.classList.add('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    saveToast.classList.remove('show');
  }, 3000);
}

// ===================================================
// Reset to Default
// ===================================================
resetDefaultBtn.addEventListener('click', () => {
  const confirmed = confirm('Reset all settings to default values? This cannot be undone.');
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  applySettingsToUI(defaultSettings);
  showSaveToast();
});

// ===================================================
// Initial load
// ===================================================
loadSettings();
