# Changelog

## 1.0.2

- Fixed `PRem: Convert Selection to rem` replacing the whole selection when it only ended in a value (e.g. `margin: 16px` became `1rem`). Selections must now contain exactly one value; surrounding whitespace is preserved.
- Fixed negative values rounding differently than positive ones (`-1.000005rem` became `-1rem`).
- Units are now matched case-insensitively (`16PX`, `16Prem`).
- Shortcuts directly after another number (e.g. `1.2.5prem`) are no longer converted partially.
- `prem.pixelsPerRem` now respects workspace-folder and language-specific settings; invalid values fall back to `16`.
- Removed a stale build file from the published package and excluded source maps.
- Added unit tests for the conversion logic.

## 1.0.1

- Added GitHub repository metadata (`repository`, `homepage`, and `bugs`).

## 1.0.0

- Initial release of PRem.
- Added IntelliSense conversion from `<number>prem` to `rem`.
- Added IntelliSense conversion from `<number>pxrem` to `rem`.
- Added a `PRem: Convert Selection to rem` command for selected values.
- Scoped activation to style-heavy languages instead of global startup.
- Added configurable `prem.pixelsPerRem` setting.
