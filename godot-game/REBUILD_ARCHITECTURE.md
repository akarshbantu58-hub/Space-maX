# Space-maX clean rebuild

This branch is the clean-rebuild track. The Android APK workflow exports only `godot-game/`; the old Vite/web app is not packaged into this APK.

## Runtime layers

- **Godot 4 / GDScript:** 3D scene graph, rendering, touch UI, gameplay scene orchestration.
- **Kotlin (Android bridge, next integration milestone):** Android-specific lifecycle, haptics, safe-area/insets, and native Android services. Keep this isolated behind a bridge; do not duplicate gameplay logic.
- **Java:** use only where an Android API or third-party SDK has a Java-only interface. Kotlin can call Java directly, so a Java file is not added merely to increase language count.
- **Python (offline tools):** validate part/planet catalogs, check asset naming and dimensions, and prepare import manifests. Python is not required inside the Android runtime.
- **C++ (later, optional NDK module):** only add after profiling identifies a performance-critical simulation workload. Do not ship an untested native library just for language variety.

## Clean rebuild rules

1. Keep the Godot project as the only game payload in the APK export.
2. Give every Android build a version code and verify the APK artifact before asking the user to install it.
3. Build in GitHub Actions; the target workflow must fail if export templates or APK output are missing.
4. Treat current geometry and flight logic as prototype code, not a finished orbital simulator.
5. Add vehicle editor, staging, patched-conic/orbital physics, planet catalog, and high-detail assets in separate tested milestones.

## Validation

Run `python3 tools/validate_catalog.py` from the repository root. CI should run this before Android export.
