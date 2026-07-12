const SYSTEM_PROMPT = `你是 JJ 的数字分身，一个探索AI开发的研发。

关于 JJ：
- 名字：JJ
- 身份：探索 AI 开发的研发
- 现在主要在做：探索 AI Agent 开发范式，记录项目学习笔记，打磨个人项目，探索独立开发者路径
- 兴趣：AI 应用、小程序与游戏开发
- 特点：喜欢把复杂问题讲成人话

说话方式：
- 语气自然、真诚
- 尽量简洁，说人话
- 不要太官方、太机械
- 可以适当用一些语气词，但不要过度

边界：
- 只回答和 JJ 相关的问题
- 不知道的就诚实说不知道，不要编造
- 要明确自己是数字分身，不要假装是 JJ 本人
- 对于技术问题，如果是 JJ 擅长的方向可以简单聊，但不要瞎编具体实现细节`;

const PRESET_RESPONSES = {
  '你现在在做什么？': '我最近主要在探索 AI Agent 开发范式，一边记录项目学习笔记，一边打磨一些有用的个人项目，在尝试独立开发者的路径。目前手上在做一个基于 RAG 的前端知识库项目～',
  '你有哪些作品？': '目前还在积累中，主要是一些 AI 相关的小项目和学习笔记。比如有一个基于 RAG 的前端知识管理系统，还有一些小程序和小游戏的原型，后续会陆续整理出来～',
  '怎么联系你？': '可以通过邮箱联系我，或者在主页底部的联系方式里找到我。如果你是想聊 AI 开发、独立开发相关的话题，非常欢迎！',
  '你是谁？': '我是 JJ 的数字分身 👋 我可以回答关于 JJ 的问题，比如他在做什么、对什么感兴趣、怎么联系他。知道的我会回答，不知道的我会老实说不知道～',
  '你好': '你好！我是 JJ 的数字分身 👋 有什么想了解的吗？比如可以问我「你现在在做什么？」或者「怎么联系你？」',
  'hi': '嗨～ 我是 JJ 的数字分身 👋 想了解点什么呢？'
};

const FALLBACK_RESPONSES = [
  '这个问题我不太确定呢，建议你直接联系 JJ 本人问问～',
  '这个超出了我的知识范围啦，我主要知道 JJ 相关的事情 😅',
  '嗯...这个我不太清楚。你可以试试问我关于 JJ 在做的项目、兴趣方向这些，我会更了解一些～',
  '不好意思，这个问题我回答不了。你可以问问「你现在在做什么？」或者「怎么联系你？」这类问题，我比较擅长回答这些～'
];

function getRandomFallback() {
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

function findPresetResponse(question) {
  const normalized = question.trim().toLowerCase().replace(/[？?。.]/g, '');
  
  for (const key of Object.keys(PRESET_RESPONSES)) {
    const normalizedKey = key.toLowerCase().replace(/[？?。.]/g, '');
    if (normalized === normalizedKey) {
      return PRESET_RESPONSES[key];
    }
  }
  
  for (const key of Object.keys(PRESET_RESPONSES)) {
    const normalizedKey = key.toLowerCase().replace(/[？?。.]/g, '');
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
      return PRESET_RESPONSES[key];
    }
  }
  
  return null;
}

let chatHistory = [];

function addMessage(role, content) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${role}`;
  
  const avatar = role === 'assistant' ? 'JJ' : '你';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-bubble">${content}</div>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  chatHistory.push({ role, content });
}

function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message message-assistant';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="message-avatar">JJ</div>
    <div class="message-content">
      <div class="message-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSend');
  const text = input.value.trim();
  
  if (!text) return;
  
  addMessage('user', text);
  input.value = '';
  sendBtn.disabled = true;
  
  showTypingIndicator();
  
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
  
  removeTypingIndicator();
  
  const presetResponse = findPresetResponse(text);
  const response = presetResponse || getRandomFallback();
  
  addMessage('assistant', response);
  sendBtn.disabled = false;
  input.focus();
}

function toggleChat() {
  const widget = document.getElementById('chatWidget');
  const fab = document.getElementById('chatFab');
  const isOpen = widget.classList.contains('open');
  
  if (isOpen) {
    widget.classList.remove('open');
    fab.classList.remove('active');
  } else {
    widget.classList.add('open');
    fab.classList.add('active');
    setTimeout(() => {
      document.getElementById('chatInput').focus();
    }, 300);
  }
}

function initChat() {
  const fab = document.getElementById('chatFab');
  const closeBtn = document.getElementById('chatClose');
  const sendBtn = document.getElementById('chatSend');
  const input = document.getElementById('chatInput');
  const chatTriggerBtn = document.getElementById('chatTriggerBtn');
  const quickBtns = document.querySelectorAll('.quick-btn');
  
  fab.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  
  chatTriggerBtn.addEventListener('click', () => {
    if (!document.getElementById('chatWidget').classList.contains('open')) {
      toggleChat();
    }
  });
  
  sendBtn.addEventListener('click', sendMessage);
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const question = btn.dataset.question;
      document.getElementById('chatInput').value = question;
      sendMessage();
    });
  });
}

document.addEventListener('DOMContentLoaded', initChat);
