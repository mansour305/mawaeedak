# Mawaeedak Design Guidelines

This guide summarizes the key visual principles extracted from the approved mockups for the Mawaeedak platform.  Adhering to these guidelines will ensure a consistent and polished user experience across all pages.

## Color Palette

The primary theme uses a combination of warm neutrals and rich gold accents:

| Color | Hex | Usage |
| --- | --- | --- |
| Primary | `#C8AA6E` | Buttons, highlights, icons |
| Secondary | `#F5F0E1` | Page backgrounds, panels |
| Accent | `#816341` | Headers, active states |
| Neutral | `#333333` | Primary text |
| Muted | `#777777` | Secondary text, borders |

Use the Tailwind config (`tailwind.config.ts`) to define these colors as variables so they can be referenced consistently.

## Typography

* **Headings** should use a bold weight with moderate tracking to convey structure (e.g. `font-extrabold` for page titles).
* **Body text** should use a medium weight (e.g. `font-medium`) with comfortable line height for readability.
* Arabic typography needs careful alignment; ensure that line heights and margins accommodate diacritics.
* Use consistent font sizes: e.g. 1.25rem for section titles, 1rem for body text, 0.875rem for captions.

## Layout and Components

* **Spacing**: Maintain generous padding around cards and sections (e.g. `p-4` or `p-6`) to avoid overcrowding.
* **Cards**: Use rounded corners (`rounded-xl`) with a subtle shadow (`shadow-sm`) for depth.  On hover, increase the shadow to indicate interactivity.
* **Buttons**: Primary actions should use the gold primary color with white text; secondary actions use a ghost or muted style.  Maintain a minimum touch target size of 40×40px.
* **Forms**: Inputs should have rounded corners and light backgrounds; incorporate icons inside inputs where helpful.  Provide clear error states in red with descriptive messages.
* **Navigation**: Use a bottom tab bar on mobile with icons and labels; on larger screens, provide a sidebar or top navigation as appropriate.

## Imagery

* Icons should be from a consistent set (e.g. Lucide) and follow the same stroke width.
* Use high‑quality photography that aligns with cultural norms; avoid cluttering pages with too many images.
* For placeholder images, use neutral backgrounds and subtle patterns.

## Responsiveness

Ensure that all layouts adapt to both mobile and desktop widths:

* On small screens, stack elements vertically and use full‑width components.
* On medium and large screens, arrange content in two columns where appropriate (e.g. sidebars next to main content).
* Use CSS grid or flexbox to adapt card grids for variable numbers of items.

## Accessibility

* All interactive elements must have keyboard focus styles.
* Provide alt text for images and meaningful labels for icons.
* Ensure color contrasts meet WCAG AA standards.

Refer to these guidelines whenever you add new pages or update existing ones to maintain consistency across the application.