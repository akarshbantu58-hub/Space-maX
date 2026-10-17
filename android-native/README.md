# Space-maX Native Android

This is the native Android rebuild track. It does **not** use React, Vite, HTML, a browser, or a WebView. The game screen is an Android Activity with a GLSurfaceView renderer using OpenGL ES 2.0.

## Current foundation
- Native landscape Android activity and touch camera controls.
- OpenGL ES 3D scene with a procedural rocket, booster fins, engine bell, planet sphere, and starfield.
- Native Build / Flight / Planets / Launch controls.
- Interactive VAB controls for adding tanks, engines, capsule, and fins, plus craft reset.
- GitHub Actions workflow that produces a debug APK artifact.

## Build
From this directory, with JDK 17 and Gradle 8.9 installed:

    gradle --no-daemon assembleDebug

APK output: app/build/outputs/apk/debug/app-debug.apk

The current renderer is the first playable foundation, not the finished simulator. The VAB controls now adjust the visible tank, engine, capsule, and fin geometry. Detailed part catalogue, persistent craft assembly, orbital mechanics, 20+ planet assets, terrain materials, audio, and performance tuning are subsequent milestones.
