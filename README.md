# ✈ Flightdeck — Flight Tracking & Operations Dashboard

A responsive operations console for monitoring domestic flights over India, built with **Angular 21** and **Leaflet**.
Operators can track 18 live (mock) flights on a map, inspect any flight's route and schedule, filter the traffic, watch key metrics, and replay traffic forward in time.

**Live demo:** https://iswariyav.github.io/flight-ops-dashboard/
**Demo video:** _add your Loom / YouTube link here_
**Design explanation:** [docs/DESIGN.md](docs/DESIGN.md)

![Desktop view with a selected flight](docs/screenshots/desktop-selected.png)

---

## Features

### Core requirements

| Requirement            | Implementation                                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interactive flight map | Leaflet map with 18 flights; plane icons rotated to heading and coloured by status; hover tooltip shows flight number, callsign, origin, destination and status |
| Route visualization    | Selecting a flight highlights it, dims the others, draws its **great-circle route** (planned path dashed, flown part solid) and flies the map to fit the route  |
| Flight details panel   | Flight number, callsign, airline, aircraft type, origin, destination, status, est. departure / arrival (IST), delay, altitude, ground speed                     |
| Operations dashboard   | KPI cards for Total, Active (airborne), Delayed (with average delay) and Arrived flights                                                                        |
| Search & filters       | Callsign search (debounced, also matches flight number) and Status, Origin, Destination filters — map, list and KPIs update together                            |

### Extras

- **Flight playback** — Play / Pause / Reset with 1× · 5× · 10× speed; planes move along their routes and land, KPIs update live
- **Dark / light theme** — toggle in the header, remembered between visits
- **Airport markers** with IATA codes
- **Shareable URLs** — the selected flight lives in the URL (`/ops/flight/ai-889`), so refresh, back/forward and links all work
- **Needs attention** panel listing delayed flights, worst first
- **Status legend** with live counts, **live IST / UTC clock**, loading and error states with retry
- **Responsive** — three columns on desktop, slide-in drawers on tablets
- **Accessible** — semantic landmarks, keyboard-operable list and controls, visible focus, status never shown by colour alone, reduced-motion support
- **Unit tests** (Vitest) for business logic, geometry, state and key components

---

## Tech stack

| Area      | Choice                                                                                        |
| --------- | --------------------------------------------------------------------------------------------- |
| Framework | Angular 21 — standalone components, zoneless change detection, signals, built-in control flow |
| Language  | TypeScript (strict mode)                                                                      |
| State     | RxJS store service; streams converted to signals at the component boundary with `toSignal`    |
| Forms     | Typed Reactive Forms (`NonNullableFormBuilder`)                                               |
| Routing   | Angular Router — lazy-loaded routes, URL-driven selection, 404 page                           |
| Map       | Leaflet 1.9 with OpenStreetMap tiles (no API key required)                                    |
| UI        | Custom SCSS design system (CSS custom properties) + Angular CDK (`BreakpointObserver`)        |
| Testing   | Vitest (Angular's default runner) + jsdom                                                     |
| Quality   | ESLint (angular-eslint), Prettier, Conventional Commits                                       |
| CI/CD     | GitHub Actions → lint, test, build, deploy to GitHub Pages                                    |

---

## Getting started

### Prerequisites

- **Node.js 20.19+ or 22.12+** (LTS recommended)
- npm 10+

### Install and run

```bash
git clone https://github.com/iswariyav/flight-ops-dashboard.git
cd flight-ops-dashboard
npm install
npm start
```

Open **http://localhost:4200** — it redirects to `/ops`.

### Scripts

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm start`        | Start the dev server on port 4200 |
| `npm run build`    | Production build to `dist/`       |
| `npm test`         | Run unit tests in watch mode      |
| `npm run test:ci`  | Run unit tests once               |
| `npm run lint`     | Lint TypeScript and templates     |
| `npm run lint:fix` | Lint and auto-fix                 |
| `npm run format`   | Format all files with Prettier    |

### Mock data

No backend is required. Data is served as static JSON from `public/data/`:

- `airports.json` — 18 Indian airports with real coordinates
- `flights.json` — 18 flights (9 en route, 3 delayed, 3 arrived, 1 boarding, 2 scheduled); positions lie on each flight's great-circle route

`FlightApi` is the only class that knows where data comes from — pointing it at a real REST API means changing two URLs.

---

## How to use

1. **Select a flight** — click a plane on the map, a row in the list, or an item in _Needs attention_.
2. **Clear the selection** — press `Esc`, click empty map space, or the ✕ in the details panel.
3. **Filter** — type a callsign (e.g. `igo`), or choose Status / Origin / Destination. Choosing an origin limits destinations to routes actually served from it.
4. **Play traffic** — press ▶ Play in the bottom-left of the map; pick 10× and watch flights land.
5. **Switch theme** — ☀ / ☾ in the header.
6. **Tablet** — use the ☰ Flights button to open filters and the list.

---

## Project structure

```
src/app/
├── core/                         # app-wide, framework-light logic
│   ├── models/                   # Flight, Airport, filters, KPIs, status labels
│   ├── data/flight-api.ts        # loads mock JSON (repository)
│   ├── state/
│   │   ├── flight-store.ts       # single source of truth (RxJS)
│   │   ├── flight.selectors.ts   # pure fns: filterFlights, computeKpis, needsAttention…
│   │   └── flight-simulation.ts  # pure fn: advanceFlights (playback)
│   ├── services/                 # theme, clock, playback
│   └── utils/geo.ts              # great-circle interpolation, bearing
├── shared/ui/                    # reusable presentational components
│   ├── kpi-card/  status-badge/  empty-state/
├── layout/app-header/
├── features/
│   ├── operations/operations-page/   # the only "smart" page component
│   ├── flights/  flight-filters/ flight-list/ flight-list-item/ flight-details/ attention-list/
│   ├── map/      flight-map/ map-legend/ map-toolbar/ layers/ map-icons.ts
│   └── not-found/
├── testing/flight-fixtures.ts    # small, known test dataset
└── app.routes.ts
```

---

## Testing

```bash
npm run test:ci
```

| Area                                   | What is verified                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `flight.selectors`                     | Search (case/space-insensitive, flight number), each filter, combined filters, KPI maths, delay ordering, status counts |
| `geo`                                  | Route endpoints, point count, interpolation, bearing                                                                    |
| `flight-simulation`                    | Flights advance along the route, land at 100 %, ground flights untouched, inputs never mutated                          |
| `FlightStore`                          | Loading, filters → list + KPIs, selection, _error → retry_ recovery (fake API via DI)                                   |
| `FlightFiltersPanel`                   | Debounced, trimmed search; status value; cascading destinations; reset                                                  |
| `FlightList`, `KpiCard`, `StatusBadge` | Rendering, events, empty state, progress clamping, text labels                                                          |

Leaflet rendering is verified manually — drawing a map needs a real browser, so unit tests focus on the logic that feeds it.

---

## Screenshots

|                                          |                                                           |
| ---------------------------------------- | --------------------------------------------------------- |
| ![Desktop](docs/screenshots/desktop.png) | ![Flight selected](docs/screenshots/desktop-selected.png) |
| Desktop overview                         | Selected flight with route                                |
| ![Filters](docs/screenshots/filters.png) | ![Light theme](docs/screenshots/light-theme.png)          |
| Filters applied                          | Light theme                                               |
| ![Tablet](docs/screenshots/tablet.png)   | ![Tablet drawer](docs/screenshots/tablet-drawer.png)      |
| Tablet (820 px)                          | Tablet with flight drawer                                 |

---

## Assumptions

- **Active** = airborne (en route, including delayed flights already in the air).
- **KPIs reflect the filtered view**; the list header shows _X of Y_ to keep global context.
- **Needs attention** always uses all flights, so delays stay visible even when filtered out.
- Times are shown in **IST**; the header also shows UTC.
- A selected flight stays on the map even if a filter would hide it.
- Target devices are desktop and tablet; phones work but are not optimised.

## Possible improvements

- Real-time feed (WebSocket / SSE) replacing the mock JSON and playback clock
- Marker clustering and viewport culling for thousands of flights
- Weather radar overlay
- End-to-end tests (Playwright) for the full selection flow
- Sync filters to URL query parameters
