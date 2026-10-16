# Space-maX

Space-maX is an early-stage, browser-based 2D rocket-building and spaceflight simulator inspired by Spaceflight Simulator.

## Current features

- Canvas-based vehicle assembly with a parts catalogue and stage assignments.
- Preset rocket blueprints and browser-local blueprint saving.
- A basic flight scene, flight HUD, solar-system map, mission panel, and planet guide.
- React + TypeScript + Vite + Tailwind CSS.

## Run locally

Requirements: Node.js 22 or a compatible version supported by the installed Vite release.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For a production build:

```sh
npm run lint
npm run build
npm run preview
```

## Project status and audit findings

This is a prototype, not a validated orbital mechanics simulator. Flight physics, staging, orbital-map rendering, and mission completion need functional testing and calibration before being treated as physically accurate.

- **Staging order needs correction:** launch initializes `activeStage` to the highest stage number and activation removes that stage. In the default hopper preset, stage 2 contains the capsule and parachute while stage 1 contains the engine and fuel tank, so the first activation can remove the payload instead of the spent booster.
- **Mass units are inconsistent in flight calculations:** part mass and fuel are represented in tonnes, but thrust and aerodynamic drag are in newtons and are divided directly by the tonne total. Convert tonnes to kilograms before calculating acceleration, then validate against known cases.
- **Tablet input is unverified:** the build canvas listens to mouse events rather than pointer events, so touch-first controls have not been demonstrated.
- Blueprint saves use browser `localStorage`; they are local to that browser/profile and are not cloud-synced. Stored JSON is parsed without explicit corruption/schema recovery, so save/load error handling should be added.
- No automated unit or browser end-to-end test suite was present at the time of this audit.
- The repository did not contain a GitHub Actions workflow or a dependency lockfile at the time of this audit. CI installs from `package.json`; a committed lockfile should be added to make dependency resolution reproducible.
- `.env.example` lists `GEMINI_API_KEY` and `APP_URL`, but the current app entry flow does not demonstrate a connected Gemini feature. Do not put real API keys in client-side code or commit them.

## Recommended development order

1. Keep CI green and commit a package lockfile.
2. Add focused tests for rocket part placement, blueprint validation/storage, stage order, and physics state transitions.
3. Correct staging semantics and add actual decoupler/spent-stage separation.
4. Correct unit conversion and validate launch, landing, drag, fuel consumption, and time-warp stability against known cases.
5. Replace mouse-only canvas interactions with pointer/touch controls and verify on phones/tablets.
6. Add schema validation and clear save/load error handling for browser-stored blueprints.
7. Only then expand planetary transfers, orbital prediction, missions, audio polish, and any AI integration.

## Continuous integration

The GitHub Actions workflow runs the TypeScript check and Vite production build on pushes and pull requests. A successful CI build verifies compilation and bundling only; it does not prove gameplay or physics correctness.
