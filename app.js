// ============================================================
// PremiumXizmat — Mini App
//
// MUHIM: Bu yerdagi USD narxlar bot.py/config.py dagi narxlar bilan
// BIR XIL bo'lishi kerak. USD narxni o'zgartirsangiz, shu faylda ham,
// config.py da ham yangilang (ikkalasi bitta manbadan — sizning
// bozor narxingizdan — kelib chiqadi).
// ============================================================

const DEFAULT_MARKUP_PERCENT = 15;
const FALLBACK_RATE = 12900; // pricing.py dagi FALLBACK_RATE bilan bir xil bo'lsin

const CATEGORIES = [
  {
    key: "telegram_premium",
    title: "📱 Premium",
    icon: "📱",
    items: [
      { name: "3 oylik Telegram Premium", usd: 12.0 },
      { name: "6 oylik Telegram Premium", usd: 16.0 },
      { name: "12 oylik Telegram Premium", usd: 29.0 },
    ],
  },
  {
    key: "telegram_stars",
    title: "⭐ Stars",
    icon: "⭐",
    items: [
      { name: "50 ⭐ Stars", usd: 50 * 0.0165 },
      { name: "100 ⭐ Stars", usd: 100 * 0.0165 },
      { name: "250 ⭐ Stars", usd: 250 * 0.0165 },
      { name: "500 ⭐ Stars", usd: 500 * 0.0165 },
      { name: "1000 ⭐ Stars", usd: 1000 * 0.0165 },
    ],
  },
  {
    key: "telegram_gifts",
    title: "🎁 Gifts",
    icon: "🎁",
    items: [
      { name: "🧸 Teddy Bear", usd: 3.5 },
      { name: "🌹 Rose", usd: 2.3 },
      { name: "🎂 Birthday Cake", usd: 4.2 },
      { name: "💝 Heart Gift", usd: 5.5 },
      { name: "🏆 Trophy Gift", usd: 11.5 },
    ],
  },
  {
    key: "telegram_nft",
    title: "💎 NFT",
    icon: "💎",
    items: [
      { name: "💎 NFT Gift (oddiy kolleksiya)", usd: 38.0, markup: 20 },
      { name: "👑 NFT Gift (nodir kolleksiya)", usd: 115.0, markup: 20 },
      { name: "🔥 NFT Gift (eksklyuziv)", usd: 230.0, markup: 25 },
    ],
  },
  {
    key: "pubg_uc",
    title: "🎯 PUBG UC",
    icon: "🎯",
    items: [
      { name: "60 UC", usd: 0.99 },
      { name: "325 UC", usd: 4.99 },
      { name: "660 UC", usd: 9.99 },
      { name: "1800 UC", usd: 24.99 },
      { name: "3850 UC", usd: 49.99 },
      { name: "8100 UC", usd: 99.99 },
    ],
  },
  {
    key: "mobile_legends",
    title: "⚔️ ML Olmos",
    icon: "⚔️",
    items: [
      { name: "56 Olmos", usd: 0.99 },
      { name: "278 Olmos", usd: 4.59 },
      { name: "571 Olmos", usd: 9.29 },
      { name: "1189 Olmos", usd: 18.49 },
      { name: "2494 Olmos", usd: 36.99 },
    ],
  },
  {
    key: "free_fire",
    title: "🔥 Free Fire",
    icon: "🔥",
    items: [
      { name: "100 Olmos", usd: 0.99 },
      { name: "310 Olmos", usd: 2.99 },
      { name: "520 Olmos", usd: 4.79 },
      { name: "1060 Olmos", usd: 9.29 },
    ],
  },
];

const tg = window.Telegram ? window.Telegram.WebApp : null;

let usdRate = FALLBACK_RATE;
let activeCategoryKey = CATEGORIES[0].key;
let selectedItem = null;

const tabsEl = document.getElementById("tabs");
const itemsEl = document.getElementById("items");
const tickerText = document.getElementById("tickerText");
const sheet = document.getElementById("sheet");
const sheetBackdrop = document.getElementById("sheetBackdrop");
const sheetTitle = document.getElementById("sheetTitle");
const sheetPrice = document.getElementById("sheetPrice");
const sheetIcon = document.getElementById("sheetIcon");
const sheetConfirm = document.getElementById("sheetConfirm");
const sheetCancel = document.getElementById("sheetCancel");

function formatSom(amount) {
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

function roundToStep(amount, step = 500) {
  return Math.round(amount / step) * step;
}

function calcPrice(item) {
  const markup = item.markup ?? DEFAULT_MARKUP_PERCENT;
  const raw = item.usd * usdRate * (1 + markup / 100);
  return roundToStep(raw);
}

async function loadRate() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    if (data && data.rates && data.rates.UZS) {
      usdRate = data.rates.UZS;
    }
  } catch (e) {
    // Internet yo'q yoki API javob bermadi — FALLBACK_RATE bilan davom etamiz
    console.warn("Kurs yuklanmadi, fallback ishlatilmoqda:", e);
  }
  tickerText.textContent = `1 USD ≈ ${formatSom(usdRate)}`;
  renderItems(); // narxlarni yangi kurs bilan qayta chizamiz
}

function renderTabs() {
  tabsEl.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const tab = document.createElement("div");
    tab.className = "tab" + (cat.key === activeCategoryKey ? " active" : "");
    tab.textContent = cat.title;
    tab.onclick = () => {
      activeCategoryKey = cat.key;
      renderTabs();
      renderItems();
    };
    tabsEl.appendChild(tab);
  });
}

function renderItems() {
  const cat = CATEGORIES.find((c) => c.key === activeCategoryKey);
  itemsEl.innerHTML = "";
  if (!cat || cat.items.length === 0) {
    itemsEl.innerHTML = '<div class="empty">Bu bo\'limda hozircha mahsulot yo\'q</div>';
    return;
  }
  cat.items.forEach((item) => {
    const price = calcPrice(item);
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <span class="item-name">${item.name}</span>
      <span class="item-price">${formatSom(price)}</span>
    `;
    card.onclick = () => openSheet(cat, item, price);
    itemsEl.appendChild(card);
  });
}

function openSheet(cat, item, price) {
  selectedItem = { category: cat.title, item: item.name, price };
  sheetIcon.textContent = cat.icon;
  sheetTitle.textContent = item.name;
  sheetPrice.textContent = formatSom(price);
  sheet.classList.add("open");
  sheetBackdrop.classList.add("open");
  if (tg) tg.HapticFeedback.impactOccurred("light");
}

function closeSheet() {
  sheet.classList.remove("open");
  sheetBackdrop.classList.remove("open");
  selectedItem = null;
}

sheetCancel.onclick = closeSheet;
sheetBackdrop.onclick = closeSheet;

sheetConfirm.onclick = () => {
  if (!selectedItem) return;
  const payload = JSON.stringify(selectedItem);
  if (tg && tg.sendData) {
    tg.sendData(payload);
    tg.close();
  } else {
    // Telegram tashqarisida (brauzerda) sinovdan o'tkazish uchun
    alert("Buyurtma: " + payload);
  }
};

// --- ishga tushirish ---
if (tg) {
  tg.ready();
  tg.expand();
}
renderTabs();
renderItems();
loadRate();
