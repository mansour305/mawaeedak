# Mawaeedak Design Guidelines

## VISUAL SOURCE OF TRUTH

**IMPORTANT**: All UI implementation must follow the design references in `docs/design-reference/final-2026/`.

These guidelines summarize the key visual principles extracted from those approved mockups for the Mawaeedak platform.

## Design Language: Saudi Premium Minimal

- Warm ivory background (#FAF7F2)
- Soft sand texture with muted gold accents (#A78042)
- Premium Arabic typography with Noto Sans Arabic
- Rounded cards with subtle shadows
- Thin gold dividers and ornamental separators
- Palm/desert/lantern motifs
- Soft low-contrast background imagery
- Clear RTL alignment
- Balanced text hierarchy

## Color Palette

| Color | Hex | Usage |
| --- | --- | --- |
| Background | `#FAF7F2` | Warm ivory background |
| Surface | `#FFFCF7` | Card surface |
| Card | `#FFFFFF / #FFFDF8` | Cards and containers |
| Primary Text | `#2F2B25` | Primary text (avoid overly heavy black) |
| Secondary Text | `#6F6557` | Secondary text |
| Muted Text | `#8A8175` | Muted labels |
| Gold | `#A78042` | Gold accents |
| Gold Light | `#C9A063` | Light gold highlights |
| Brown | `#4A2413` | Deep brown accents |
| Border | `rgba(201,160,99,0.22)` | Subtle gold borders |

## Typography

Use one clean Arabic font system:

- **Primary**: Noto Sans Arabic
- **Fallback**: IBM Plex Sans Arabic, Tajawal, Arial, sans-serif

Weights:
- Page title: 700-800
- Section title: 700
- Card title: 700
- Body: 400-500
- Buttons: 600-700

## Layout and Components

- **Spacing**: Maintain generous padding around cards and sections (e.g., `p-4` or `p-6`) to avoid overcrowding.
- **Cards**: Use rounded corners (`rounded-xl` to `rounded-[28px]`) with subtle shadows. On hover, increase the shadow to indicate interactivity.
- **Buttons**: Primary actions should use the gold primary color (#C9A063) with white text; secondary actions use a ghost or muted style. Maintain a minimum touch target size of 40x40px.
- **Forms**: Inputs should have rounded corners and light backgrounds; incorporate icons inside inputs where helpful. Provide clear error states in red with descriptive messages.
- **Navigation**: Use a bottom tab bar on mobile with icons and labels; on larger screens, provide a sidebar or top navigation as appropriate.

## Imagery

- Icons should be from a consistent set (e.g., Lucide) and follow the same stroke width.
- Use high quality photography that aligns with cultural norms; avoid cluttering pages with too many images.
- For placeholder images, use neutral backgrounds and subtle patterns.
- **Device frames in mockups are presentation ONLY and must NOT be rendered in the actual app UI**.

## Responsiveness

Ensure that all layouts adapt to both mobile and desktop widths:

- On small screens, stack elements vertically and use full-width components.
- On medium and large screens, arrange content in two columns where appropriate (e.g., sidebars next to main content).
- Use CSS grid or flexbox to adapt card grids for variable numbers of items.

## Accessibility

- All interactive elements must have keyboard focus styles.
- Provide alt text for images and meaningful labels for icons.
- Ensure color contrasts meet WCAG AA standards.

Refer to `docs/design-reference/final-2026/` for all screen-level visual references.
