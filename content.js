// The RIGHT text – Content Script v2.1
// Fixed Claude support + all others (ChatGPT, Gemini, DeepSeek, Qwen)

const ACTIVE_FLAG = 'righttext-active';
const STORAGE_PREFIX = 'righttext_';

const RTL_STYLES = `
  /* --- Claude.ai (updated) --- */
  .righttext-active .font-claude-response .standard-markdown p,
  .righttext-active .font-claude-response .standard-markdown h1,
  .righttext-active .font-claude-response .standard-markdown h2,
  .righttext-active .font-claude-response .standard-markdown h3,
  .righttext-active .font-claude-response .standard-markdown li,
  .righttext-active .font-claude-response .standard-markdown blockquote,
  /* fallback for other Claude layouts */
  .righttext-active [class*="claude-response"] p,
  .righttext-active [class*="claude-response"] li,
  .righttext-active [class*="claude-message"] p,
  .righttext-active [class*="claude-message"] li,

  /* --- ChatGPT --- */
  .righttext-active [data-message-author-role="assistant"] p,
  .righttext-active [data-message-author-role="assistant"] li,
  .righttext-active [data-message-author-role="assistant"] h1,
  .righttext-active [data-message-author-role="assistant"] h2,
  .righttext-active [data-message-author-role="assistant"] h3,

  /* --- Gemini --- */
  .righttext-active model-response p,
  .righttext-active model-response li,
  .righttext-active [class*="response-content"] p,
  .righttext-active [class*="response-content"] li,

  /* --- DeepSeek --- */
  .righttext-active .ds-markdown p,
  .righttext-active .ds-markdown li,
  .righttext-active .ds-markdown h1,
  .righttext-active .ds-markdown h2,
  .righttext-active .ds-markdown h3,
  .righttext-active [class*="assistant-message"] p,
  .righttext-active [class*="assistant-message"] li,
  .righttext-active .chat-message p,
  .righttext-active .chat-message li,

  /* --- Qwen Chat --- */
  .righttext-active .chat-response-message .qwen-markdown-text,
  .righttext-active .chat-response-message .qwen-markdown-paragraph,
  .righttext-active .chat-response-message .qwen-markdown-heading,
  .righttext-active .chat-response-message .qwen-markdown-list li,
  .righttext-active .chat-response-message .qwen-markdown-strong,
  .righttext-active .chat-response-message .qwen-markdown-em,
  .righttext-active .response-message-content p,
  .righttext-active .response-message-content li,

  /* --- Universal fallback (only inside article/content) --- */
  .righttext-active article p, .righttext-active article li,
  .righttext-active section[class*="content"] p,
  .righttext-active section[class*="content"] li {
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

function init() {
  const key = `${STORAGE_PREFIX}${location.hostname}`;
  chrome.storage.local.get(key, (res) => {
    const enabled = res[key] !== false;
    if (enabled) enableRTL();
    watchHistory();
  });
}

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
