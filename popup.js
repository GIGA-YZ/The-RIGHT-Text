const SUPPORTED = [
  'claude.ai',
  'chat.openai.com',
  'chatgpt.com',
  'gemini.google.com',
  'chat.deepseek.com'
];

const DISPLAY_NAMES = {
  'claude.ai': 'Claude',
  'chat.openai.com': 'ChatGPT',
  'chatgpt.com': 'ChatGPT',
  'gemini.google.com': 'Gemini',
  'chat.deepseek.com': 'DeepSeek'
};

let currentHost = null;
let currentTabId = null;

const toggleCheckbox = document.getElementById('rtlToggle');
const siteNameSpan = document.getElementById('currentSite');
const statusBadge = document.getElementById('statusBadge');

// Get active tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]) return;
  currentTabId = tabs[0].id;
  let host = '';
  try {
    host = new URL(tabs[0].url).hostname;
  } catch(e) { host = ''; }
  currentHost = host;

  if (SUPPORTED.includes(host)) {
    siteNameSpan.textContent = DISPLAY_NAMES[host] || host;
    const key = `righttext_${host}`;
    chrome.storage.local.get(key, (res) => {
      const enabled = res[key] !== false;
      toggleCheckbox.checked = enabled;
      updateStatusBadge(enabled);
    });
    toggleCheckbox.disabled = false;
  } else {
    siteNameSpan.textContent = host || 'unsupported';
    statusBadge.textContent = 'Not supported';
    statusBadge.className = 'status-badge inactive';
    toggleCheckbox.disabled = true;
  }
});

toggleCheckbox.addEventListener('change', () => {
  if (!currentHost || !currentTabId) return;
  const enabled = toggleCheckbox.checked;
  const key = `righttext_${currentHost}`;
  chrome.storage.local.set({ [key]: enabled });
  updateStatusBadge(enabled);

  chrome.tabs.sendMessage(currentTabId, {
    action: 'toggle',
    enabled: enabled
  }).catch(err => console.log('Content script not ready'));
});

function updateStatusBadge(isActive) {
  if (isActive) {
    statusBadge.textContent = '● RTL Active';
    statusBadge.className = 'status-badge active';
  } else {
    statusBadge.textContent = '○ RTL Off';
    statusBadge.className = 'status-badge inactive';
  }
}