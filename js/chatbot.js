(function () {
  'use strict';

  const SUGGESTIONS = [
    'What services do you offer?',
    'How much does it cost?',
    'How do I get started?',
    'Do you offer free trials?',
  ];

  let messages = [];
  let isLoading = false;

  function createWidget() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <!-- Floating toggle button -->
      <button class="chatbot-toggle" id="chatbotToggle" aria-label="Open chat">
        <svg class="icon-chat" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
        <svg class="icon-close" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <span class="chatbot-unread" id="chatbotUnread">1</span>
      </button>

      <!-- Chat panel -->
      <div class="chatbot-panel" id="chatbotPanel" role="dialog" aria-label="Chat with MDWebStudio">
        <div class="chatbot-header">
          <div class="chatbot-avatar">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
          </div>
          <div class="chatbot-header-info">
            <div class="chatbot-header-name">MDWebStudio Assistant</div>
            <div class="chatbot-header-status">Online &bull; Replies instantly</div>
          </div>
        </div>

        <div class="chatbot-messages" id="chatbotMessages">
          <!-- Messages rendered here -->
        </div>

        <div class="chatbot-suggestions" id="chatbotSuggestions"></div>

        <div class="chatbot-input-row">
          <textarea
            class="chatbot-input"
            id="chatbotInput"
            placeholder="Ask anything…"
            rows="1"
            aria-label="Chat message"
          ></textarea>
          <button class="chatbot-send" id="chatbotSend" aria-label="Send message" disabled>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);
  }

  function renderSuggestions() {
    const container = document.getElementById('chatbotSuggestions');
    if (!container) return;
    if (messages.length > 1) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = SUGGESTIONS.map(
      (s) => `<button class="chatbot-suggestion" data-prompt="${s}">${s}</button>`
    ).join('');

    container.querySelectorAll('.chatbot-suggestion').forEach((btn) => {
      btn.addEventListener('click', () => {
        sendMessage(btn.dataset.prompt);
      });
    });
  }

  function appendMessage(role, text) {
    const messagesEl = document.getElementById('chatbotMessages');
    if (!messagesEl) return;

    const isBot = role === 'assistant';
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg chat-msg--${isBot ? 'bot' : 'user'}`;

    msgEl.innerHTML = `
      <div class="chat-msg__avatar">
        ${
          isBot
            ? `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>`
            : `<svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V21.6h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`
        }
      </div>
      <div class="chat-msg__bubble">${escapeHtml(text)}</div>
    `;

    messagesEl.appendChild(msgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const messagesEl = document.getElementById('chatbotMessages');
    if (!messagesEl) return null;

    const typingEl = document.createElement('div');
    typingEl.className = 'chat-msg chat-msg--bot';
    typingEl.id = 'chatbotTyping';
    typingEl.innerHTML = `
      <div class="chat-msg__avatar">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
      </div>
      <div class="chat-typing visible">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return typingEl;
  }

  function removeTyping() {
    const el = document.getElementById('chatbotTyping');
    if (el) el.remove();
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }

  async function sendMessage(text) {
    if (!text || !text.trim() || isLoading) return;
    text = text.trim();

    const inputEl = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');

    if (inputEl) {
      inputEl.value = '';
      inputEl.style.height = 'auto';
    }
    if (sendBtn) sendBtn.disabled = true;

    messages.push({ role: 'user', content: text });
    appendMessage('user', text);
    renderSuggestions();

    isLoading = true;
    showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      removeTyping();

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.message || 'Sorry, I couldn\'t get a response. Please try again.';
      messages.push({ role: 'assistant', content: reply });
      appendMessage('assistant', reply);
    } catch (err) {
      removeTyping();
      appendMessage('assistant', 'Sorry, something went wrong. Please try again or contact us directly at hello@motivedesign.com.');
    } finally {
      isLoading = false;
      if (sendBtn) sendBtn.disabled = false;
      if (inputEl) inputEl.focus();
    }
  }

  function init() {
    createWidget();

    const toggleBtn = document.getElementById('chatbotToggle');
    const panel = document.getElementById('chatbotPanel');
    const inputEl = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');
    const unreadBadge = document.getElementById('chatbotUnread');

    // Show greeting on first open
    let firstOpen = true;

    toggleBtn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      toggleBtn.classList.toggle('open', isOpen);

      if (isOpen) {
        unreadBadge.classList.remove('visible');
        if (firstOpen) {
          firstOpen = false;
          const greeting = 'Hi! I\'m the MDWebStudio assistant. How can I help you today?';
          messages.push({ role: 'assistant', content: greeting });
          appendMessage('assistant', greeting);
          renderSuggestions();
        }
        setTimeout(() => inputEl && inputEl.focus(), 250);
      }
    });

    // Show unread badge after 3s to draw attention
    setTimeout(() => {
      if (!panel.classList.contains('open')) {
        unreadBadge.classList.add('visible');
      }
    }, 3000);

    // Auto-resize textarea
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
      sendBtn.disabled = !inputEl.value.trim();
    });

    // Send on Enter (Shift+Enter for newline)
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
          sendMessage(inputEl.value);
        }
      }
    });

    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
