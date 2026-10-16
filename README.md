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

## Project status and limitations

This is a prototype, not a validated orbital mechanics simulator. Flight physics, staging, orbital-map rendering, and mission completion need functional testing and calibration before being treated as physically accurate.

- Blueprint saves use browser `localStorage`; they are local to that browser/profile and are not cloud-synced.
- The current build canvas uses mouse events; touch-first/mobile controls have not been verified.
- No automated unit or browser end-to-end test suite was present at the time of this audit.
- The repository did not contain a GitHub Actions workflow or a dependency lockfile at the time of this audit. CI installs from `package.json`; a committed lockfile should be added to make dependency resolution reproducible.
- `.env.example` lists `GEMINI_API_KEY` and `APP_URL`, but the current app entry flow does not demonstrate a connected Gemini feature. Do not put real API keys in client-side code or commit them.

## Recommended development order

1. Get CI green and commit a package lockfile.
2. Add focused tests for rocket part placement, blueprint validation/storage, stage order, and physics state transitions.
3. Fix and test touch/pointer interactions for tablets and phones.
4. Correctly account for mass units in the thrust and drag calculations; validate launch/landing and time-warp stability against known cases.
5. Implement actual staging behavior (including decouplers and spent-stage separation) and verify parachute/landing gear behavior.
6. Add clear save/load error handling and schema validation for browser-stored blueprints.
7. Only then expand planetary transfers, orbital prediction, missions, audio polish, and any AI integration.

## Continuous integration

The GitHub Actions workflow runs the TypeScript check and Vite production build on pushes and pull requests. A successful CI build verifies compilation and bundling only; it does not prove gameplay or physics correctness.
