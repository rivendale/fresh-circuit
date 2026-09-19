# Fresh Circuit

An all-ages traveling snack-cart game. Lemonade Stand’s daily stand management plus circuit trading, with spoilage and spills instead of contraband.

Buy cheap. Sell fresh. Watch the ice.

**Repo:** https://github.com/rivendale/fresh-circuit

**Play:** after GitHub Pages is on, https://rivendale.github.io/fresh-circuit/ — or open `index.html` locally.

## The loop

1. Stock the cooler at the **Wholesale Depot** (best crate prices).
2. Travel the circuit: park, plaza, boardwalk, schoolyard, stadium, market, fair.
3. Set prices and open the stand. Weather, events, reputation, and freshness decide the line.
4. Ice covers cold goods. Heat waves melt stock. A stuffed cooler spills on the road.
5. Last **28 days**. High score is net worth (cash + remaining stock − Aunt June).

## Why it spoils

The risk inventory from trading-circuit games is here as food science, not crime:

- Lemonade, iced tea, ice cream, and fruit cups slump without ice
- Ice itself melts faster in heat and at the beach
- Cookies and pretzels linger
- Water does not care
- Overpacking + a rough ride = spills
- A health inspector fines tired stock

Kids can play it. Adults can min-max the circuit.

## PWA

Installable, offline-first, mobile portrait.

- `manifest.json` + service worker
- Save game in `localStorage`
- Add to Home Screen on iOS/Android

## Stack

Vanilla HTML, CSS, and JavaScript. No build step, no backend, no tracking.

## License

MIT
