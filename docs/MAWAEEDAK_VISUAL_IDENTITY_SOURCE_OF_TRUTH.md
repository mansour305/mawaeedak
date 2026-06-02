# Mawaeedak Visual Identity Source Of Truth

Updated: 2026-06-02

## Current Decision

The previous brown / gold / heritage identity is no longer approved as the product identity.

The application now uses a neutral baseline only. This baseline is temporary and exists to keep the product usable while a new identity is defined.

## Deprecated References

Do not use these as implementation guidance unless the owner explicitly re-approves them:

- Brown or espresso headers
- Gold heritage accents as the primary brand signal
- Desert imagery
- Paper / parchment textures
- Camel, palm, or heritage ornaments
- "Saudi luxury heritage" wording as the visual direction
- The old `/visual-reference-clone` screen as a design reference

## Active Baseline

- Arabic-first RTL interface
- Neutral background and card surfaces
- Token-driven colors in `src/index.css`
- Legacy `mw-*` classes retained only as compatibility wrappers
- No final brand palette is approved yet

## Required Inputs For The New Identity

Before rebuilding the visual system, define:

- Identity name or short direction
- Primary, secondary, and status color rules
- Logo or app mark direction
- Image or illustration style
- Icon style
- Component density and radius rules
- Screens that must represent the new identity first

## Security Boundary

Visual changes must not weaken existing security boundaries:

- No service-role secret in frontend source or bundle
- No admin token in `VITE_*`
- No demo admin bypass
- `/admin` remains guarded by server-side role checks
