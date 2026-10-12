# Changelog

All notable project changes are recorded here. The project follows semantic
versioning from the first public development release; APIs may still change
before `1.0.0`.

## [0.1.0] - 2026-10-12

### Added

- Versioned `compileOneBrandTheme()` request and result contract.
- Eleven semantic tokens derived from one locked brand color and an optional
  locked canvas color.
- Pair-specific WCAG 2.2 evidence for text, controls, boundaries, and focus.
- Inspectable provenance for every input and generated token.
- `exportThemeCss()` CSS custom-property exporter.
- `solpro-color theme` CLI command with JSON and CSS output formats.
- One Brand Color Compiler page and shared-engine browser playground.
- Core and CLI test coverage for deterministic compilation and varied inputs.

### Changed

- The browser playground now calls the same compiler used by the package and
  CLI instead of maintaining its own theme-generation logic.
- The project and workspace packages now report version `0.1.0`.

### Known boundaries

- This release accepts one brand color and one canvas; it does not yet select a
  source palette from a natural-language brief.
- Derived colors use documented sRGB mixing. Perceptual OKLCH transformations
  remain planned work.
- The packages are available from the repository but are not yet published to a
  package registry.

[0.1.0]: https://github.com/TejSolPro/color/releases/tag/v0.1.0
