/* =========================
   玩家與市場基本設定
========================= */

let turnLocked = false;   // 回合鎖（玩家操作中）

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
  {
    name: "玩家 1",
    icon: PLAYER_ICONS[0],
    position: 0,
    cash: 1000000,
    stocks: {
      "STK-A": randInt(50, 100),
      "STK-B": randInt(50, 100),
      "STK-C": randInt(50, 100)
    },
    avgCost: {
      "STK-A": stocks["STK-A"].price,
      "STK-B": stocks["STK-B"].price,
      "STK-C": stocks["STK-C"].price
    },

    element: null

  },
  {
    name: "玩家 2",
    icon: PLAYER_ICONS[1],
    position: 0,
    cash: 1000000,
    stocks: {
      "STK-A": randInt(50, 100),
      "STK-B": randInt(50, 100),
      "STK-C": randInt(50, 100)
    },
    avgCost: {
      "STK-A": stocks["STK-A"].price,
      "STK-B": stocks["STK-B"].price,
      "STK-C": stocks["STK-C"].price
    },
    element: null
  },
  {
    name: "玩家 3",
    icon: PLAYER_ICONS[2],
    position: 0,
    cash: 1000000,
    stocks: {
      "STK-A": randInt(50, 100),
      "STK-B": randInt(50, 100),
      "STK-C": randInt(50, 100)
    },
    avgCost: {
      "STK-A": stocks["STK-A"].price,
      "STK-B": stocks["STK-B"].price,
      "STK-C": stocks["STK-C"].price
    }
    ,
    element: null
  },
  {
    name: "玩家 4",
    icon: PLAYER_ICONS[3],
    position: 0,
    cash: 1000000,
    stocks: {
      "STK-A": randInt(50, 100),
      "STK-B": randInt(50, 100),
      "STK-C": randInt(50, 100)
    },
    avgCost: {
      "STK-A": stocks["STK-A"].price,
      "STK-B": stocks["STK-B"].price,
      "STK-C": stocks["STK-C"].price
    }
    ,
    element: null
  }
];

let currentPlayerIndex = 0;

// ❗ 不含出發點
const tiles = [
  "出發",          // 0
  "股票", "市場", "現金", "機會", "命運",
  "股票", "市場", "現金", "機會", "命運",
  "股票", "市場", "現金", "機會", "命運",
  "股票", "市場", "現金", "機會",              
];




const board = document.getElementById("board");
const playersDiv = document.getElementById("players");
const log = document.getElementById("log");

/* =========================
   棋盤顏色 class
========================= */
function getTileClass(type) {
  switch (type) {
    case "股票": return "tile-stock";
    case "市場": return "tile-market";
    case "現金": return "tile-cash";
    case "機會": return "tile-chance";
    case "命運": return "tile-fate";
    default: return "";
  }
}

/* =========================
   建立棋盤（單層：格子文字在中間）
========================= */
function createBoard() {
  const tilesContainer = document.getElementById("tiles-container");
  tilesContainer.innerHTML = "";

  // 6x6 盤面上的行走路徑索引
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
   資產計算與 UI 更新
========================= */
function holdingsValue(player) {
  return Object.keys(stocks).reduce(
    (sum, sym) => sum + (player.stocks[sym] || 0) * stocks[sym].price,
    0
  );
}

function totalAsset(player) {
  return player.cash + holdingsValue(player);
}

function updateUI() {
  players.forEach((p, i) => {
    const el = document.getElementById(`player-${i}`);
    if (!el) return;

    // 🔒 保證 HUD 一定有正確定位 class（只加一次）
    if (!el.classList.contains("corner")) {
      el.classList.add(
        "corner",
        ["tl", "tr", "bl", "br"][i]
      );
    }

    // ⭐ 當前玩家高亮
    el.classList.toggle("active", i === currentPlayerIndex);

    el.innerHTML = `
  <div style="font-weight:700;font-size:15px">
    ${p.icon} ${p.name}
  </div>

  <div style="color:#22c55e;font-weight:700">
    💵 $${p.cash.toLocaleString()}
  </div>

  <div style="opacity:.9;font-size:13px;line-height:1.6">
    📦 市值 $${holdingsValue(p).toLocaleString()}<br>
    💰 總資產 $${totalAsset(p).toLocaleString()}<br><br>

    📈 STK-A：持有 ${p.stocks["STK-A"]} 張｜
    <span style="opacity:.7">成本 $${p.avgCost["STK-A"]}</span><br>

    📈 STK-B：持有 ${p.stocks["STK-B"]} 張｜
    <span style="opacity:.7">成本 $${p.avgCost["STK-B"]}</span><br>

    📈 STK-C：持有 ${p.stocks["STK-C"]} 張｜
    <span style="opacity:.7">成本 $${p.avgCost["STK-C"]}</span>
  </div>
`;

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
  const div = document.getElementById("decision-log-modal");
  if (!div) return;

  div.innerHTML = decisionLog.map(d => {
    const sign = d.effect >= 0 ? "+" : "";
    return `
      <div style="margin-bottom:8px">
        #${d.turn} ${d.icon} <b>${d.player}</b><br>
        <span style="opacity:.85">${d.tile}｜${d.decision}</span>
        <span style="float:right">${sign}${d.effect.toLocaleString()}</span>
        ${d.note ? `<div style="opacity:.6;font-size:12px">${d.note}</div>` : ""}
      </div>
    `;
  }).join("");
}


/* =========================
   股票螢幕（一般報價更新）
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
   卡牌與事件
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
  { title: "外資回補權值股", desc: "資金回流推升盤勢。", effect: () => 150000 },
  { title: "央行穩匯訊號", desc: "匯率波動降溫，市場信心回升。", effect: () => 120000 },
  { title: "產業訂單超預期", desc: "供應鏈題材走強。", effect: () => 170000 },
  { title: "ETF 申購潮", desc: "被動資金推升買盤。", effect: () => 130000 },
  { title: "法說會超預期", desc: "市場上修目標價。", effect: () => 190000 },
  { title: "大型回購/股利政策", desc: "股東回饋提升。", effect: () => 150000 },
  { title: "國際股市反彈", desc: "情緒回暖。", effect: () => 140000 },
  { title: "新產品/合作案", desc: "題材帶動買盤。", effect: () => 160000 },
  { title: "融資壓力下降", desc: "籌碼更健康。", effect: () => 110000 },
  { title: "營收優於預期", desc: "市場上修預期。", effect: () => 180000 }
];

const fateDeck = [
  { title: "外資急撤＋匯率走弱", desc: "資金外流拖累盤勢。", effect: () => -180000 },
  { title: "利率預期轉鷹", desc: "估值壓力上升。", effect: () => -150000 },
  { title: "地緣風險升溫", desc: "風險溢酬上升。", effect: () => -200000 },
  { title: "企業財報利空", desc: "市場快速調整。", effect: () => -170000 },
  { title: "監管不確定", desc: "量縮走弱。", effect: () => -140000 },
  { title: "國際股市大跌", desc: "連動下挫。", effect: () => -160000 },
  { title: "供應鏈延遲", desc: "產業風險升高。", effect: () => -150000 },
  { title: "信用事件", desc: "信用利差擴大。", effect: () => -190000 },
  { title: "流動性緊縮", desc: "融資成本上升。", effect: () => -160000 },
  { title: "重大利空揭露", desc: "市場信心受挫。", effect: () => -180000 }
];

const marketEventDeck = [
  { title: "外資回補偏多", desc: "本回合股價偏正向波動。", bias: +0.04, vol: 0.10 },
  { title: "美元走強偏空", desc: "本回合股價偏負向波動。", bias: -0.04, vol: 0.10 },
  { title: "利率不確定升高", desc: "本回合波動放大（漲跌更大）。", vol: 0.14 },
  { title: "成交量降溫盤整", desc: "本回合波動縮小（比較不動）。", vol: 0.06 }
];

function drawCard(kind) {
  const deck = (kind === "chance") ? chanceDeck : fateDeck;
  return deck[Math.floor(Math.random() * deck.length)];
}

/* 統一處理現金變動的 helper */
function applyCashDelta(player, delta, reason, tile, decision) {
  player.cash += delta;
  recordDecision(player, tile, decision, delta, reason);
  updateUI();
  checkBankrupt(player);
}

/* 股票欄位：自動投資（用金額換算張數） */
function investStock(player) {
  const names = Object.keys(stocks);
  const stockName = names[Math.floor(Math.random() * names.length)];
  const budget = 100000;
  const price = stocks[stockName].price;
  const qty = Math.floor(budget / price);

  if (qty <= 0) return;

  player.stocks[stockName] = (player.stocks[stockName] || 0) + qty;
  log.textContent += `｜📈 自動買入 ${stockName} ${qty} 張`;
}

/* 市場事件：改變股價波動模式 */
function applyMarketEvent() {
  const ev = marketEventDeck[Math.floor(Math.random() * marketEventDeck.length)];

  Object.values(stocks).forEach(stock => {
    stock.prev = stock.price;
    const baseVol = ev.vol ?? 0.10;
    const bias = ev.bias ?? 0;
    const r = (Math.random() * 2 - 1) * baseVol + bias;
    stock.price = Math.max(10, Math.round(stock.price * (1 + r)));
  });

  renderStockBoard();
  return ev;
}

/* =========================
   各種格子處理（拆開）
========================= */

async function handleFateTile(player) {
  const card = drawCard("fate");
  const delta = card.effect();

  await showEventModal({
    title: `⚠️ 命運事件｜${card.title}`,
    sub: `${player.icon} ${player.name}｜命運格`,
    body: `${card.desc}\n影響金額：${delta.toLocaleString()}`,
    mode: "info"
  });

  applyCashDelta(player, delta, card.title, "命運", "強制");
}

async function handleChanceTile(player) {
  // 先抽卡，但不要算結果
  const card = drawCard("chance");

  const ok = await showEventModal({
    title: "🎴 機會事件",
    sub: `${player.icon} ${player.name}｜機會格`,
    body: `
你遇到一個投資機會。
可能帶來收益，也可能造成損失。

是否選擇嘗試這個機會？
    `.trim(),
    mode: "choice"
  });

  if (!ok) {
    recordDecision(player, "機會", "放棄", 0, card.title);
    log.textContent += `｜⏭️ 放棄一個機會`;
    updateUI();
    return;
  }

  // ✅ 玩家選擇執行後，才揭曉結果
  const delta = card.effect();

  await showEventModal({
    title: `🎴 機會結果｜${card.title}`,
    sub: `${player.icon} ${player.name}`,
    body: `
${card.desc}

結果影響金額：
${delta >= 0 ? "+" : ""}${delta.toLocaleString()}
    `.trim(),
    mode: "info"
  });

  applyCashDelta(player, delta, card.title, "機會", "執行");
}


async function handleCashTile(player) {
  const delta = CASH_ACTION_CARD.effect();

  await showEventModal({
    title: "💰 股利/利息入帳（強制）",
    sub: `${player.icon} ${player.name}｜現金格`,
    body: `收到一筆現金流入。\n入帳金額：+${delta.toLocaleString()}`,
    mode: "info"
  });

  applyCashDelta(player, delta, CASH_ACTION_CARD.title, "現金", "強制");
}

async function handleMarketTile(player) {
  const ok = await showEventModal({
    title: "🌍 市場事件",
    sub: `${player.icon} ${player.name}｜市場格`,
    body: `市場因素將改變三檔股票的波動方式（不直接加減現金）。\n是否觸發本回合市場事件？`,
    mode: "choice"
  });

  if (ok) {
    const ev = applyMarketEvent();
    recordDecision(player, "市場", "執行", 0, ev.title);
    log.textContent += `｜🌍 ${ev.title}`;
    updateUI();
  } else {
    recordDecision(player, "市場", "放棄", 0, "略過市場事件");
    log.textContent += `｜⏭️ 略過市場事件`;
    updateUI();
  }
}

async function handleStockTile(player) {
  tradePlayer = player;
  tradeData = {};

  document.getElementById("trade-info").textContent =
    `${player.icon} ${player.name}｜現金 $${player.cash.toLocaleString()}`;

  let html = `
    <div class="trade-row header">
      <div>股票</div>
      <div>價格</div>
      <div>交易張數</div>
    </div>
  `;

  Object.entries(stocks).forEach(([name, s]) => {
    const owned = player.stocks[name] || 0;
    const avg = player.avgCost[name] ?? s.price;
    const diff = s.price - avg;

    let hint = "⚖️ 價格接近成本";
    if (diff < 0) hint = "📉 低於成本，偏向買入";
    if (diff > 0) hint = "📈 高於成本，偏向賣出";
    html += `
  <div class="trade-row">
  <div>
    ${name}<br>
    <small>持有 ${owned} 張</small><br>
    <small style="opacity:.6">成本 $${player.avgCost?.[name] ?? "—"}</small>
  </div>

  <div>$${s.price}</div>

  <div>
    <div class="trade-buttons">
      <button onclick="setTradeMode(this, 'buy')" class="active">買</button>
      <button onclick="setTradeMode(this, 'sell')">賣</button>
    </div>

    <input type="number"
      value="0"
      min="0"
      data-stock="${name}"
      data-price="${s.price}"
      data-mode="buy"
      onchange="updateTrade(this)">
  </div>
</div>

`;
  });

  html += `<div class="trade-action" id="trade-summary">尚未選擇交易</div>`;

  document.getElementById("trade-body").innerHTML = html;
  document.getElementById("trade-modal").classList.remove("hidden");
}
function setTradeMode(btn, mode) {
  const wrapper = btn.closest(".trade-row");
  const input = wrapper.querySelector("input");

  // 切換 active 樣式
  wrapper.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  input.dataset.mode = mode;

  // 如果原本有數字，自動轉正負
  const val = Math.abs(parseInt(input.value, 10) || 0);
  input.value = val;

  updateTrade(input);
}

function updateTrade(input) {
  const stock = input.dataset.stock;
  const qty = Math.abs(parseInt(input.value, 10) || 0);
  const mode = input.dataset.mode;
  const price = stocks[stock].price;

  const signedQty = mode === "sell" ? -qty : qty;
  tradeData[stock] = signedQty;

  let total = 0;
  for (const [s, q] of Object.entries(tradeData)) {
    total += q * stocks[s].price;
  }

  document.getElementById("trade-summary").textContent =
    `交易總金額：${total >= 0 ? "-" : "+"}$${Math.abs(total).toLocaleString()}`;
}




/* 主事件入口：依照格子種類分派 */
async function handleTile(player, type) {
  if (player.position === 0) return;

  switch (type) {
    case "命運":
      await handleFateTile(player);
      break;
    case "機會":
      await handleChanceTile(player);
      break;
    case "現金":
      await handleCashTile(player);
      break;
    case "市場":
      await handleMarketTile(player);
      break;
    case "股票":
      await handleStockTile(player);
      break;
    default:
      break;
  }
}
function endTurn() {
  currentPlayerIndex =
    (currentPlayerIndex + 1) % players.length;

  updateStockMarket();   // 新回合市場波動
  updateUI();

  log.textContent =
    `▶ 換 ${players[currentPlayerIndex].name}，請擲骰`;

  turnLocked = false;    // 🔓 解鎖
  showDiceButton();      // 顯示擲骰按鈕
}

/* =========================
   破產檢查
========================= */
function checkBankrupt(player) {
  if (player.cash <= 0) {
    alert(`💥 ${player.name} 破產，遊戲結束！`);
  }
}


function showDiceButton() {
  document.getElementById("dice-button-wrapper").classList.remove("hidden");
}

function hideDiceButton() {
  document.getElementById("dice-button-wrapper").classList.add("hidden");
}
async function onDiceClick() {
  if (turnLocked) return;   // 防止連點 / 自動觸發

  turnLocked = true;        // 🔒 鎖回合
  hideDiceButton();         // 隱藏擲骰按鈕


}


function showDiceModal(diceValue) {
  const modal = document.getElementById("dice-modal");
  const face = document.getElementById("dice-face");
  const result = document.getElementById("dice-result");

  result.textContent = "";
  face.textContent = "🎲";
  face.classList.add("dice-rolling");
  modal.classList.remove("hidden");


}



/* =========================
   回合控制：唯一流程（重要）
========================= */




function showDiceButton() {
  const w = document.getElementById("dice-button-wrapper");
  if (w) w.classList.remove("hidden");
}

function hideDiceButton() {
  const w = document.getElementById("dice-button-wrapper");
  if (w) w.classList.add("hidden");
}

// ✅ 結束回合：只在「玩家完成所有事件/交易」後呼叫
function endTurn() {
  // 市場更新放在換下一位前後都可，這裡放換人前代表「回合結束後市場更新」
  updateStockMarket();

  turnCount++;
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

  const p = players[currentPlayerIndex];
  log.textContent = `📅 第 ${turnCount} 回合｜輪到 ${p.icon} ${p.name}（請擲骰）`;

  updateUI();
  turnLocked = false;
  showDiceButton();
}

// ✅ 擲骰按鈕點擊（唯一入口）
async function onDiceClick() {
  if (turnLocked) return;

  turnLocked = true;
  hideDiceButton();

  const player = players[currentPlayerIndex];

  // 產生骰子
  const dice = Math.floor(Math.random() * 6) + 1;

  // 骰子動畫
  await showDiceModal(dice);

  log.textContent = ` ${player.icon} ${player.name} 擲到 ${dice} 點`;

  // 移動 + 處理事件（完整 await）
  await movePlayer(player, dice);

  // ⚠️ movePlayer / handleTile 都完成後才結束回合
  // 但若落在「股票」會開交易視窗，回合結束要等交易視窗關閉
  // 所以：如果是股票格，endTurn 由 closeTrade/confirmTrade 觸發
  // 其他格子事件已完成，這裡直接 endTurn
  const landedType = tiles[player.position];
  if (landedType !== "股票") {
    endTurn();
  }
}

// ✅ 骰子彈窗動畫（你原本的 OK，但我修正成不會寫入兩次）
function showDiceModal(diceValue) {
  const modal = document.getElementById("dice-modal");
  const face = document.getElementById("dice-face");
  const result = document.getElementById("dice-result");

  if (!modal || !face || !result) return Promise.resolve();

  // ===== 動畫階段 =====
  face.textContent = "🎲 🎲 🎲";
  result.textContent = "擲骰中…";
  face.classList.add("dice-rolling");
  modal.classList.remove("hidden");

  return new Promise(resolve => {
    // ===== 顯示結果 =====
    setTimeout(() => {
      face.classList.remove("dice-rolling");
      face.textContent = "🎯";
      result.textContent = `擲到 ${diceValue} 點`;
    }, 900);

    // ===== 關閉視窗 =====
    setTimeout(() => {
      modal.classList.add("hidden");
      resolve();
    }, 1700);
  });
}




// ✅ 移動玩家：只移動一次，不會多走格
async function movePlayer(player, steps) {
  let newPos = player.position + steps;

  // 經過出發點（跨圈）
  if (newPos >= tiles.length) {
    newPos %= tiles.length;

    const delta = 200000;
    await showEventModal({
      title: "🏁 經過出發點（強制）",
      sub: `${player.icon} ${player.name}`,
      body: `獲得週期收入：+${delta.toLocaleString()}`,
      mode: "info"
    });

    applyCashDelta(player, delta, "週期收入", "出發", "強制");
  }

  player.position = newPos;

  const targetCell = document.querySelector(`[data-pos='${newPos}']`);
  if (targetCell) targetCell.appendChild(player.element);

  // ✅ 落地事件：await 完成
  const type = tiles[newPos];
  console.log("踩到格子：", newPos, type);
  await handleTile(player, type);

  updateUI();
}




function resetGame() {
  location.reload();
}

/* =========================
   股票交易（prompt 版，保留你的邏輯）
========================= */
function openTradeModal(player) {
  const modal = document.getElementById("trade-modal");
  const info = document.getElementById("trade-info");
  const body = document.getElementById("trade-body");

  info.innerHTML = `
    💰 現金：$${player.cash.toLocaleString()}
  `;

  body.innerHTML = Object.entries(stocks).map(([name, s]) => {
    const hold = player.stocks[name] || 0;
    return `
      <div class="trade-row">
        <b>${name}</b>｜$${s.price}/張<br>
        你持有：${hold} 張<br>
        <input type="number" min="0" placeholder="交易張數" data-stock="${name}">
        <select data-action="${name}">
          <option value="buy">買入</option>
          <option value="sell">賣出</option>
        </select>
      </div>
      <hr>
    `;
  }).join("");

  modal.classList.remove("hidden");
}


/* =========================
   Modal（事件視窗）
========================= */
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
function confirmTrade() {
  let totalCost = 0;

  for (const [s, q] of Object.entries(tradeData)) {
    if (q > 0) {
      const oldQty = tradePlayer.stocks[s];
      const oldAvg = tradePlayer.avgCost[s];
      const price = stocks[s].price;

      const newQty = oldQty + q;
      const newAvg =
        (oldQty * oldAvg + q * price) / newQty;

      tradePlayer.avgCost[s] = Math.round(newAvg);
    }

    tradePlayer.stocks[s] += q;
  }


  // 現金不足
  if (totalCost > tradePlayer.cash) {
    alert("❌ 現金不足");
    return;
  }

  // 持股不足
  for (const [s, q] of Object.entries(tradeData)) {
    if (q < 0 && tradePlayer.stocks[s] < Math.abs(q)) {
      alert(`❌ ${s} 持股不足`);
      return;
    }
  }

  // 執行交易
  for (const [s, q] of Object.entries(tradeData)) {
    tradePlayer.stocks[s] += q;
  }

  tradePlayer.cash -= totalCost;

  recordDecision(
    tradePlayer,
    "股票",
    "交易",
    -totalCost,
    Object.entries(tradeData)
      .filter(([_, q]) => q !== 0)
      .map(([s, q]) => `${s} ${q > 0 ? "買" : "賣"} ${Math.abs(q)} 張`)
      .join("，")
  );

  closeTrade();

  updateUI();
  endTurn(); // ✅ 股票格：交易結束才換下一位

}

function closeTrade() {
  document.getElementById("trade-modal").classList.add("hidden");
  tradePlayer = null;
  tradeData = {};
}

function openIntro() {
  document.getElementById("start-modal").style.display = "flex";
}

function closeIntro() {
  document.getElementById("start-modal").style.display = "none";
}

function startGame() {
  document.getElementById("start-modal").style.display = "none";
  log.textContent = "🎮 遊戲開始，玩家 1 先行";
  updateUI();

  // ✅ 第一位玩家，顯示擲骰按鈕
  showDiceButton();
}


function openDecisionLog() {
  const modal = document.getElementById("decision-modal");
  if (!modal) {
    alert("❌ 找不到 decision-modal");
    return;
  }
  modal.classList.remove("hidden");
  renderDecisionLog();
}

function closeDecisionLog() {
  document.getElementById("decision-modal").classList.add("hidden");
}

/* =========================
   初始化
========================= */
createBoard();
createPlayers();
updateStockMarket();
updateUI();
log.textContent = "📘 請閱讀遊戲說明後開始";

