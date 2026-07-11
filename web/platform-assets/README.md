# Platform Assets

Shared native-platform assets for wrappers around the agent-meow web UI.

- `AppIcon.icon` is the Apple Icon Composer source of truth for the app icon.
  The iOS project references it directly. Electron consumes generated
  artifacts in `electron/icons/` (`Assets.car`, `icon.icns`, `icon.png`, and
  `icon.ico`) so packaging does not require Xcode 26.
- `logos/` contains the setup-screen logo SVGs (`agent-meow-logo.svg` for
  light backgrounds, `agent-meow-logo-reverse.svg` for dark backgrounds).
  Electron loads them from `platform-assets` at runtime; iOS symlinks them into
  its asset catalog so the SwiftUI setup screen uses the same sources.
- `agent-meow-icon.svg` is the 512×512 cat silhouette icon source used to
  generate PWA PNGs (192/512/maskable) and the apple-touch-icon.
  SwiftUI setup screen uses the same sources.
