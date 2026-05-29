// The RIGHT text – Content Script
// Injects RTL styles for AI chat sites

const ACTIVE_FLAG = 'righttext-active';
const STORAGE_PREFIX = 'righttext_';

// ==========================================
// RTL Style definitions (condensed but effective)
// ==========================================
const RTL_STYLES = `
  /* Main content areas for all supported sites */
  .righttext-active main p,
  .righttext-active main h1, .righttext-active main h2, .righttext-active main h3,
  .righttext-active main li, .righttext-active main blockquote,
  .righttext-active [class*="prose"] p, .righttext-active [class*="prose"] li,
  .righttext-active [class*="markdown"] p, .righttext-active [class*="markdown"] li,
  .righttext-active [data-message-author-role="assistant"] p,
  .righttext-active [data-message-author-role="assistant"] li,
  .righttext-active model-response p, .righttext-active model-response li,
  .righttext-active .ds-markdown p, .righttext-active .ds-markdown li,
  .righttext-active .ds-markdown h1, .righttext-active .ds-markdown h2, .righttext-active .ds-markdown h3,
  .righttext-active [class*="assistant-message"] p,
  .righttext-active .chat-message p,
  .righttext-active article p, .righttext-active article li {
    direction: rtl !important;
    text-align: right !important;
    unicode-bidi: plaintext !important;
  }

  /* Lists */
  .righttext-active ul, .righttext-active ol {
    padding-right: 1.5em !important;
    padding-left: 0 !important;
    direction: rtl !important;
  }

  /* Code blocks – always LTR */
  .righttext-active pre, .righttext-active code, .righttext-active pre * {
    direction: ltr !important;
    text-align: left !important;
    unicode-bidi: isolate !important;
  }
`;

let styleElement = null;

function injectStyles() {
  if (styleElement) return;
  styleElement = document.createElement('style');
  styleElement.id = 'righttext-styles';
  styleElement.textContent = RTL_STYLES;
  (document.head || document.documentElement).appendChild(styleElement);
}

function enableRTL() {
  injectStyles();
  document.documentElement.classList.add(ACTIVE_FLAG);
}

function disableRTL() {
  document.documentElement.classList.remove(ACTIVE_FLAG);
}

// Monitor SPA navigation (for ChatGPT, DeepSeek, etc.)
function watchHistory() {
  const pushState = history.pushState;
  const replaceState = history.replaceState;

  history.pushState = function(...args) {
    pushState.apply(history, args);
    onLocationChange();
  };
  history.replaceState = function(...args) {
    replaceState.apply(history, args);
    onLocationChange();
  };
  window.addEventListener('popstate', onLocationChange);
}

function onLocationChange() {
  const key = `${STORAGE_PREFIX}${location.hostname}`;
  chrome.storage.local.get(key, (res) => {
    if (res[key] !== false) enableRTL();
    else disableRTL();
  });
}

// Initial load
function init() {
  const key = `${STORAGE_PREFIX}${location.hostname}`;
  chrome.storage.local.get(key, (res) => {
    const enabled = res[key] !== false;
    if (enabled) enableRTL();
    watchHistory();
  });
}

// Listen for popup commands
chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.action === 'toggle') {
    msg.enabled ? enableRTL() : disableRTL();
    respond({ ok: true });
  }
  if (msg.action === 'getStatus') {
    respond({
      hostname: location.hostname,
      active: document.documentElement.classList.contains(ACTIVE_FLAG)
    });
  }
  return true;
});

init();