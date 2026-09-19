const SAVE_KEY = "fresh-circuit-v1";
const SCORE_KEY = "fresh-circuit-scores";
const GOODS = {
  lemonade: { name: "Lemonade", icon: "\uD83C\uDF4B", size: 1, spoil: 18, cold: true, base: 1.1 },
  tea: { name: "Iced Tea", icon: "\uD83E\uDDCB", size: 1, spoil: 16, cold: true, base: 1.2 },
  icecream: { name: "Ice Cream", icon: "\uD83C\uDF66", size: 1, spoil: 28, cold: true, base: 1.6 },
  fruit: { name: "Fruit Cups", icon: "\uD83C\uDF53", size: 1, spoil: 24, cold: true, base: 1.5 },
  cookies: { name: "Cookies", icon: "\uD83C\uDF6A", size: 1, spoil: 8, cold: false, base: 1.3 },
  pretzels: { name: "Pretzels", icon: "\uD83E\uDD68", size: 1, spoil: 5, cold: false, base: 1.15 },
  water: { name: "Water", icon: "\uD83D\uDCA7", size: 1, spoil: 0, cold: false, base: 0.7 },
  ice: { name: "Ice", icon: "\uD83E\uDDCA", size: 1, spoil: 40, cold: false, base: 0.4, isIce: true }
};
const LOCS = {
  depot: { name: "Wholesale Depot", blurb: "Cheapest crates in town. Almost nobody buys here.", traffic: 4, buy: 0.72, sell: 0.55, heat: 0.9, demand: { lemonade: 0.4, tea: 0.4, icecream: 0.3, fruit: 0.4, cookies: 0.5, pretzels: 0.5, water: 0.5, ice: 0.9 } },
  park: { name: "Riverside Park", blurb: "Families, bikes, and picnic blankets.", traffic: 18, buy: 1.05, sell: 1.15, heat: 1.0, demand: { lemonade: 1.4, tea: 1.1, icecream: 1.3, fruit: 1.2, cookies: 1.0, pretzels: 0.8, water: 1.1, ice: 0.6 } },
  downtown: { name: "Downtown Plaza", blurb: "Lunch rush. People pay for convenience.", traffic: 20, buy: 1.18, sell: 1.28, heat: 1.05, demand: { lemonade: 1.1, tea: 1.3, icecream: 0.8, fruit: 1.0, cookies: 1.35, pretzels: 1.2, water: 1.0, ice: 0.4 } },
  beach: { name: "Beach Boardwalk", blurb: "Sun, sand, and melting everything.", traffic: 22, buy: 1.22, sell: 1.35, heat: 1.35, demand: { lemonade: 1.5, tea: 1.2, icecream: 1.8, fruit: 1.1, cookies: 0.7, pretzels: 0.7, water: 1.6, ice: 0.8 } },
  school: { name: "Schoolyard Gate", blurb: "After-school swarm. Volume over fancy prices.", traffic: 24, buy: 0.98, sell: 0.95, heat: 1.0, demand: { lemonade: 1.2, tea: 0.7, icecream: 1.4, fruit: 1.1, cookies: 1.5, pretzels: 1.3, water: 1.0, ice: 0.5 } },
  stadium: { name: "Stadium Lot", blurb: "Quiet most days. Packed on game nights.", traffic: 10, buy: 1.15, sell: 1.2, heat: 1.1, demand: { lemonade: 1.0, tea: 0.8, icecream: 1.1, fruit: 0.6, cookies: 1.0, pretzels: 1.6, water: 1.4, ice: 0.5 } },
  market: { name: "Farmers Market", blurb: "Good buying and decent selling, if you time it.", traffic: 16, buy: 0.88, sell: 1.05, heat: 1.0, demand: { lemonade: 1.0, tea: 1.0, icecream: 0.7, fruit: 1.5, cookies: 1.1, pretzels: 1.0, water: 0.8, ice: 0.7 } },
  fair: { name: "Hillside Fair", blurb: "Weekend crowds and festival markups.", traffic: 14, buy: 1.1, sell: 1.4, heat: 1.05, demand: { lemonade: 1.3, tea: 1.1, icecream: 1.2, fruit: 1.1, cookies: 1.2, pretzels: 1.3, water: 1.1, ice: 0.6 } }
};
const WEATHER = {
  sunny: { label: "Sunny", icon: "\u2600\uFE0F", traffic: 1.05, melt: 1.1, spoil: 1.05 },
  hot: { label: "Heat wave", icon: "\uD83D\uDD25", traffic: 1.15, melt: 1.7, spoil: 1.35 },
  cloudy: { label: "Cloudy", icon: "\u2601\uFE0F", traffic: 0.92, melt: 0.8, spoil: 0.9 },
  rain: { label: "Rain", icon: "\uD83C\uDF27\uFE0F", traffic: 0.55, melt: 0.55, spoil: 0.85 },
  cold: { label: "Chilly", icon: "\uD83C\uDF2C\uFE0F", traffic: 0.7, melt: 0.35, spoil: 0.7 }
};
const UPGRADES = {
  cooler: { name: "Bigger Cooler", desc: "+12 cooler space", cost: [40, 90, 160], max: 3 },
  umbrella: { name: "Stand Umbrella", desc: "Rain hurts sales less", cost: [35], max: 1 },
  bike: { name: "Sturdier Cart", desc: "Fewer spills on the road", cost: [50], max: 1 },
  sign: { name: "Fancy Menu Board", desc: "Customers accept higher prices", cost: [45, 100], max: 2 },
  packs: { name: "Ice Packs", desc: "Ice and cold snacks last longer", cost: [30, 70], max: 2 }
};
const MAX_DAYS = 28;
const app = () => document.getElementById("app");
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rand = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function money(n) { return "$" + Number(n).toFixed(2); }
function esc(s) {
  return String(s)
    .split("&").join("&")
    .split("<").join("<")
    .split(">").join(">")
    .split(String.fromCharCode(34)).join(""")
    .split("'").join("&#39;");
}
let state = null;
let view = "title";
let modal = null;
let flash = [];
function emptyInv() {
  const inv = {};
  for (const id of Object.keys(GOODS)) inv[id] = [];
  return inv;
}
function qtyOf(id) {
  return (state.inv[id] || []).reduce((s, lot) => s + lot.qty, 0);
}
function usedSpace() {
  let n = 0;
  for (const id of Object.keys(GOODS)) n += qtyOf(id) * GOODS[id].size;
  return n;
}
function cap() {
  return 20 + (state.upgrades.cooler || 0) * 12;
}
function avgFresh(id) {
  const lots = state.inv[id] || [];
  const q = qtyOf(id);
  if (!q) return 100;
  return lots.reduce((s, l) => s + l.fresh * l.qty, 0) / q;
}
function unitCost(id) {
  const lots = state.inv[id] || [];
  const q = qtyOf(id);
  if (!q) return 0;
  return lots.reduce((s, l) => s + l.cost * l.qty, 0) / q;
}
function weekend() {
  return state.day % 7 === 6 || state.day % 7 === 0;
}
function newPrices() {
  const prices = {};
  for (const lid of Object.keys(LOCS)) {
    prices[lid] = {};
    for (const gid of Object.keys(GOODS)) {
      prices[lid][gid] = +(GOODS[gid].base * LOCS[lid].buy * (0.75 + Math.random() * 0.55)).toFixed(2);
    }
  }
  return prices;
}
function jitterPrices() {
  for (const lid of Object.keys(LOCS)) {
    for (const gid of Object.keys(GOODS)) {
      const next = state.prices[lid][gid] * rand(0.86, 1.16);
      state.prices[lid][gid] = +clamp(next, GOODS[gid].base * 0.45, GOODS[gid].base * 2.4).toFixed(2);
    }
  }
}
function rollWeather() {
  const bag = ["sunny", "sunny", "sunny", "hot", "hot", "cloudy", "cloudy", "rain", "cold"];
  if (state.event === "heatwave") return "hot";
  if (state.event === "rainout") return "rain";
  return pick(bag);
}
function rollEvent() {
  const roll = Math.random();
  if (roll < 0.08) return "festival";
  if (roll < 0.14) return "gameday";
  if (roll < 0.2) return "heatwave";
  if (roll < 0.26) return "rainout";
  if (roll < 0.32) return "surplus";
  if (roll < 0.37) return "inspector";
  if (roll < 0.42) return "rival";
  return null;
}
function eventLabel() {
  return {
    festival: "Street festival nearby - extra foot traffic.",
    gameday: "Game night! The stadium lot is packed.",
    heatwave: "Heat wave. Cold drinks fly. Ice vanishes.",
    rainout: "Washout risk. Umbrella helps.",
    surplus: "Depot surplus - ice cream and ice are cheap there.",
    inspector: "Health inspector is making rounds. Keep food fresh.",
    rival: "A rival cart is undercutting prices today."
  }[state.event] || "";
}
function bootState() {
  const prices = newPrices();
  const sell = {};
  for (const id of Object.keys(GOODS)) sell[id] = +(GOODS[id].base * 1.8).toFixed(2);
  return {
    day: 1, cash: 120, loc: "depot", weather: "sunny", event: null,
    inv: emptyInv(), prices: prices, sell: sell, reputation: 72,
    upgrades: { cooler: 0, umbrella: 0, bike: 0, sign: 0, packs: 0 },
    loan: 0, borrowed: false,
    log: ["Welcome to Fresh Circuit. Stock the cooler at the Depot, then hit the neighborhoods."],
    name: "You"
  };
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function scores() {
  try { return JSON.parse(localStorage.getItem(SCORE_KEY) || "[]"); } catch (e) { return []; }
}
function addScore(entry) {
  const list = scores();
  list.push(entry);
  list.sort(function(a, b) { return b.score - a.score; });
  try { localStorage.setItem(SCORE_KEY, JSON.stringify(list.slice(0, 12))); } catch (e) {}
}
function log(msg, kind) {
  kind = kind || "";
  state.log.unshift({ t: "Day " + state.day, msg: msg, kind: kind });
  state.log = state.log.slice(0, 40);
  flash.unshift({ msg: msg, kind: kind });
  flash = flash.slice(0, 6);
}
function takeLots(id, n) {
  const lots = state.inv[id];
  let left = n;
  const taken = [];
  while (left > 0 && lots.length) {
    const lot = lots[0];
    const use = Math.min(lot.qty, left);
    taken.push({ qty: use, fresh: lot.fresh, cost: lot.cost });
    lot.qty -= use;
    left -= use;
    if (lot.qty <= 0) lots.shift();
  }
  return taken;
}
function addLot(id, qty, fresh, cost) {
  if (qty <= 0) return;
  const lots = state.inv[id];
  const last = lots[lots.length - 1];
  if (last && Math.abs(last.fresh - fresh) < 3 && Math.abs(last.cost - cost) < 0.02) {
    last.qty += qty;
    last.cost = (last.cost * (last.qty - qty) + cost * qty) / last.qty;
  } else lots.push({ qty: qty, fresh: fresh, cost: cost });
}
function capacityLeft() { return cap() - usedSpace(); }
function buy(id, n) {
  n = Math.max(0, Math.floor(n));
  if (!n) return;
  const price = state.prices[state.loc][id];
  n = Math.min(n, capacityLeft(), Math.floor((state.cash + 0.0001) / price));
  if (!n) { log("Not enough cash or cooler space.", "warn"); render(); return; }
  state.cash -= price * n;
  addLot(id, n, 100, price);
  log("Bought " + n + " " + GOODS[id].name + " for " + money(price * n) + ".");
  save(); render();
}
function iceProtect() {
  const iceQty = qtyOf("ice");
  const coldQty = Object.keys(GOODS).filter(function(id) { return GOODS[id].cold; }).reduce(function(s, id) { return s + qtyOf(id); }, 0);
  if (!coldQty) return 1;
  const cover = clamp(iceQty / Math.max(4, coldQty * 0.35), 0, 1);
  const pack = 1 - 0.18 * (state.upgrades.packs || 0);
  return 1 - cover * 0.55 * (2 - pack) / 2;
}
function tickSpoil(travelSpill) {
  const w = WEATHER[state.weather];
  const loc = LOCS[state.loc];
  const protect = iceProtect();
  const pack = 1 - 0.16 * (state.upgrades.packs || 0);
  const notes = [];
  for (const id of Object.keys(GOODS)) {
    const g = GOODS[id];
    const lots = state.inv[id];
    if (!lots.length) continue;
    let rate = g.spoil * w.spoil * pack;
    if (g.cold) rate *= (0.55 + loc.heat * 0.7) * protect;
    if (g.isIce) rate *= w.melt * loc.heat * pack;
    if (state.weather === "hot" && (g.cold || g.isIce)) rate *= 1.25;
    let lost = 0;
    for (const lot of lots) lot.fresh = clamp(lot.fresh - rate, 0, 100);
    const keep = [];
    for (const lot of lots) {
      if (lot.fresh <= 0) lost += lot.qty;
      else keep.push(lot);
    }
    state.inv[id] = keep;
    if (lost) notes.push(lost + " " + g.name);
  }
  if (travelSpill) {
    const loadAmt = usedSpace() / cap();
    let chance = clamp((loadAmt - 0.75) * 0.8, 0, 0.45);
    if (state.weather === "hot") chance += 0.08;
    if (state.upgrades.bike) chance *= 0.35;
    if (Math.random() < chance && usedSpace() > 0) {
      const ids = Object.keys(GOODS).filter(function(id) { return qtyOf(id) > 0; });
      const id = pick(ids);
      const drop = Math.max(1, Math.floor(qtyOf(id) * rand(0.08, 0.22)));
      takeLots(id, drop);
      log("A bump in the road. You spilled " + drop + " " + GOODS[id].name + ".", "bad");
    }
  }
  if (notes.length) log("Spoiled or melted: " + notes.join(", ") + ".", "bad");
}
function expectedPrice(id) {
  const loc = LOCS[state.loc];
  const buyP = state.prices[state.loc][id];
  const sign = 1 + 0.08 * (state.upgrades.sign || 0);
  return buyP * 1.55 * loc.sell * sign * (GOODS[id].isIce ? 0.9 : 1);
}
function sellDay() {
  const loc = LOCS[state.loc];
  const w = WEATHER[state.weather];
  let traffic = loc.traffic * w.traffic * (0.7 + state.reputation / 200);
  if (weekend()) traffic *= (loc.name.indexOf("Fair") >= 0 || loc.name.indexOf("Park") >= 0 || loc.name.indexOf("Beach") >= 0) ? 1.35 : 1.08;
  if (state.event === "festival" && state.loc !== "depot") traffic *= 1.45;
  if (state.event === "gameday" && state.loc === "stadium") traffic *= 3.2;
  if (state.event === "rainout") traffic *= state.upgrades.umbrella ? 0.85 : 0.6;
  if (state.weather === "rain") traffic *= state.upgrades.umbrella ? 1.35 : 1;
  if (state.event === "rival") traffic *= 0.82;
  if (state.loc === "depot") traffic *= 0.5;
  traffic = Math.round(traffic * rand(0.85, 1.15));
  let revenue = 0, soldN = 0, complaints = 0;
  const lines = [];
  const any = Object.keys(GOODS).some(function(id) { return qtyOf(id) > 0; });
  if (!any) {
    log("You opened with an empty cooler. A few people shrugged and walked on.", "warn");
    state.reputation = clamp(state.reputation - 2, 20, 100);
    endDay();
    return;
  }
  for (const id of Object.keys(GOODS)) {
    const have = qtyOf(id);
    if (!have) continue;
    const fresh = avgFresh(id);
    const ask = state.sell[id];
    const fair = expectedPrice(id);
    const priceRatio = ask / Math.max(0.2, fair);
    let want = traffic * (loc.demand[id] || 0.6) * rand(0.35, 0.7);
    if (priceRatio > 1) want *= Math.pow(1 / priceRatio, 1.6 + (state.event === "rival" ? 0.5 : 0));
    else want *= 1 + (1 - priceRatio) * 0.35;
    if (fresh < 55) want *= fresh / 70;
    if (state.weather === "hot" && (id === "icecream" || id === "lemonade" || id === "water" || id === "ice")) want *= 1.25;
    if (state.weather === "cold" && (id === "icecream" || id === "water")) want *= 0.55;
    if (state.weather === "rain" && (id === "tea" || id === "pretzels" || id === "cookies")) want *= 1.2;
    want = Math.round(want);
    const sellQty = Math.min(have, Math.max(0, want));
    if (!sellQty) continue;
    const lots = takeLots(id, sellQty);
    const avgF = lots.reduce(function(s, l) { return s + l.fresh * l.qty; }, 0) / sellQty;
    revenue += ask * sellQty;
    soldN += sellQty;
    lines.push(sellQty + " " + GOODS[id].name);
    if (avgF < 45) complaints += sellQty;
    if (ask > fair * 1.8) complaints += Math.ceil(sellQty * 0.15);
  }
  state.cash += revenue;
  if (state.event === "inspector") {
    const left = Object.keys(GOODS).filter(function(id) { return qtyOf(id) > 0 && !GOODS[id].isIce; }).map(function(id) { return avgFresh(id); });
    const worst = Math.min.apply(null, left.concat([100]));
    if (worst < 40 || complaints > 4) {
      const fine = 18 + irand(0, 16);
      state.cash -= fine;
      state.reputation = clamp(state.reputation - 8, 20, 100);
      log("Inspector caught tired stock. Fine " + money(fine) + ".", "bad");
    } else {
      log("Inspector nodded at your cooler and moved on.", "good");
      state.reputation = clamp(state.reputation + 2, 20, 100);
    }
  }
  if (complaints > 3) {
    state.reputation = clamp(state.reputation - Math.min(10, complaints), 20, 100);
    log("A few customers grumbled about taste or price.", "warn");
  } else if (soldN > 12) state.reputation = clamp(state.reputation + 2, 20, 100);
  if (soldN) log("Sold " + lines.join(", ") + " for " + money(revenue) + ".", "good");
  else log("Nobody bought. Prices, weather, or location may be off.", "warn");
  if (Math.random() < 0.08 && soldN > 8) {
    const tip = +rand(2, 8).toFixed(2);
    state.cash += tip;
    log("A regular left a " + money(tip) + " tip.", "good");
  }
  endDay();
}
function travel(to) {
  if (to === state.loc) return;
  state.loc = to;
  log("Rolled the cart to " + LOCS[to].name + ".");
  tickSpoil(true);
  endDay();
}
function rest() {
  log("You stayed put and let the day drift.");
  tickSpoil(false);
  endDay();
}
function endDay() {
  if (state.loan > 0) {
    const interest = +(state.loan * 0.04).toFixed(2);
    state.loan = +(state.loan + interest).toFixed(2);
  }
  if (state.day >= MAX_DAYS) { finish(); return; }
  state.day += 1;
  jitterPrices();
  if (state.event === "surplus") {
    state.prices.depot.icecream = +(state.prices.depot.icecream * 0.62).toFixed(2);
    state.prices.depot.ice = +(state.prices.depot.ice * 0.55).toFixed(2);
  }
  state.event = rollEvent();
  state.weather = rollWeather();
  if (state.event) log(eventLabel(), "warn");
  if (state.cash < 8 && usedSpace() === 0 && !state.borrowed) modal = "broke";
  save();
  view = "home";
  render();
}
function borrow() {
  state.cash += 50;
  state.loan += 55;
  state.borrowed = true;
  log("Aunt June floated you $50. She wants $55 back before the finale.", "warn");
  modal = null;
  save(); render();
}
function repay() {
  const pay = Math.min(state.cash, state.loan);
  state.cash -= pay;
  state.loan = +(state.loan - pay).toFixed(2);
  if (state.loan < 0.01) state.loan = 0;
  log("Paid Aunt June " + money(pay) + ".");
  save(); render();
}
function buyUpgrade(id) {
  const u = UPGRADES[id];
  const lvl = state.upgrades[id] || 0;
  if (lvl >= u.max) return;
  const cost = u.cost[lvl];
  if (state.cash < cost) { log("Not enough cash for that upgrade.", "warn"); render(); return; }
  state.cash -= cost;
  state.upgrades[id] = lvl + 1;
  log("Upgraded " + u.name + ".", "good");
  save(); render();
}
function netWorth() {
  let inv = 0;
  for (const id of Object.keys(GOODS)) inv += qtyOf(id) * state.prices[state.loc][id] * (avgFresh(id) / 100);
  return state.cash + inv - state.loan;
}
function finish() {
  const score = Math.round(netWorth() * 10) / 10;
  addScore({ score: score, day: state.day, cash: +state.cash.toFixed(2), when: Date.now() });
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  state.final = score;
  view = "end";
  render();
}
function startNew() {
  state = bootState();
  flash = [];
  view = "home";
  modal = null;
  save();
  render();
}
