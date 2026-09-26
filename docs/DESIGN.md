# Flightdeck — Design Explanation

## 1. Goal and users

Flightdeck is an operations console for airline and airport operations staff. Their core questions are _where is every aircraft, which flights need attention, and what is the full picture of this one flight?_ The design answers those three questions on a single screen, without navigation, so an operator never loses situational awareness.

## 2. Layout and UX decisions

**Map-first, three-column layout.** The map occupies the centre and the largest area, as it is the primary source of spatial information. Supporting tools sit on either side in the order an operator uses them:

| Left — _find_                | Centre — _see_                   | Right — _understand & act_                 |
| ---------------------------- | -------------------------------- | ------------------------------------------ |
| Search, filters, flight list | KPI cards, map, legend, playback | Selected flight details, _Needs attention_ |

- **Dark theme by default.** Operations rooms favour dark interfaces to reduce glare over long shifts, and status colours stand out against dark surfaces. A light theme is one click away and remembered.
- **One status language everywhere.** En route (blue), Delayed (amber), Arrived (green), Boarding (purple), Scheduled (grey) are used identically on markers, badges, legend and KPIs — and **always paired with a text label**, never colour alone.
- **Selection is the central interaction.** It can start from the map, the list or _Needs attention_, and produces the same result everywhere: the plane is highlighted and others dimmed, the great-circle route is drawn (planned path dashed, flown part solid), the map flies to the route, the list row scrolls into view and details appear.
- **The URL owns the selection.** Clicking a flight navigates to `/ops/flight/:id`; the page reads the URL and updates the store. Refresh, browser back/forward and shared links therefore all restore the exact view. Unknown IDs show a _Flight not found_ state rather than an error.
- **Filters update everything together.** Map, list, KPIs and legend all derive from the same filtered stream, so the numbers can never disagree. The list shows _5 of 18_ to keep global context, while _Needs attention_ intentionally ignores filters so delays stay visible.
- **Every state is designed:** loading overlay, error with Retry, empty search results, nothing selected, flight not found, and a 404 page.

## 3. Architecture

```
FlightApi (JSON) ─► FlightStore (RxJS) ─► OperationsPage (smart) ─► presentational components
                        ▲    ▲                    │
     PlaybackService ───┘    └── setFilters / select ◄── outputs (filtersChange, flightSelect…)
```

- **Structure:** `core/` (models, data, state, services, utilities), `shared/ui/` (generic reusable components), `features/` (operations, flights, map). Features depend on core and shared, never on each other.
- **Smart vs. presentational.** Only `OperationsPage` injects services. Every other component communicates through `input()` / `output()`, runs with `OnPush`, and can be reused or tested in isolation. `KpiCard`, `StatusBadge` and `EmptyState` know nothing about flights.
- **Single source of truth.** `FlightStore` holds the loaded data, filters and selected id, and exposes derived streams: `filteredFlights$`, `kpis$`, `attention$`, `selectedFlight$`, `loadStatus$`.
- **Business rules are pure functions** (`flight.selectors.ts`, `flight-simulation.ts`, `geo.ts`) with no Angular dependencies — easy to reason about and to unit test.
- **RxJS where streams belong, signals where templates read.** RxJS handles events over time — `combineLatest` for derived state, `switchMap` + `startWith` + `catchError` for loading/error/retry, `debounceTime` for search, router events for selection, and a pausable, resettable playback clock built from `interval`, `withLatestFrom` and `scan`. At the component boundary, `toSignal` converts streams to signals, which suits Angular 21's zoneless change detection.
- **Swappable data source.** `FlightApi` is the only class aware of the JSON files; moving to a real API is a two-line change.

## 4. Leaflet integration

All Leaflet code lives in `features/map`, behind a component API of plain inputs and outputs — the rest of the app never imports Leaflet.

- The map is created in `afterNextRender` and destroyed through `DestroyRef`, preventing leaks.
- Each concern is a small **layer class** (`FlightMarkerLayer`, `RouteLayer`, `AirportLayer`). Angular `effect()`s push signal inputs into them, keeping data flow one-directional.
- `FlightMarkerLayer` **diffs** instead of redrawing: it keeps a `Map<id, Marker>`, moves existing markers, and swaps an icon only when its status, selection state or heading actually changes. This keeps filtering and 10 updates-per-second playback smooth.
- Markers are `L.divIcon` SVGs (rotatable, themeable via CSS); routes use CSS classes, so both themes work without JavaScript changes.
- A `ResizeObserver` calls `invalidateSize()` whenever panels or drawers change the map's size.
- Zooming to a selection is keyed to the selected **id**, so live position updates never cause repeated re-zooming. With `prefers-reduced-motion`, the map jumps instead of flying.
- Tiles come from OpenStreetMap (no API key); the dark basemap is a CSS filter on the tile pane only.

## 5. Responsive strategy

| Width        | Layout                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------- |
| ≥ 1280 px    | Three docked columns                                                                            |
| 1024–1279 px | Filters + map; details slide in from the right on selection                                     |
| < 1024 px    | Full-width map; ☰ _Flights_ opens filters and list as a left drawer; details as a right drawer |

CSS Grid and media queries define the layout; a **container query** keeps KPI cards four-across until the centre column itself becomes narrow. Angular CDK's `BreakpointObserver` is used only for behaviour (showing the menu button, closing the drawer after a selection). Closed drawers use `visibility: hidden` so they cannot receive keyboard focus.

## 6. Accessibility

Semantic landmarks (`header`, `main`, `aside`), labelled regions and a skip link; list rows and controls are real `<button>`s; visible focus rings; form fields wrapped in `<label>`s; `aria-current` on the selected row; `aria-live` announcements for result counts and details; `Esc` closes drawers and selections; reduced-motion support; status always shown as text; flight details marked up as a description list. Map interactions are fully mirrored by the keyboard-accessible list, because maps are inherently difficult for assistive technology.

## 7. Quality

TypeScript strict mode with no `any`; ESLint (including template accessibility rules) and Prettier; OnPush everywhere; unit tests with Vitest covering selectors, geometry, simulation, the store (including error → retry through a fake API injected via DI) and key components; GitHub Actions runs lint, tests and build on every push and deploys `main` to GitHub Pages.

## 8. Trade-offs and next steps

- **Mock data and simulated time** — the store would take a WebSocket/SSE feed in production; the playback clock would become the feed's timestamp.
- **Scale** — 18 flights need no clustering; for thousands, add marker clustering, viewport culling and canvas rendering.
- **Tests** — Leaflet rendering is verified manually; Playwright end-to-end tests would cover the full selection flow.
- **State** — a service store is the right weight for this scope; a larger product might adopt NgRx SignalStore.
- **Not implemented** — weather overlay (needs an API key) and filter persistence in the URL.
