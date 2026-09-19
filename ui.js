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
  return '<div class="topbar"><div class="brand"><span class="mark">🍋</span> Fresh Circuit</div><div class="day-chip">Day ' +
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
  return '<div class="actions">' +
    '<button class="btn mint" data-go="buy">Buy stock</button>' +
    '<button class="btn primary" data-go="sell">Open stand</button>' +
    '<button class="btn" data-go="travel">Travel</button>' +
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
      top.map((s, i) => '<div class="row"><div><div class="title">#' + (i + 1) + ' ' + money(s.score) +
        '</div><div class="meta">cash ' + money(s.cash) + '</div></div></div>').join("") +
      '</div></div>';
  }
  return '<section class="screen title-screen"><div class="hero-card">' +
    '<div class="brand"><span class="mark">🍋</span> All ages</div>' +
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
  const preview = Object.keys(GOODS).filter((id) => qtyOf(id) > 0).slice(0, 4)
    .map((id) => GOODS[id].icon + ' ' + qtyOf(id)).join(' · ') || 'Cooler is empty';
  const notes = flash.slice(0, 4).map((l) => '<p class="' + (l.kind || '') + '">' + esc(l.msg) + '</p>').join('') ||
    '<p>The morning is quiet. Make a move.</p>';
  return '<section class="screen">' + hud() + nav() +
    '<div class="card"><div class="title">On the cart</div><div class="meta" style="margin-top:6px">' +
    preview + '</div></div><div class="card toast-log">' + notes + '</div>' +
    '<div class="actions"><button class="btn ghost" data-act="rest">Pass the day</button>' +
    '<button class="btn ghost" data-act="title">Save & menu</button></div></section>';
}
function buyView() {
  const loc = LOCS[state.loc];
  const rows = Object.keys(GOODS).map((id) => {
    const g = GOODS[id];
    const p = state.prices[state.loc][id];
    const have = qtyOf(id);
    const tag = g.cold ? 'needs ice' : g.spoil ? 'slow spoil' : 'shelf-stable';
    return '<div class="row"><div><div class="title">' + g.icon + ' ' + g.name +
      '</div><div class="meta">' + money(p) + ' each · you have ' + have + ' · ' + tag +
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
  const rows = Object.keys(GOODS).map((id) => {
    const g = GOODS[id];
    const have = qtyOf(id);
    const fresh = avgFresh(id);
    const fair = expectedPrice(id);
    const cls = fresh < 40 ? 'low' : fresh < 70 ? 'mid' : '';
    const bar = have ? '<div class="fresh ' + cls + '"><i style="width:' + fresh + '%"></i></div>' : '';
    return '<div class="row"><div><div class="title">' + g.icon + ' ' + g.name + ' · ' + have +
      '</div><div class="meta">Shoppers expect about ' + money(fair) + '</div>' + bar +
      '</div><input class="price-edit" type="number" min="0" step="0.05" value="' +
      state.sell[id].toFixed(2) + '" data-price="' + id + '" /></div>';
  }).join('');
  return '<section class="screen">' + hud() +
    '<div class="card"><h3>Set today\'s prices</h3>' +
    '<p class="loc-sub">Too high and the line walks. Too low and you work for melting ice.</p></div>' +
    '<div class="list">' + rows + '</div>' +
    '<div class="actions" style="margin-top:12px">' +
    '<button class="btn primary wide" data-act="open">Open the stand for the day</button>' +
    '<button class="btn wide" data-go="home">Back</button></div></section>';
}
function travelView() {
  const rows = Object.keys(LOCS).map((id) => {
    const loc = LOCS[id];
    const here = id === state.loc;
    return '<div class="row"><div><div class="title">' + loc.name + (here ? ' · you are here' : '') +
      '</div><div class="meta">' + loc.blurb + '</div></div>' +
      '<button class="btn small ' + (here ? '' : 'mint') + '" data-travel="' + id + '" ' +
      (here ? 'disabled' : '') + '>' + (here ? 'Here' : 'Go') + '</button></div>';
  }).join('');
  return '<section class="screen">' + hud() +
    '<div class="card"><h3>Hit the circuit</h3>' +
    '<p class="loc-sub">Travel spends the rest of the day. Heat and a stuffed cooler invite spills.</p></div>' +
    '<div class="list">' + rows + '</div>' +
    '<div class="actions" style="margin-top:12px"><button class="btn wide" data-go="home">Back</button></div></section>';
}
function coolerView() {
  const rows = Object.keys(GOODS).map((id) => {
    const g = GOODS[id];
    const have = qtyOf(id);
    if (!have) return '';
    const fresh = avgFresh(id);
    const cls = fresh < 40 ? 'low' : fresh < 70 ? 'mid' : '';
    return '<div class="row"><div><div class="title">' + g.icon + ' ' + g.name + ' · ' + have +
      '</div><div class="meta">Freshness ' + Math.round(fresh) + '% · avg cost ' + money(unitCost(id)) +
      '</div><div class="fresh ' + cls + '"><i style="width:' + fresh + '%"></i></div></div>' +
      '<button class="btn small danger" data-toss="' + id + '">Toss 1</button></div>';
  }).join('') || '<div class="card"><p class="loc-sub">Nothing in the cooler.</p></div>';
  return '<section class="screen">' + hud() +
    '<div class="card"><h3>Cooler</h3>' +
    '<p class="loc-sub">Ice slows the melt on lemonade, tea, ice cream, and fruit.</p></div>' +
    '<div class="list">' + rows + '</div>' +
    '<div class="actions" style="margin-top:12px"><button class="btn wide" data-go="home">Back</button></div></section>';
}
function shopView() {
  const rows = Object.keys(UPGRADES).map((id) => {
    const u = UPGRADES[id];
    const lvl = state.upgrades[id] || 0;
    const maxed = lvl >= u.max;
    const cost = maxed ? 'Maxed' : money(u.cost[lvl]);
    return '<div class="row"><div><div class="title">' + u.name + (lvl ? ' · ' + lvl + '/' + u.max : '') +
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
  const lines = (state.log || []).map((l) => {
    if (typeof l === 'string') return '<p>' + esc(l) + '</p>';
    return '<p class="' + (l.kind || '') + '"><b>' + esc(l.t) + '</b> — ' + esc(l.msg) + '</p>';
  }).join('') || '<p>Quiet so far.</p>';
  return '<section class="screen">' + hud() +
    '<div class="card toast-log" style="max-height:none">' + lines + '</div>' +
    '<div class="actions"><button class="btn wide" data-go="home">Back</button></div></section>';
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
    top.map((s, i) => '<div class="row"><div class="title">#' + (i + 1) + ' ' + money(s.score) + '</div></div>').join('') +
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
  const body = {
    title: titleView, home: homeView, buy: buyView, sell: sellView,
    travel: travelView, cooler: coolerView, shop: shopView, log: logView, end: endView
  }[view] || titleView;
  app().innerHTML = body() + modalHtml();
}
document.addEventListener('click', (e) => {
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
  if (t.dataset.act === 'open') { sellDay(); return; }
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
document.addEventListener('change', (e) => {
  const t = e.target.closest('[data-price]');
  if (!t || !state) return;
  state.sell[t.dataset.price] = +Math.max(0, +t.value || 0).toFixed(2);
  save();
});
view = 'title';
state = load() || bootState();
if (!load()) state = null;
render();
