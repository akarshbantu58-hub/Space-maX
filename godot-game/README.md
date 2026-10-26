# Space-maX — Godot 4 foundation

This folder begins the Godot 4 migration track for Space-maX. It is a native Android game-engine project and does not use HTML, React, a browser, or a WebView.

## What is included in this milestone

- Godot 4 project configured for the mobile-friendly Compatibility renderer.
- A menu scene and a separate 3D scene.
- Initial procedural 3D rocket and planet placeholder geometry.
- First playable flight-test controls: hold-to-thrust, left/right steering, fuel consumption, gravity, vertical speed and altitude readouts, and reset.
- Auto, portrait, and landscape orientation controls in the menu.
- An Android export preset targeting 64-bit ARM devices.
- A GitHub Actions workflow to attempt a repeatable debug APK export.

## Honest status

This is the **foundation milestone**, not the finished game. The rocket and planet are procedural placeholders. Real orbital mechanics, a modular vehicle assembly editor, persistent craft files, high-detail assets, terrain systems, mission progression, and the 150+ parts / 20+ worlds catalog have not been implemented yet. No claim of successful device testing is made by this commit.

## Build

The GitHub Actions workflow runs the Godot Android export in a CI container. Open the workflow run in GitHub and download the artifact named `Space-maX-Godot-Android-debug` if the export succeeds.

For local development, install a matching Godot 4 editor version and its Android export templates, then open this folder as a project. The export preset is named `Android`.

## Portrait and landscape

The project requests sensor-based orientation and includes menu controls to request Auto, Portrait, or Landscape. Actual behavior depends on Android export/runtime support and must be confirmed on the target Galaxy Tab A9 after an APK is produced.
