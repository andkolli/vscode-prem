# PRem

PRem ist the fastest way to convert pixel values into `rem` units directly via IntelliSense in VS Code.

Type a number followed by the custom keywords `prem` or `pxrem`, then accept the suggestion.
If completion is unavailable or disabled, select a value like `16px` and run `PRem: Convert Selection to rem`.

PRem is scoped to style-heavy languages such as CSS, SCSS, Sass, Less, HTML, Vue, Svelte, and Astro.

Examples:
- `16prem` → `1rem`
- `16pxrem` → `1rem`

## Settings

`prem.pixelsPerRem`

- Default: `16`
- Controls how many pixels equal `1rem`

## Command

`PRem: Convert Selection to rem`

- Converts selected values like `16px`, `24prem`, `24pxrem`, or bare numbers like `32` to `rem`
- Bare numbers are treated as pixel values
- Available from the Command Palette and the editor context menu when text is selected
