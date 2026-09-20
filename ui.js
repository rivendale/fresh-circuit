function skinBody() {
  const place = state && state.loc ? state.loc : "depot";
  const wx = state && state.weather ? state.weather : "sunny";
  document.body.className = "place-" + place + " wx-" + wx;
}
function crowdWord(id) {
  let t = LOCS[id].traffic;
  const w = WEATHER[state.weather];
  t *= w.traffic;
  if (weekend() && (id === "fair" || id === "park" || id === "beach")) t *= 1.35;
  if (state.event === "festival" && id !== "depot") t *= 1.45;
  if (state.event === "gameday" && id === "stadium") t *= 3.4;
  if (state.event === "rainout") t *= state.upgrades.umbrella ? 0.85 : 0.55;
  if (id === "depot") t *= 0.4;
  if (t >= 22) return "Packed";
  if (t >= 14) return "Busy";
  if (t >= 8) return "Okay";
  return "Quiet";
}
function heatWord(id) {
  const h = LOCS[id].heat * WEATHER[state.weather].melt;
  if (h >= 1.6) return "Scorching";
  if (h >= 1.15) return "Warm";
  return "Mild";
}
function stockTip(id) {
  let bestId = null;
  let best = 0;
  let held = 0;
  for (const gid of Object.keys(GOODS)) {
    const q = qtyOf(gid);
    if (!q) continue;
    held += q;
    const score = q * (LOCS[id].demand[gid] || 0.5);
    if (score > best) { best = score; bestId = gid; }
  }
  if (!held) return "Empty cart";
  if (best >= 6) return "Wants your " + GOODS[bestId].name;
  if (best >= 2) return "Okay for " + GOODS[bestId].name;
  return "Stock is so-so here";
}
function shelfHtml() {
  const bits = Object.keys(GOODS).filter(function (id) { return qtyOf(id) > 0; }).map(function (id) {
    const fresh = avgFresh(id);
    const wilt = fresh < 40 ? " wilt" : fresh < 70 ? " soft" : "";
    return '<span class="shelf-item' + wilt + '">' + GOODS[id].icon + ' ' + qtyOf(id) + '</span>';
  }).join('');
  return bits || '<div class="shelf-empty">Cooler is empty</div>';
}
function hud() {
  const w = WEATHER[state.weather];
  const loc = LOCS[state.loc];
  const space = usedSpace();
  const c = cap();
  const fill = space / c;
  const ice = qtyOf("ice");
  const iceCls = ice < 3 ? "bad" : ice < 8 ? "warn" : "";
  const spaceCls = fill > 0.9 ? "bad" : fill > 0.75 ? "warn" : "";
  const repCls = state.reputation < 45 ? "bad" : state.reputation < 65 ? "warn" : "";
  return '<div class="topbar"><div class="brand"><span class="mark">\uD83C\uDF4B</span> Fresh Circuit</div><div class="day-chip">Day ' +
    state.day + '/' + MAX_DAYS + '</div><div class="cash-chip">' + money(state.cash) + '</div></div>' +
    '<div class="hero-card"><div class="loc-row"><div><div class="loc-name">' + esc(loc.name) +
    '</div><div class="loc-sub">' + esc(loc.blurb) + '</div></div><div class="weather">' + w.icon +
    '<br>' + esc(w.label) + '</div></div><div class="meters">' +
    meter("Cooler", space + '/' + c, Math.min(100, fill * 100), spaceCls) +
    meter("Ice cover", ice + ' bags', clamp(ice / 12 * 100, 0, 100), iceCls) +
    meter("Reputation", Math.round(state.reputation), state.reputation, repCls) +
    meter("Net", money(netWorth()), clamp(netWorth() / 400 * 100, 4, 100), "") +
    '</div>' +
    (state.event ? '<div class="event-banner">' + esc(eventLabel()) + '</div>' : '') +
    (state.loan ? '<div class="loc-sub" style="margin-top:8px">Aunt June tab: ' + money(state.loan) + '</div>' : '') +
    '</div>';
}
function meter(label, val, pct, cls) {
  return '<div class="meter"><label><span>' + label + '</span><span>' + val +
    '</span></label><div class="bar ' + cls + '"><i style="width:' + pct + '%"></i></div></div>';
}
function nav() {
  const empty = usedSpace() === 0;
  const depot = state.loc === "depot";
  let buy = "btn mint";
  let sell = "btn";
  let go = "btn";
  if (depot && empty) buy += " primary";
  else if (depot && !empty) go += " primary";
  else if (!empty) sell += " primary";
  else go += " mint";
  if (!depot && !empty) sell = "btn primary";
  return '<div class="actions">' +
    '<button class="' + buy + '" data-go="buy">Buy stock</button>' +
    '<button class="' + sell + '" data-go="sell">Open stand</button>' +
    '<button class="' + go + '" data-go="travel">Travel</button>' +
    '<button class="btn" data-go="cooler">Cooler</button>' +
    '<button class="btn" data-go="shop">Upgrades</button>' +
    '<button class="btn" data-go="log">Day log</button></div>';
}
function titleView() {
  const saved = load();
  const top = scores().slice(0, 5);
  let scoresHtml = "";
  if (top.length) {
    scoresHtml = '<div class="card"><h3>Best circuits</h3><div class="list" style="margin-top:8px">' +
      top.map(function (s, i) {
        return '<div class="row"><div><div class="title">#' + (i + 1) + ' ' + money(s.score) +
          '</div><div class="meta">cash ' + money(s.cash) + '</div></div></div>';
      }).join("") +
      '</div></div>';
  }
  return '<section class="screen title-screen"><div class="hero-card">' +
    '<div class="brand"><span class="mark">\uD83C\uDF4B</span> All ages</div>' +
    '<h1 class="logo">Fresh Circuit</h1>' +
    '<p class="tag">Run a traveling snack cart. Buy where crates are cheap, sell where the line forms, and keep the ice from giving up.</p>' +
    '<ol class="how"><li>Stock the cooler at the Wholesale Depot.</li>' +
    '<li>Roll to parks, beaches, school gates, and game nights.</li>' +
    '<li>Set prices. Heat sells drinks. Rain empties the boardwalk.</li>' +
    '<li>Food spoils. Ice melts. Overpacking invites spills.</li>' +
    '<li>Last 28 days with the best net you can.</li></ol></div>' +
    '<div class="actions"><button class="btn primary wide" data-act="new">New season</button>' +
    (saved ? '<button class="btn mint wide" data-act="continue">Continue day ' + saved.day + '</button>' : '') +
    '</div>' + scoresHtml +
    '<p class="install-hint">Add to Home Screen for the full cart-in-your-pocket PWA.</p></section>';
}
function homeView() {
  const notes = flash.slice(0, 4).map(function (l) {
    return '<p class="' + (l.kind || '') + '">' + esc(l.msg) + '</p>';
  }).join('') || '<p>The morning is quiet. Make a move.</p>';
  return '<section class="screen">' + hud() + nav() +
    '<div class="card"><div class="title">On the cart</div><div class="shelf" style="margin-top:8px">' +
    shelfHtml() + '</div></div><div class="card toast-log">' + notes + '</div>' +
    '<div class="actions"><button class="btn ghost" data-act="rest">Pass the day</button>' +
    '<button class="btn ghost" data-act="title">Save and menu</button></div></section>';
}
function buyView() {
  const loc = LOCS[state.loc];
  const rows = Object.keys(GOODS).map(function (id) {
    const g = GOODS[id];
    const p = state.prices[state.loc][id];
    const have = qtyOf(id);
    const tag = g.cold ? 'needs ice' : g.spoil ? 'slow spoil' : 'shelf-stable';
    return '<div class="row"><div><div class="title">' + g.icon + ' ' + g.name +
      '</div><div class="meta">' + money(p) + ' each \u00b7 you have ' + have + ' \u00b7 ' + tag +
      '</div></div><div class="qty"><button data-buy="' + id + '" data-n="1">+1</button>' +
      '<button data-buy="' + id + '" data-n="5">+5</button></div></div>';
  }).join('');
  return '<section class="screen">' + hud() +
    '<div class="card"><h3>Buy in ' + esc(loc.name) + '</h3>' +
    '<p class="loc-sub">Wholesale is usually best at the Depot and the Farmers Market.</p></div>' +
    '<div class="list">' + rows + '</div>' +
    '<div class="actions" style="margin-top:12px"><button class="btn wide" data-go="home">Back</button></div></section>';
}
function sellView() {
  const rows = Object.keys(GOODS).map(function (id) {
    const g = GOODS[id];
    const have = qtyOf(id);
    const fresh = avgFresh(id);
    const fair = expectedPrice(id);
    const cls = fresh < 40 ? 'low' : fresh < 70 ? 'mid' : '';
    const bar = have ? '<div class="fresh ' + cls + '"><i style="width:' + fresh + '%"></i></div>' : '';
    return '<div class="row"><div><div class="title">' + g.icon + ' ' + g.name + ' \u00b7 ' + have +
      '</div><div class="meta">Shoppers expect about ' + money(fair) + '</div>' + bar +
      '</div><input class="price-edit" type="number" min="0" step="0.05" value="' +
      state.sell[id].toFixed(2) + '" data-price="' + id + '" /></div>';
  }).join('');
  return '<section class="screen">' + hud() +
    '<div class="card"><h3>Set prices</h3>' +
    '<p class="loc-sub">Too high and the line walks. Too low and you work for melting ice.</p></div>' +
    '<div class="list">' + rows + '</div>' +
    '<div class="actions" style="margin-top:12px">' +
    '<button class="btn primary wide" data-act="open">Open the stand for the day</button>' +
    '<button class="btn wide" data-go="home">Back</button></div></section>';
}
function travelView() {
  const rows = Object.keys(LOCS).map(function (id) {
    const loc = LOCS[id];
    const here = id === state.loc;
    const crowd = crowdWord(id);
    const heat = heatWord(id);
    const tip = stockTip(id);
    const pulse = (state.event === "gameday" && id === "stadium") || (weekend() && (id === "fair" || id === "beach"));
    const crowdCls = crowd === "Packed" ? "good pulse" : crowd === "Quiet" ? "" : "warn";
    const heatCls = heat === "Scorching" ? "hot" : heat === "Warm" ? "warn" : "";
    return '<div class="row"><div><div class="title">' + loc.name + (here ? ' \u00b7 you are here' : '') +
      '</div><div class="meta">' + loc.blurb + '</div><div class="chips">' +
      '<span class="chip ' + crowdCls + '">' + crowd + '</span>' +
      '<span class="chip ' + heatCls + '">' + heat + '</span>' +
      '<span class="chip">' + tip + '</span>' +
      (pulse ? '<span class="chip warn pulse">Today</span>' : '') +
      '</div></div>' +
      '<button class="btn small ' + (here ? '' : 'mint') + '" data-travel="' + id + '" ' +
      (here ? 'disabled' : '') + '>' + (here ? 'Here' : 'Go') + '</button></div>';
  }).join('');
  return '<section class="screen">' + hud() +
    '<div class="card"><h3>Hit the circuit</h3>' +
    '<p class="loc-sub">Travel spends the rest of the day. Packed and mild beats quiet and scorching.</p></div>' +
    '<div class="list">' + rows + '</div>' +
    '<div class="actions" style="margin-top:12px"><button class="btn wide" data-go="home">Back</button></div></section>';
}
function coolerView() {
  const rows = Object.keys(GOODS).map(function (id) {
    const g = GOODS[id];
    const have = qtyOf(id);
    if (!have) return '';
    const fresh = avgFresh(id);
    const cls = fresh < 40 ? 'low' : fresh < 70 ? 'mid' : '';
    return '<div class="row"><div><div class="title">' + g.icon + ' ' + g.name + ' \u00b7 ' + have +
      '</div><div class="meta">Freshness ' + Math.round(fresh) + '% \u00b7 avg cost ' + money(unitCost(id)) +
      '</div><div class="fresh ' + cls + '"><i style="width:' + fresh + '%"></i></div></div>' +
      '<button class="btn small danger" data-toss="' + id + '">Toss 1</button></div>';
  }).join('') || '<div class="card"><p class="loc-sub">Nothing in the cooler.</p></div>';
  return '<section class="screen">' + hud() +
    '<div class="card"><h3>Cooler</h3>' +
    '<p class="loc-sub">Ice slows the melt on lemonade, tea, ice cream, and fruit.</p>' +
    '<div class="shelf" style="margin-top:10px">' + shelfHtml() + '</div></div>' +
    '<div class="list">' + rows + '</div>' +
    '<div class="actions" style="margin-top:12px"><button class="btn wide" data-go="home">Back</button></div></section>';
}
function shopView() {
  const rows = Object.keys(UPGRADES).map(function (id) {
    const u = UPGRADES[id];
    const lvl = state.upgrades[id] || 0;
    const maxed = lvl >= u.max;
    const cost = maxed ? 'Maxed' : money(u.cost[lvl]);
    return '<div class="row"><div><div class="title">' + u.name + (lvl ? ' \u00b7 ' + lvl + '/' + u.max : '') +
      '</div><div class="meta">' + u.desc + '</div></div>' +
      '<button class="btn small ' + (maxed ? '' : 'primary') + '" data-up="' + id + '" ' +
      (maxed ? 'disabled' : '') + '>' + cost + '</button></div>';
  }).join('');
  return '<section class="screen">' + hud() +
    '<div class="card"><h3>Cart upgrades</h3><p class="loc-sub">' +
    (state.loan ? 'Aunt June is owed ' + money(state.loan) + '.' : 'Need a float? Only if the cooler and the till both run dry.') +
    '</p></div><div class="list">' + rows + '</div>' +
    (state.loan ? '<div class="actions"><button class="btn mint wide" data-act="repay">Repay Aunt June</button></div>' : '') +
    '<div class="actions" style="margin-top:12px"><button class="btn wide" data-go="home">Back</button></div></section>';
}
function logView() {
  const lines = (state.log || []).map(function (l) {
    if (typeof l === 'string') return '<p>' + esc(l) + '</p>';
    return '<p class="' + (l.kind || '') + '"><b>' + esc(l.t) + '</b> \u2014 ' + esc(l.msg) + '</p>';
  }).join('') || '<p>Quiet so far.</p>';
  return '<section class="screen">' + hud() +
    '<div class="card toast-log" style="max-height:none">' + lines + '</div>' +
    '<div class="actions"><button class="btn wide" data-go="home">Back</button></div></section>';
}
function openingView() {
  return '<section class="screen">' + hud() +
    '<div class="card" style="text-align:center">' +
    '<h3>Line forms</h3>' +
    '<div class="queue"><span>\uD83D\uDC64</span><span>\uD83D\uDC64</span><span>\uD83D\uDC64</span><span>\uD83C\uDF4B</span><span>\uD83D\uDCB0</span></div>' +
    '<p class="till-tick">Cups going out...</p>' +
    '<p class="loc-sub">Weather, price, and freshness decide the till.</p>' +
    '</div></section>';
}
function endView() {
  const top = scores().slice(0, 8);
  const score = state.final != null ? state.final : netWorth();
  return '<section class="screen title-screen"><div class="hero-card">' +
    '<h1 class="logo">Season over</h1>' +
    '<p class="tag">Twenty-eight days on the circuit. Here is the till.</p>' +
    '<div class="stat-grid">' +
    '<div class="stat"><b>' + money(score) + '</b><span>Net worth</span></div>' +
    '<div class="stat"><b>' + money(state.cash) + '</b><span>Cash</span></div>' +
    '<div class="stat"><b>' + Math.round(state.reputation) + '</b><span>Reputation</span></div>' +
    '<div class="stat"><b>' + (state.loan ? money(state.loan) : 'Clear') + '</b><span>Aunt June</span></div>' +
    '</div></div><div class="card"><h3>Best circuits</h3><div class="list" style="margin-top:8px">' +
    top.map(function (s, i) {
      return '<div class="row"><div class="title">#' + (i + 1) + ' ' + money(s.score) + '</div></div>';
    }).join('') +
    '</div></div><div class="actions">' +
    '<button class="btn primary wide" data-act="new">Run it back</button>' +
    '<button class="btn wide" data-act="title">Menu</button></div></section>';
}
function modalHtml() {
  if (modal !== 'broke') return '';
  return '<div class="modal-back" data-act="closemodal"><div class="modal">' +
    '<h3>Till is empty</h3>' +
    '<p class="loc-sub" style="margin:8px 0 14px">The cooler is bare and the jar is empty. Aunt June will float you $50 once. She wants $55 before the last day.</p>' +
    '<div class="actions"><button class="btn primary wide" data-act="borrow">Take the float</button>' +
    '<button class="btn danger wide" data-act="fold">Fold the season</button></div></div></div>';
}
function render() {
  skinBody();
  const body = {
    title: titleView, home: homeView, buy: buyView, sell: sellView,
    travel: travelView, cooler: coolerView, shop: shopView, log: logView,
    opening: openingView, end: endView
  }[view] || titleView;
  app().innerHTML = body() + modalHtml();
}
function playOpen() {
  view = "opening";
  render();
  setTimeout(function () { sellDay(); }, 1400);
}
document.addEventListener('click', function (e) {
  const t = e.target.closest('[data-go],[data-act],[data-buy],[data-travel],[data-up],[data-toss]');
  if (!t) return;
  if (t.dataset.go) { view = t.dataset.go; render(); return; }
  if (t.dataset.act === 'new') { startNew(); return; }
  if (t.dataset.act === 'continue') {
    state = load();
    if (!state) return startNew();
    flash = [];
    view = 'home';
    render();
    return;
  }
  if (t.dataset.act === 'title') { save(); view = 'title'; render(); return; }
  if (t.dataset.act === 'open') { playOpen(); return; }
  if (t.dataset.act === 'rest') { rest(); return; }
  if (t.dataset.act === 'borrow') { borrow(); return; }
  if (t.dataset.act === 'repay') { repay(); return; }
  if (t.dataset.act === 'fold') { finish(); return; }
  if (t.dataset.act === 'closemodal') { modal = null; render(); return; }
  if (t.dataset.buy) { buy(t.dataset.buy, +t.dataset.n); return; }
  if (t.dataset.travel) { travel(t.dataset.travel); return; }
  if (t.dataset.up) { buyUpgrade(t.dataset.up); return; }
  if (t.dataset.toss && qtyOf(t.dataset.toss) > 0) {
    takeLots(t.dataset.toss, 1);
    log('Tossed 1 ' + GOODS[t.dataset.toss].name + '.');
    save(); render();
  }
});
document.addEventListener('change', function (e) {
  const t = e.target.closest('[data-price]');
  if (!t || !state) return;
  state.sell[t.dataset.price] = +Math.max(0, +t.value || 0).toFixed(2);
  save();
});
view = 'title';
state = load() || bootState();
if (!load()) state = null;
render();
