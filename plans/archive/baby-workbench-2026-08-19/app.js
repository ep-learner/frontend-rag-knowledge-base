'use strict';

// ==================== 数据常量 ====================

// 7 周主题轮换
const WEEK_THEMES = [
  { id: 'color',  name: '颜色',     desc: '红、黄、蓝、绿认识' },
  { id: 'fruit',  name: '水果',     desc: '苹果、香蕉、橙子' },
  { id: 'animal', name: '动物',     desc: '猫、狗、鸭、兔' },
  { id: 'body',   name: '身体',     desc: '头、手、脚、耳朵' },
  { id: 'daily',  name: '日常物品', desc: '碗、勺、杯、毛巾' },
  { id: 'number', name: '数感',     desc: '1-3 数量概念' },
  { id: 'action', name: '动作词',   desc: '拍、敲、抱、跳' }
];

// 活动库 35 条（覆盖 7 主题 × 5 条/主题，每主题覆盖多个发展领域）
const ACTIVITIES = [
  // 颜色 5 条
  { name: '颜色分类球',   area: '大运动',   theme: '颜色', materials: '3 个不同颜色球 + 同色纸板',  steps: '把球踢/滚到对应颜色纸板上' },
  { name: '红色水果找朋友', area: '认知',     theme: '颜色', materials: '苹果、草莓等红色物品',       steps: '把红色物品放一起，认识"红色"' },
  { name: '蜡笔涂鸦',     area: '精细动作', theme: '颜色', materials: '蜡笔 + 白纸',                steps: '让娃用蜡笔涂鸦，边画边说颜色名' },
  { name: '颜色卡片配对', area: '认知',     theme: '颜色', materials: '彩色卡 2 套',                steps: '把同色卡片配成对' },
  { name: '跳颜色',       area: '大运动',   theme: '颜色', materials: '彩色纸 4 张',                steps: '喊颜色让娃跳到对应纸上（可抱着跳）' },
  // 水果 5 条
  { name: '水果品尝会',   area: '自理',     theme: '水果', materials: '苹果、香蕉、蓝莓各几块',     steps: '让娃用手抓水果吃，认识口感和名字' },
  { name: '水果分类',     area: '认知',     theme: '水果', materials: '水果图片卡',                 steps: '按水果种类分类摆放' },
  { name: '剥香蕉',       area: '精细动作', theme: '水果', materials: '香蕉 1 根',                  steps: '让娃练习剥香蕉皮，锻炼手指' },
  { name: '苹果印章画',   area: '精细动作', theme: '水果', materials: '苹果切片 + 颜料 + 纸',       steps: '苹果切片蘸颜料印章作画' },
  { name: '水果命名',     area: '语言',     theme: '水果', materials: '真实水果 3-4 种',            steps: '拿水果说名字，让娃指认' },
  // 动物 5 条
  { name: '动物模仿秀',   area: '大运动',   theme: '动物', materials: '无需道具',                   steps: '学猫爬、狗走、兔跳' },
  { name: '动物图卡认知', area: '认知',     theme: '动物', materials: '动物图卡',                   steps: '看图卡说动物名和叫声' },
  { name: '动物叫声模仿', area: '语言',     theme: '动物', materials: '无需道具',                   steps: '大人学动物叫，让娃模仿' },
  { name: '喂小动物',     area: '精细动作', theme: '动物', materials: '动物盒 + 豆子 + 勺',         steps: '用勺把豆子放进动物嘴' },
  { name: '玩偶捉迷藏',   area: '社交',     theme: '动物', materials: '动物玩偶',                   steps: '藏玩偶让娃找，培养客体永久性' },
  // 身体 5 条
  { name: '摸头拍手',     area: '大运动',   theme: '身体', materials: '无需道具',                   steps: '喊"摸头"娃摸头，"拍手"娃拍手' },
  { name: '身体贴纸',     area: '认知',     theme: '身体', materials: '贴纸',                       steps: '把贴纸贴到对应身体部位' },
  { name: '五官认知',     area: '语言',     theme: '身体', materials: '镜子',                       steps: '指眼睛说"眼睛"，让娃模仿指' },
  { name: '手指画',       area: '精细动作', theme: '身体', materials: '手指画颜料',                 steps: '手指蘸颜料按手印' },
  { name: '假装洗脸',     area: '自理',     theme: '身体', materials: '小毛巾',                     steps: '教娃用毛巾假装洗脸' },
  // 日常物品 5 条
  { name: '勺子舀豆',     area: '精细动作', theme: '日常物品', materials: '勺 + 豆 + 碗',           steps: '让娃用勺把豆舀到碗里' },
  { name: '杯子倒水',     area: '精细动作', theme: '日常物品', materials: '两个塑料杯 + 水',       steps: '把水从一个杯倒到另一个' },
  { name: '物品命名',     area: '语言',     theme: '日常物品', materials: '碗、勺、杯、毛巾',       steps: '拿物品说名字让娃指认' },
  { name: '收拾玩具',     area: '自理',     theme: '日常物品', materials: '收纳箱',                 steps: '把玩具放回收纳箱，建立秩序感' },
  { name: '物品配对',     area: '认知',     theme: '日常物品', materials: '物品图卡 2 套',          steps: '相同物品图卡配对' },
  // 数感 5 条
  { name: '数手指',       area: '认知',     theme: '数感', materials: '无需',                       steps: '数娃手指 1、2、3' },
  { name: '一个和许多',   area: '认知',     theme: '数感', materials: '积木',                       steps: '1 块积木和一堆积木对比' },
  { name: '拍 1 下',     area: '大运动',   theme: '数感', materials: '无需',                       steps: '拍 1 下手让娃模仿，再拍 2 下' },
  { name: '给你一个',     area: '语言',     theme: '数感', materials: '积木',                       steps: '要娃给你"1 个"积木' },
  { name: '叠 3 块积木', area: '精细动作', theme: '数感', materials: '大颗粒积木',                 steps: '教娃叠 3 块积木' },
  // 动作词 5 条
  { name: '跳一跳',       area: '大运动',   theme: '动作词', materials: '无需',                     steps: '扶着娃腋下让娃跳' },
  { name: '拍拍手',       area: '大运动',   theme: '动作词', materials: '无需',                     steps: '玩拍手游戏，配合儿歌' },
  { name: '抱一抱',       area: '社交',     theme: '动作词', materials: '无需',                     steps: '喊"抱抱"互相拥抱' },
  { name: '敲敲鼓',       area: '精细动作', theme: '动作词', materials: '盆 + 木勺',               steps: '用勺敲盆，感受节奏' },
  { name: '摇一摇',       area: '大运动',   theme: '动作词', materials: '无需',                     steps: '放音乐一起摇摆身体' }
];

// 12-14 月龄 6 大领域里程碑
const MILESTONES = {
  '大运动':   ['独自站稳', '蹲下再站起来', '扶着东西走', '独自走几步', '爬楼梯（手扶）'],
  '精细动作': ['拇指食指捏小物', '把物品放进容器', '用整个手掌抓笔涂鸦', '翻厚纸书页', '叠 2-3 块积木'],
  '语言':     ['会叫"爸爸/妈妈"有所指', '听懂"不可以"', '听懂简单指令（"给我"）', '会用摇头/点头表达', '说 3-5 个有意义的字'],
  '认知':     ['认识熟悉的人', '寻找藏起来的物品', '模仿动作', '用容器装东西玩', '指认熟悉物品'],
  '社交':     ['对镜子微笑', '会挥手告别', '把玩具给大人', '看到陌生人害羞', '模仿大人动作'],
  '自理':     ['用手抓食物吃', '拿杯子喝水（扶着）', '配合穿衣服', '帮忙收拾玩具', '用勺子（笨拙地）']
};

// 养育原则：5 核心 + 4 禁止
const PRINCIPLES = {
  core: [
    { title: '不打断专注',     desc: '娃专注玩时不要打断，保护专注力是一切学习的基础' },
    { title: '多描述少提问',   desc: '用陈述句描述娃在做的事，不要总问"这是什么"，娃压力小' },
    { title: '多拥抱多回应',   desc: '及时回应娃的需求，建立安全感，这是情绪稳定的地基' },
    { title: '接纳情绪',       desc: '哭闹时先共情"宝宝难过"，不堵情绪，不转移' },
    { title: '言传不如身教',   desc: '你做娃看，比说教有效 100 倍。想娃爱看书，自己先看' }
  ],
  deny: [
    { title: '不威胁安全',     desc: '不能离开大人视线，不玩小物件（豆子/硬币等防吞咽）' },
    { title: '不用电子保姆',   desc: '尽量不靠屏幕安抚，1 岁半内不推荐电子屏幕' },
    { title: '不强迫分享',     desc: '1 岁半内物权期未到，"我的"是正常发展，不必强分享' },
    { title: '不体罚吼叫',     desc: '吼叫和体罚影响大脑发育，长期还会损害亲子关系' }
  ]
};

// 教具清单
const TOYS = [
  {
    group: '食物类（0 成本）',
    items: [
      { name: '蓝莓',         cost: '精细动作 + 数感' },
      { name: '香蕉',         cost: '剥皮练习' },
      { name: '意面（生）',   cost: '感官触觉 + 分类' },
      { name: '鸡蛋',         cost: '剥壳 + 认知' },
      { name: '米粒',         cost: '勺舀 + 倒' }
    ]
  },
  {
    group: 'DIY 教具（0 成本）',
    items: [
      { name: '矿泉水瓶 + 豆子', cost: '摇铃乐器' },
      { name: '鞋盒 + 抽纸',     cost: '抽拉游戏' },
      { name: '卷纸芯 + 球',     cost: '滚动隧道' },
      { name: '厨房锅 + 木勺',   cost: '敲击乐' },
      { name: '旧杂志',          cost: '撕纸/翻页' }
    ]
  },
  {
    group: '进阶购买',
    items: [
      { name: '大颗粒积木',     cost: '叠高 + 数感' },
      { name: '形状配对盒',     cost: '认知' },
      { name: '拼图（2-4 块）', cost: '认知 + 精细' },
      { name: '推拉学步车',     cost: '大运动' },
      { name: '触觉书',         cost: '阅读启蒙' }
    ]
  }
];

// 英文启蒙：SSS 儿歌 / 亲子口语 / TPR 指令
const ENGLISH = {
  songs: [
    { en: 'Baby Shark',                    zh: '鲨鱼一家' },
    { en: 'Twinkle Twinkle Little Star',   zh: '小星星' },
    { en: 'Wheels on the Bus',             zh: '公交车轮子转' },
    { en: 'Head Shoulders Knees Toes',     zh: '头肩膀膝盖脚趾' },
    { en: 'Old MacDonald',                 zh: '老麦克唐纳' }
  ],
  daily: [
    { en: 'Time to eat!',    zh: '该吃饭啦' },
    { en: "Let's go!",       zh: '我们走' },
    { en: 'Good job!',       zh: '真棒' },
    { en: 'I love you!',     zh: '我爱你' },
    { en: 'Wash hands!',     zh: '洗手' }
  ],
  tpr: [
    { en: 'Stand up',        zh: '站起来' },
    { en: 'Sit down',        zh: '坐下' },
    { en: 'Clap your hands', zh: '拍手' },
    { en: 'Wave hello',      zh: '挥挥手' },
    { en: 'Give me five',    zh: '击掌' }
  ]
};

// ==================== 工具函数 ====================

const STORE_PREFIX = 'baby-workbench:';

const Store = {
  get(key, def) {
    try {
      const v = localStorage.getItem(STORE_PREFIX + key);
      return v === null ? def : JSON.parse(v);
    } catch { return def; }
  },
  set(key, val) {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(val));
  },
  reset() {
    Object.keys(localStorage).forEach(k => {
      if (k.indexOf(STORE_PREFIX) === 0) localStorage.removeItem(k);
    });
  },
  // 累计完成任务数
  totalDone() {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.indexOf(STORE_PREFIX + 'tasks:') === 0) {
        try {
          const arr = JSON.parse(localStorage.getItem(k));
          if (Array.isArray(arr)) n += arr.filter(Boolean).length;
        } catch {}
      }
    }
    return n;
  }
};

const $ = (sel) => document.querySelector(sel);

function toast(msg) {
  let t = $('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 1400);
}

function pad2(n) { return String(n).padStart(2, '0'); }

function dateStrFromOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}
function todayStr() { return dateStrFromOffset(0); }

function shortDate(ds) {
  const p = ds.split('-');
  return p[1] + '/' + p[2];
}

// 当前是第几周（1-7 循环）
function getCurrentWeek() {
  let startDate = Store.get('startDate', null);
  if (!startDate) {
    startDate = todayStr();
    Store.set('startDate', startDate);
  }
  const start = new Date(startDate + 'T00:00:00');
  const today = new Date(todayStr() + 'T00:00:00');
  const diffDays = Math.floor((today - start) / 86400000);
  if (diffDays < 0) return 1;
  const week = Math.floor(diffDays / 7) + 1;
  return ((week - 1) % 7) + 1;
}

function getCurrentTheme() {
  return WEEK_THEMES[getCurrentWeek() - 1];
}

// 生成今日任务：取本周主题前 4 条活动
function getTodayTasks() {
  const theme = getCurrentTheme();
  return ACTIVITIES.filter(a => a.theme === theme.name).slice(0, 4);
}

// ==================== 路由 ====================

let currentTab = 'home';
let libFilter = Store.get('libFilter', { area: 'all', theme: 'all' });

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  renderTab(tab);
}

function renderTab(tab) {
  const main = $('#js-main');
  const map = {
    home: renderHome, today: renderToday, theme: renderTheme,
    library: renderLibrary, milestone: renderMilestone, principle: renderPrinciple,
    toys: renderToys, english: renderEnglish
  };
  const fn = map[tab] || renderHome;
  main.innerHTML = fn();
  main.scrollTop = 0;
  // 同步副标题
  $('#js-subtitle').textContent = '12-14 月龄 · 第 ' + getCurrentWeek() + ' 周';
}

// ==================== 渲染：首页 ====================

function renderHome() {
  const tasks = getTodayTasks();
  const states = Store.get('tasks:' + todayStr(), tasks.map(() => false));
  const todayDone = states.filter(Boolean).length;
  const todayRate = tasks.length ? Math.round(todayDone / tasks.length * 100) : 0;

  // 连续打卡：从今天往前找
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const ds = dateStrFromOffset(-i);
    const ts = Store.get('tasks:' + ds, null);
    if (ts && Array.isArray(ts) && ts.some(Boolean)) streak++;
    else break;
  }

  // 里程碑达成
  let mDone = 0, mTotal = 0;
  const mStates = Store.get('milestones', {});
  Object.keys(MILESTONES).forEach(area => {
    const arr = MILESTONES[area];
    const s = mStates[area] || arr.map(() => false);
    arr.forEach((_, i) => {
      mTotal++;
      if (s[i]) mDone++;
    });
  });

  // 近 7 天趋势
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const ds = dateStrFromOffset(-i);
    const ts = Store.get('tasks:' + ds, null);
    let rate = 0;
    if (ts && Array.isArray(ts) && ts.length) {
      rate = Math.round(ts.filter(Boolean).length / ts.length * 100);
    }
    trend.push({ date: shortDate(ds), rate });
  }

  const theme = getCurrentTheme();
  const week = getCurrentWeek();

  return `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${todayRate}%</div>
        <div class="stat-label">今日完成率</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${streak}</div>
        <div class="stat-label">连续打卡天</div>
      </div>
      <div class="stat-card">
        <div class="stat-value small">${mDone}/${mTotal}</div>
        <div class="stat-label">里程碑达成</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Store.totalDone()}</div>
        <div class="stat-label">累计完成任务</div>
      </div>
    </div>

    <div class="trend-wrap">
      <div class="card-title">📈 近 7 天完成率</div>
      ${renderTrendSVG(trend)}
    </div>

    <div class="card">
      <div class="card-title">🎨 本周主题<span class="badge">第 ${week} 周</span></div>
      <div style="font-size:16px;font-weight:700;color:#ff6b6b">${theme.name}</div>
      <div class="muted" style="margin-top:4px">${theme.desc}</div>
    </div>

    <div class="card">
      <div class="card-title">📋 今日任务<span class="badge">${todayDone}/${tasks.length}</span></div>
      <div class="muted">点击底部「📋」Tab 查看任务详情并打卡</div>
    </div>
  `;
}

function renderTrendSVG(trend) {
  const w = 300, h = 120, pad = 22;
  const step = (w - pad * 2) / (trend.length - 1);
  const points = trend.map((d, i) => {
    const x = pad + i * step;
    const y = h - pad - (d.rate / 100) * (h - pad * 2);
    return { x, y, ...d };
  });
  const polyline = points.map(p => p.x + ',' + p.y).join(' ');
  const dots = points.map(p =>
    '<circle cx="' + p.x + '" cy="' + p.y + '" r="3" fill="#ff6b6b"/>' +
    '<text x="' + p.x + '" y="' + (h - 6) + '" text-anchor="middle" class="trend-axis">' + p.date + '</text>' +
    '<text x="' + p.x + '" y="' + (p.y - 8) + '" text-anchor="middle" class="trend-axis">' + (p.rate || '') + '</text>'
  ).join('');
  const areaPath = 'M' + pad + ',' + (h - pad) + ' ' +
    points.map(p => 'L' + p.x + ',' + p.y).join(' ') +
    ' L' + (w - pad) + ',' + (h - pad) + ' Z';
  return `
    <svg class="trend-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff6b6b" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#ff6b6b" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#trendGrad)"/>
      <polyline points="${polyline}" fill="none" stroke="#ff6b6b" stroke-width="2"/>
      ${dots}
    </svg>
  `;
}

// ==================== 渲染：今日任务 ====================

function renderToday() {
  const theme = getCurrentTheme();
  const tasks = getTodayTasks();
  const states = Store.get('tasks:' + todayStr(), tasks.map(() => false));
  const done = states.filter(Boolean).length;

  const list = tasks.map((t, i) => `
    <div class="task-item ${states[i] ? 'done' : ''}" data-idx="${i}">
      <div class="task-check">${states[i] ? '✓' : ''}</div>
      <div class="task-content">
        <div class="task-name">${t.name}</div>
        <div class="task-meta"><b>材料：</b>${t.materials}</div>
        <div class="task-meta"><b>玩法：</b>${t.steps}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="section-title">📋 今日任务<span class="badge">${done}/${tasks.length}</span></div>
    <div class="muted" style="margin-bottom:12px">本周主题：${theme.name} · 任务按主题自动生成</div>
    ${list}
  `;
}

// ==================== 渲染：每周主题 ====================

function renderTheme() {
  const currentWeek = getCurrentWeek();
  const theme = getCurrentTheme();
  const pills = WEEK_THEMES.map((t, i) => `
    <div class="theme-pill ${i + 1 === currentWeek ? 'current' : ''}">
      <span class="num">第 ${i + 1} 周</span>
      ${t.name}
    </div>
  `).join('');

  const themeActs = ACTIVITIES.filter(a => a.theme === theme.name);
  const actList = themeActs.map(a => `
    <div class="activity-item">
      <div class="activity-name">${a.name}</div>
      <div class="activity-meta">
        <span class="tag area">${a.area}</span>
        <span class="tag theme">${a.theme}</span>
        <div class="row"><b>材料：</b>${a.materials}</div>
        <div class="row"><b>玩法：</b>${a.steps}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="theme-hero">
      <div class="week">第 ${currentWeek} 周 · 7 周一轮换</div>
      <div class="theme-name">${theme.name}</div>
      <div class="theme-desc">${theme.desc}</div>
    </div>
    <div class="section-title">🎨 7 周主题轮换</div>
    <div class="theme-list">${pills}</div>
    <div style="margin-top:16px"></div>
    <div class="section-title">📚 「${theme.name}」主题活动</div>
    ${actList}
  `;
}

// ==================== 渲染：活动库 ====================

function renderLibrary() {
  const areas = ['all', ...Array.from(new Set(ACTIVITIES.map(a => a.area)))];
  const themes = ['all', ...Array.from(new Set(ACTIVITIES.map(a => a.theme)))];

  const areaChips = areas.map(a =>
    `<button class="chip ${libFilter.area === a ? 'active' : ''}" data-area="${a}">${a === 'all' ? '全部领域' : a}</button>`
  ).join('');
  const themeChips = themes.map(t =>
    `<button class="chip ${libFilter.theme === t ? 'active' : ''}" data-theme="${t}">${t === 'all' ? '全部主题' : t}</button>`
  ).join('');

  let filtered = ACTIVITIES;
  if (libFilter.area !== 'all') filtered = filtered.filter(a => a.area === libFilter.area);
  if (libFilter.theme !== 'all') filtered = filtered.filter(a => a.theme === libFilter.theme);

  const list = filtered.length ? filtered.map(a => `
    <div class="activity-item">
      <div class="activity-name">${a.name}</div>
      <div class="activity-meta">
        <span class="tag area">${a.area}</span>
        <span class="tag theme">${a.theme}</span>
        <span class="tag material">${a.materials}</span>
        <div class="row"><b>玩法：</b>${a.steps}</div>
      </div>
    </div>
  `).join('') : `<div class="empty"><div class="emoji">🔍</div>没有符合条件的活动</div>`;

  return `
    <div class="section-title">📚 活动库<span class="badge">${filtered.length}/${ACTIVITIES.length}</span></div>
    <div class="filter-row">${areaChips}</div>
    <div class="filter-row">${themeChips}</div>
    ${list}
  `;
}

// ==================== 渲染：里程碑 ====================

function renderMilestone() {
  const states = Store.get('milestones', {});
  const groups = Object.keys(MILESTONES).map(area => {
    const arr = MILESTONES[area];
    const s = states[area] || arr.map(() => false);
    const done = s.filter(Boolean).length;
    const items = arr.map((text, i) => `
      <div class="milestone-item ${s[i] ? 'done' : ''}" data-area="${area}" data-idx="${i}">
        <div class="milestone-check">${s[i] ? '✓' : ''}</div>
        <div class="milestone-text">${text}</div>
      </div>
    `).join('');
    return `
      <div class="milestone-group">
        <div class="milestone-group-header">
          <div class="milestone-group-title">${area}</div>
          <div class="milestone-progress">${done}/${arr.length}</div>
        </div>
        ${items}
      </div>
    `;
  }).join('');

  return `
    <div class="section-title">📈 发育观察<span class="badge">12-14 月龄</span></div>
    <div class="muted" style="margin-bottom:12px">勾选自动保存，进度可追溯</div>
    ${groups}
  `;
}

// ==================== 渲染：养育原则 ====================

function renderPrinciple() {
  const core = PRINCIPLES.core.map(p => `
    <div class="principle-card">
      <div class="principle-title">✅ ${p.title}</div>
      <div class="principle-desc">${p.desc}</div>
    </div>
  `).join('');
  const deny = PRINCIPLES.deny.map(p => `
    <div class="principle-card deny">
      <div class="principle-title">🚫 ${p.title}</div>
      <div class="principle-desc">${p.desc}</div>
    </div>
  `).join('');
  return `
    <div class="section-title">💡 养育原则</div>
    <div class="muted" style="margin-bottom:12px">5 大核心 + 4 项禁止</div>
    <div class="section-title" style="font-size:14px">✅ 5 大核心原则</div>
    ${core}
    <div class="section-title" style="font-size:14px;margin-top:8px">🚫 4 项禁止行为</div>
    ${deny}
  `;
}

// ==================== 渲染：教具清单 ====================

function renderToys() {
  const groups = TOYS.map(g => {
    const items = g.items.map(it => `
      <div class="toy-item">
        <div class="toy-name">${it.name}</div>
        <div class="toy-cost">${it.cost}</div>
      </div>
    `).join('');
    return `
      <div class="toy-group">
        <div class="toy-group-title">${g.group}<span class="muted">${g.items.length} 件</span></div>
        ${items}
      </div>
    `;
  }).join('');
  return `
    <div class="section-title">🧸 教具清单</div>
    <div class="muted" style="margin-bottom:12px">先薅免费，钱包谢谢你</div>
    ${groups}
  `;
}

// ==================== 渲染：英文启蒙 ====================

function renderEnglish() {
  const renderGroup = (title, items) => {
    const list = items.map(it => `
      <div class="eng-item">
        <div class="eng-text">
          <div class="eng-en">${it.en}</div>
          <div class="eng-zh">${it.zh}</div>
        </div>
        <button class="eng-play" data-text="${encodeURIComponent(it.en)}">▶</button>
      </div>
    `).join('');
    return `
      <div class="eng-group">
        <div class="eng-group-title">${title}</div>
        ${list}
      </div>
    `;
  };
  return `
    <div class="section-title">🔤 英文启蒙</div>
    <div class="muted" style="margin-bottom:12px">点 ▶ 播放发音（浏览器 TTS）</div>
    ${renderGroup('🎵 SSS 儿歌', ENGLISH.songs)}
    ${renderGroup('💬 亲子口语', ENGLISH.daily)}
    ${renderGroup('🏃 TPR 指令', ENGLISH.tpr)}
  `;
}

// ==================== 交互处理 ====================

function bindEvents() {
  // Tab 切换
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => switchTab(t.dataset.tab));
  });

  // 重置
  $('#js-reset-btn').addEventListener('click', () => {
    if (confirm('确认重置全部数据？所有打卡记录将被清除。')) {
      Store.reset();
      toast('已重置');
      switchTab('home');
    }
  });

  // 主内容区事件代理
  $('#js-main').addEventListener('click', (e) => {
    // 任务勾选
    const task = e.target.closest('.task-item');
    if (task) {
      const idx = +task.dataset.idx;
      const tasks = getTodayTasks();
      const states = Store.get('tasks:' + todayStr(), tasks.map(() => false));
      states[idx] = !states[idx];
      Store.set('tasks:' + todayStr(), states);
      renderTab(currentTab);
      toast(states[idx] ? '完成 ✓' : '取消');
      return;
    }
    // 里程碑勾选
    const ms = e.target.closest('.milestone-item');
    if (ms) {
      const area = ms.dataset.area;
      const idx = +ms.dataset.idx;
      const states = Store.get('milestones', {});
      const arr = states[area] || MILESTONES[area].map(() => false);
      arr[idx] = !arr[idx];
      states[area] = arr;
      Store.set('milestones', states);
      renderTab(currentTab);
      return;
    }
    // 活动筛选
    const chip = e.target.closest('.chip');
    if (chip) {
      if (chip.dataset.area) libFilter.area = chip.dataset.area;
      if (chip.dataset.theme) libFilter.theme = chip.dataset.theme;
      Store.set('libFilter', libFilter);
      renderTab(currentTab);
      return;
    }
    // 英文发音
    const play = e.target.closest('.eng-play');
    if (play) {
      const text = decodeURIComponent(play.dataset.text);
      playEnglish(text, play);
      return;
    }
  });
}

function playEnglish(text, btn) {
  if (!('speechSynthesis' in window)) {
    toast('浏览器不支持发音');
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.8;
  u.onstart = () => btn.classList.add('playing');
  u.onend = () => btn.classList.remove('playing');
  u.onerror = () => btn.classList.remove('playing');
  // iOS Safari 兜底：5 秒后强制移除
  setTimeout(() => btn.classList.remove('playing'), 5000);
  window.speechSynthesis.speak(u);
}

// ==================== 初始化 ====================

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  // Service Worker 只能在 https 或 localhost 下注册，file:// 下会失败但不影响其他功能
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('[SW] 注册失败（不影响使用）:', err && err.message);
    });
  });
}

function init() {
  if (!Store.get('startDate', null)) Store.set('startDate', todayStr());
  bindEvents();
  switchTab('home');
  registerSW();
}

init();
