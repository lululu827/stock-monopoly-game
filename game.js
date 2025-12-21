/* =========================
   玩家與市場基本設定
========================= */
let turnCount = 1;
const decisionLog = [];

const PLAYER_ICONS = ["🧑‍💼", "👩‍💻", "🧑‍🔬", "👨‍🏫"];

const stocks = {
  "STK-A": { price: 100, prev: 100 },
  "STK-B": { price: 200, prev: 200 },
  "STK-C": { price: 300, prev: 300 }
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const players = [
  { name: "玩家 1", icon: PLAYER_ICONS[0], position: 0, cash: 1000000, stocks: { "STK-A": randInt(50,100), "STK-B": randInt(50,100), "STK-C": randInt(50,100) }, element: null },
  { name: "玩家 2", icon: PLAYER_ICONS[1], position: 0, cash: 1000000, stocks: { "STK-A": randInt(50,100), "STK-B": randInt(50,100), "STK-C": randInt(50,100) }, element: null },
  { name: "玩家 3", icon: PLAYER_ICONS[2], position: 0, cash: 1000000, stocks: { "STK-A": randInt(50,100), "STK-B": randInt(50,100), "STK-C": randInt(50,100) }, element: null },
  { name: "玩家 4", icon: PLAYER_ICONS[3], position: 0, cash: 1000000, stocks: { "STK-A": randInt(50,100), "STK-B": randInt(50,100), "STK-C": randInt(50,100) }, element: null }
];

let currentPlayerIndex = 0;

const tiles = [
  "機會","股票","現金","市場","股票","命運",
  "股票","市場","命運","市場","現金","股票",
  "股票","現金","市場","股票","股票","命運",
  "股票","現金","市場","股票","股票","機會"
];

const board = document.getElementById("board");
const playersDiv = document.getElementById("players");
const log = document.getElementById("log");

/* =========================
   棋盤顏色 class
========================= */
function getTileClass(type) {
  switch (type) {
    case "股票": return "stock";
    case "市場": return "market";
    case "現金": return "cash";
    case "機會": return "chance";
    case "命運": return "fate";
    default: return "";
  }
}

/* =========================
   建立棋盤（單層：格子文字在中間）
========================= */
function createBoard() {
  const tilesContainer = document.getElementById("tiles-container");
  tilesContainer.innerHTML = "";

  const pathIndex = [
    0, 1, 2, 3, 4, 5,
    11, 17, 23, 29, 35,
    34, 33, 32, 31, 30,
    24, 18, 12, 6
  ];

  for (let i = 0; i < 36; i++) {
    const cell = document.createElement("div");

    if (pathIndex.includes(i)) {
      const pos = pathIndex.indexOf(i);
      const type = tiles[pos];

      cell.className = "tile " + getTileClass(type);
      cell.dataset.pos = pos;

      cell.textContent = pos === 0 ? "出發" : type;
    } else {
      cell.className = "tile center";
    }

    tilesContainer.appendChild(cell);
  }
}

/* =========================
   建立玩家棋子（壓在格子中央）
========================= */
function createPlayers() {
  players.forEach(player => {
    const token = document.createElement("div");
    token.className = "player-token";
    token.textContent = player.icon;

    const startCell = document.querySelector("[data-pos='0']");
    startCell.appendChild(token);

    player.element = token;
  });
}

/* =========================
   右側 UI
========================= */
function holdingsValue(player) {
  return Object.keys(stocks).reduce((sum, sym) => sum + (player.stocks[sym] || 0) * stocks[sym].price, 0);
}
function totalAsset(player) {
  return player.cash + holdingsValue(player);
}


function updateUI() {
  playersDiv.innerHTML = "";

  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    div.innerHTML = `
      ${i === currentPlayerIndex ? "👉" : ""}
      ${p.icon} <strong>${p.name}</strong><br>
      💵 現金：$${p.cash.toLocaleString()}<br>
      📦 持股：A ${p.stocks["STK-A"]} 張｜B ${p.stocks["STK-B"]} 張｜C ${p.stocks["STK-C"]} 張<br>
      📈 持股市值：$${holdingsValue(p).toLocaleString()}<br>
      💰 總資產：$${totalAsset(p).toLocaleString()}
    `;
    playersDiv.appendChild(div);
  });
}


/* =========================
   決策紀錄表
========================= */
function recordDecision(player, tileType, decision, effect, note = "") {
  decisionLog.push({
    turn: turnCount,
    player: player.name,
    icon: player.icon,
    tile: tileType,
    decision,
    effect,
    note
  });
  renderDecisionLog();
}

function renderDecisionLog() {
  const div = document.getElementById("decision-log");
  if (!div) return;

  div.innerHTML = decisionLog.slice(-12).map(d => {
    const sign = d.effect >= 0 ? "+" : "";
    return `#${d.turn} ${d.icon} ${d.player}｜${d.tile} → ${d.decision} (${sign}${d.effect.toLocaleString()}) ${d.note ? "｜" + d.note : ""}`;
  }).join("<br>");
}

/* =========================
   股票螢幕
========================= */
function updateStockMarket() {
  Object.values(stocks).forEach(stock => {
    stock.prev = stock.price;
    const rate = Math.random() * 0.2 - 0.1; // -10% ~ +10%
    stock.price = Math.max(10, Math.round(stock.price * (1 + rate)));
  });
  renderStockBoard();
}

function renderStockBoard() {
  const screen = document.getElementById("stock-screen");
  let html = "📟 股票市場即時報價<br><br>";

  for (const [name, s] of Object.entries(stocks)) {
    const diff = s.price - s.prev;
    const cls = diff >= 0 ? "stock-up" : "stock-down";
    const sign = diff >= 0 ? "+" : "";

    html += `<div class="${cls}">${name}：${s.price} (${sign}${diff})</div>`;
  }
  screen.innerHTML = html;
}

/* =========================
   卡牌（事件）
========================= */
const CASH_ACTION_CARD = {
  title: "股利/利息入帳",
  desc: "收到一筆現金流入（模擬股利、利息或退稅）。",
  effect: () => 100000
};

const MARKET_ACTION_CARD = {
  title: "市場情緒波動",
  desc: "市場波動（模擬外資進出、匯率、利率預期）。",
  effect: () => (Math.random() > 0.5 ? 100000 : -100000)
};

const STOCK_ACTION_CARD = {
  title: "是否進場投資",
  desc: "投入 100,000 隨機買入一檔虛擬股票（你可選擇不執行）。",
  effect: () => -100000,
  after: (player) => investStock(player)
};

const chanceDeck = [
  { title:"外資回補權值股", desc:"資金回流推升盤勢。", effect: () => 150000 },
  { title:"央行穩匯訊號", desc:"匯率波動降溫，市場信心回升。", effect: () => 120000 },
  { title:"產業訂單超預期", desc:"供應鏈題材走強。", effect: () => 170000 },
  { title:"ETF 申購潮", desc:"被動資金推升買盤。", effect: () => 130000 },
  { title:"法說會超預期", desc:"市場上修目標價。", effect: () => 190000 },
  { title:"大型回購/股利政策", desc:"股東回饋提升。", effect: () => 150000 },
  { title:"國際股市反彈", desc:"情緒回暖。", effect: () => 140000 },
  { title:"新產品/合作案", desc:"題材帶動買盤。", effect: () => 160000 },
  { title:"融資壓力下降", desc:"籌碼更健康。", effect: () => 110000 },
  { title:"營收優於預期", desc:"市場上修預期。", effect: () => 180000 }
];

const fateDeck = [
  { title:"外資急撤＋匯率走弱", desc:"資金外流拖累盤勢。", effect: () => -180000 },
  { title:"利率預期轉鷹", desc:"估值壓力上升。", effect: () => -150000 },
  { title:"地緣風險升溫", desc:"風險溢酬上升。", effect: () => -200000 },
  { title:"企業財報利空", desc:"市場快速調整。", effect: () => -170000 },
  { title:"監管不確定", desc:"量縮走弱。", effect: () => -140000 },
  { title:"國際股市大跌", desc:"連動下挫。", effect: () => -160000 },
  { title:"供應鏈延遲", desc:"產業風險升高。", effect: () => -150000 },
  { title:"信用事件", desc:"信用利差擴大。", effect: () => -190000 },
  { title:"流動性緊縮", desc:"融資成本上升。", effect: () => -160000 },
  { title:"重大利空揭露", desc:"市場信心受挫。", effect: () => -180000 }
];

function drawCard(kind) {
  const deck = (kind === "chance") ? chanceDeck : fateDeck;
  return deck[Math.floor(Math.random() * deck.length)];
}

function applyCard(player, tileType, card, forced) {
  const delta = (typeof card.effect === "function") ? card.effect(player) : (card.effect || 0);

  player.cash += delta;
  if (typeof card.after === "function") card.after(player);

  log.textContent += `｜${forced ? "⚠️" : "✅"} ${card.title} (${delta >= 0 ? "+" : ""}${delta.toLocaleString()})`;
  recordDecision(player, tileType, forced ? "強制" : "執行", delta, card.title);
}

/* =========================
   投資行為
========================= */
function investStock(player) {
  const names = Object.keys(stocks);
  const stockName = names[Math.floor(Math.random() * names.length)];
  const amount = 100000;

  // 注意：STOCK_ACTION_CARD 已先扣 100,000，所以這裡不再扣第二次
  player.stocks[stockName] = (player.stocks[stockName] || 0) + amount;
  log.textContent += `｜📈 買入 ${stockName} $100,000`;
}

/* =========================
   主事件處理（命運強制，其它可選）
========================= */
async function handleTile(player, type) {
  if (player.position === 0) return;

  // 命運：強制執行
  if (type === "命運") {
  const card = drawCard("fate");
  const delta = card.effect();

  await showEventModal({
    title: `⚠️ 命運事件（強制）｜${card.title}`,
    sub: `${player.icon} ${player.name}｜命運格`,
    body: `${card.desc}\n影響金額：${delta.toLocaleString()}`,
    mode: "info"
  });

  player.cash += delta;
  recordDecision(player, "命運", "強制", delta, card.title);
  updateUI();
  checkBankrupt(player);
  return;
}


  let card = null;
  if (type === "機會") {
  const card = drawCard("chance");
  const delta = card.effect();

  const ok = await showEventModal({
    title: `🎴 機會事件｜${card.title}`,
    sub: `${player.icon} ${player.name}｜機會格`,
    body: `${card.desc}\n若執行：+${delta.toLocaleString()}`,
    mode: "choice"
  });

  if (ok) {
    player.cash += delta;
    recordDecision(player, "機會", "執行", delta, card.title);
    log.textContent += `｜✅ ${card.title}`;
  } else {
    recordDecision(player, "機會", "放棄", 0, card.title);
    log.textContent += `｜⏭️ 放棄：${card.title}`;
  }

  updateUI();
  checkBankrupt(player);
  return;
}

  if (type === "股票") {
  const ok = await showEventModal({
    title: "📊 股票交易",
    sub: `${player.icon} ${player.name}｜股票格`,
    body: `本回合報價：\nSTK-A $${stocks["STK-A"].price}/張\nSTK-B $${stocks["STK-B"].price}/張\nSTK-C $${stocks["STK-C"].price}/張\n\n是否進入交易？`,
    mode: "choice"
  });

  if (!ok) {
    recordDecision(player, "股票", "放棄", 0, "略過交易");
    log.textContent += `｜⏭️ 略過交易`;
    updateUI();
    return;
  }

  // 先沿用你現有 prompt 交易（下一步我可幫你改成 modal 下單）
  const result = handleStockTrade(player);

  if (result.did) {
    recordDecision(player, "股票", "執行", result.deltaCash ?? 0, result.note);
    log.textContent += `｜✅ ${result.note}`;
  } else {
    recordDecision(player, "股票", "放棄", 0, result.note);
    log.textContent += `｜⏭️ ${result.note}`;
  }

  updateUI();
  checkBankrupt(player);
  return;
}


  // 現金：強制執行（利多入帳不該詢問）
if (type === "現金") {
  const delta = CASH_ACTION_CARD.effect(player);
  await showEventModal({
    title: "💰 股利/利息入帳（強制）",
    sub: `${player.icon} ${player.name}｜現金格`,
    body: `收到一筆現金流入。\n入帳金額：+${delta.toLocaleString()}`,
    mode: "info"
  });

  player.cash += delta;
  recordDecision(player, "現金", "強制", delta, CASH_ACTION_CARD.title);
  updateUI();
  checkBankrupt(player);
  return;
}


  // 市場：改成觸發市場事件 -> 影響股價（可選）
if (type === "市場") {
  const ok = await showEventModal({
    title: "🌍 市場事件",
    sub: `${player.icon} ${player.name}｜市場格`,
    body: `市場因素將改變三檔股票的波動方式（不直接加減現金）。\n是否執行？`,
    mode: "choice"
  });

  if (ok) {
    const ev = applyMarketEvent();
    recordDecision(player, "市場", "執行", 0, ev.title);
    log.textContent += `｜🌍 ${ev.title}`;
  } else {
    recordDecision(player, "市場", "放棄", 0, "略過市場事件");
    log.textContent += `｜⏭️ 略過市場事件`;
  }

  updateUI();
  return;
}

const marketEventDeck = [
  { title:"外資回補偏多", desc:"本回合股價偏正向波動。", bias:+0.04, vol:0.10 },
  { title:"美元走強偏空", desc:"本回合股價偏負向波動。", bias:-0.04, vol:0.10 },
  { title:"利率不確定升高", desc:"本回合波動放大（漲跌更大）。", vol:0.14 },
  { title:"成交量降溫盤整", desc:"本回合波動縮小（比較不動）。", vol:0.06 },
];

function applyMarketEvent() {
  const ev = marketEventDeck[Math.floor(Math.random() * marketEventDeck.length)];

  Object.values(stocks).forEach(stock => {
    stock.prev = stock.price;

    const baseVol = ev.vol ?? 0.10;
    const bias = ev.bias ?? 0;
    const r = (Math.random() * 2 - 1) * baseVol + bias; // -vol~+vol + 偏差

    stock.price = Math.max(10, Math.round(stock.price * (1 + r)));
  });

  renderStockBoard();
  return ev;
}


  if (!card) return;

  const ok = confirm(
    `你踩到「${type}」格\n\n${card.title}\n${card.desc}\n\n是否執行？`
  );

  if (ok) {
    applyCard(player, type, card, false);
  } else {
    log.textContent += `｜⏭️ ${player.name} 放棄執行：${card.title}`;
    recordDecision(player, type, "放棄", 0, card.title);
  }

  updateUI();
  checkBankrupt(player);
}

function checkBankrupt(player) {
  if (player.cash <= 0) {
    alert(`💥 ${player.name} 破產，遊戲結束！`);
  }
}

/* =========================
   遊戲操作
========================= */
function rollDice() {
  const dice = Math.floor(Math.random() * 6) + 1;
  const player = players[currentPlayerIndex];

  log.textContent = `🎲 ${player.icon} ${player.name} 擲到 ${dice}`;
  movePlayer(player, dice);
}



async function movePlayer(player, steps) {
  let newPos = player.position + steps;

  if (newPos >= tiles.length) {
    newPos %= tiles.length;
    player.cash += 200000;

    await showEventModal({
      title: "🏁 經過出發點（強制）",
      sub: `${player.icon} ${player.name}`,
      body: `獲得週期收入：+200,000`,
      mode: "info"
    });

    recordDecision(player, "出發", "強制", 200000, "週期收入");
  }

  player.position = newPos;

  const targetCell = document.querySelector(`[data-pos='${newPos}']`);
  targetCell.appendChild(player.element);

  await handleTile(player, tiles[newPos]);
  updateUI();
}


function nextTurn() {
  // ✅ 先更新市場報價：這就是「上一位玩家結束後」的報價
  updateStockMarket();

  // ✅ 回合數+1（代表新回合的報價已生成）
  turnCount++;

  // ✅ 再換到下一位玩家
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

  log.textContent = `📅 第 ${turnCount} 回合｜▶ 換 ${players[currentPlayerIndex].icon} ${players[currentPlayerIndex].name}`;

  updateUI();
}


function resetGame() {
  location.reload();
}

/* =========================
   初始化
========================= */
createBoard();
createPlayers();
renderStockBoard();
updateUI();
log.textContent = "🎮 遊戲開始，玩家 1 先行";
updateStockMarket(); // 先出第一回合報價


function handleStockTrade(player) {
  const action = prompt(
    `📊 股票交易（單位：張）\n` +
    `STK-A：$${stocks["STK-A"].price}/張（你持有 ${player.stocks["STK-A"]} 張）\n` +
    `STK-B：$${stocks["STK-B"].price}/張（你持有 ${player.stocks["STK-B"]} 張）\n` +
    `STK-C：$${stocks["STK-C"].price}/張（你持有 ${player.stocks["STK-C"]} 張）\n\n` +
    `請輸入：buy / sell / skip`
  );

  if (!action) return { did:false, note:"取消交易" };
  const a = action.trim().toLowerCase();
  if (a === "skip") return { did:false, note:"略過交易" };
  if (a !== "buy" && a !== "sell") return { did:false, note:"輸入無效，略過" };

  const symbol = prompt("請輸入股票代號：STK-A / STK-B / STK-C");
  if (!symbol) return { did:false, note:"取消交易" };
  const s = symbol.trim().toUpperCase();
  if (!stocks[s]) return { did:false, note:"代號錯誤，略過" };

  const qtyStr = prompt(`請輸入張數（正整數）。目前你持有 ${s}：${player.stocks[s]} 張`);
  const qty = parseInt(qtyStr, 10);
  if (!Number.isFinite(qty) || qty <= 0) return { did:false, note:"張數無效，略過" };

  const price = stocks[s].price;
  const amount = qty * price;

  if (a === "buy") {
    if (player.cash < amount) {
      return { did:false, note:`現金不足，需 $${amount.toLocaleString()}` };
    }
    player.cash -= amount;
    player.stocks[s] += qty;
    return { did:true, deltaCash:-amount, note:`買入 ${s} ${qty} 張（$${price}/張）` };
  }

  // sell
  if (player.stocks[s] < qty) {
    return { did:false, note:`持股不足（你只有 ${player.stocks[s]} 張）` };
  }
  player.stocks[s] -= qty;
  player.cash += amount;
  return { did:true, deltaCash:+amount, note:`賣出 ${s} ${qty} 張（$${price}/張）` };
}


function showEventModal({ title, sub = "", body = "", mode = "choice" }) {
  // mode: "choice" => 執行/略過；"info" => 只有確認
  const backdrop = document.getElementById("event-modal");
  const titleEl = document.getElementById("modal-title");
  const subEl = document.getElementById("modal-sub");
  const bodyEl = document.getElementById("modal-body");
  const okBtn = document.getElementById("modal-ok");
  const cancelBtn = document.getElementById("modal-cancel");

  titleEl.textContent = title;
  subEl.textContent = sub;
  bodyEl.textContent = body;

  if (mode === "info") {
    cancelBtn.classList.add("hidden");
    okBtn.textContent = "確認";
  } else {
    cancelBtn.classList.remove("hidden");
    okBtn.textContent = "執行";
  }

  backdrop.classList.remove("hidden");

  return new Promise(resolve => {
    const cleanup = () => {
      backdrop.classList.add("hidden");
      okBtn.onclick = null;
      cancelBtn.onclick = null;
      document.onkeydown = null;
    };

    okBtn.onclick = () => { cleanup(); resolve(true); };
    cancelBtn.onclick = () => { cleanup(); resolve(false); };

    document.onkeydown = (e) => {
      if (e.key === "Escape" && mode !== "info") { cleanup(); resolve(false); }
      if (e.key === "Enter") { cleanup(); resolve(true); }
    };
  });
}

