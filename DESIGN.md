---
name: Architectural Logic
colors:
  surface: '#08132a'
  surface-dim: '#08132a'
  surface-bright: '#2f3952'
  surface-container-lowest: '#030d25'
  surface-container-low: '#101b33'
  surface-container: '#151f37'
  surface-container-high: '#1f2942'
  surface-container-highest: '#2a344d'
  on-surface: '#d9e2ff'
  on-surface-variant: '#c5c6cd'
  inverse-surface: '#d9e2ff'
  inverse-on-surface: '#263049'
  outline: '#8f9097'
  outline-variant: '#44474d'
  surface-tint: '#b9c7e4'
  primary: '#b9c7e4'
  on-primary: '#233148'
  primary-container: '#0a192f'
  on-primary-container: '#74829d'
  inverse-primary: '#515f78'
  secondary: '#41e4c0'
  on-secondary: '#00382d'
  secondary-container: '#00c7a5'
  on-secondary-container: '#004d3f'
  tertiary: '#b6c6ed'
  on-tertiary: '#20304f'
  tertiary-container: '#061836'
  on-tertiary-container: '#7282a5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b9c7e4'
  on-primary-fixed: '#0d1c32'
  on-primary-fixed-variant: '#39475f'
  secondary-fixed: '#5ffbd6'
  secondary-fixed-dim: '#38debb'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#005142'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#b6c6ed'
  on-tertiary-fixed: '#091b39'
  on-tertiary-fixed-variant: '#374767'
  background: '#08132a'
  on-background: '#d9e2ff'
  surface-variant: '#2a344d'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
spacing:
  unit: 8px
  gutter: 24px
  margin-safe: 64px
  grid-subdivision: 32px
---

## Brand & Style

This design system is engineered for a Senior Frontend Professional, emphasizing technical authority, structural integrity, and high-performance execution. The aesthetic follows a **High-Tech Minimalism** approach, blending the precision of an IDE with the sophistication of high-end fintech platforms. 

The visual narrative centers on "The Blueprint of Performance"—using structural elements to represent the bridge between complex architecture and seamless user experiences. The emotional response should be one of immediate trust, indicating a developer who values code quality, scalability, and modern standards. Key visual motifs include subtle mathematical grids, node-and-edge patterns, and data-driven textures that suggest movement and efficiency.

## Colors

The palette is rooted in a deep "Midnight Navy" foundation to provide a sophisticated, low-fatigue backdrop typical of modern development environments. 

- **Primary:** A deep navy used for the foundational canvas.
- **Secondary (Accent):** An "Electric Cyan" or "Cyber Mint" used sparingly for high-impact focal points, callouts, and interactive states.
- **Tertiary:** A slightly lighter navy used for structural containers and layering depth.
- **Neutral:** A cool-toned silver-white for primary text, ensuring maximum readability against dark backgrounds.

Gradients should be used subtly, transitioning from the deep primary navy to a slightly more vibrant royal blue to simulate depth and light sourcing.

## Typography

This design system utilizes a dual-font strategy to balance technical grit with corporate clarity.

- **Headlines & Labels:** **Space Grotesk** provides a geometric, slightly futuristic feel that echoes monospaced fonts without sacrificing professional polish. It is used for names, titles, and technical tags.
- **Body & Metadata:** **Inter** is used for descriptions and supporting text. Its neutral, highly legible character provides the "functional" counterweight to the more expressive headline font.

Emphasis is placed on tight tracking for headlines and generous letter spacing for uppercase labels to evoke a "documentation" or "schematic" aesthetic.

## Layout & Spacing

The layout follows a **Fixed Grid** model inspired by architectural drafting. The design system utilizes an 8px base unit to ensure all elements align to a predictable rhythm.

For the LinkedIn banner, content should be weighted towards the right 60% of the canvas to account for the profile picture obstruction on the left. Layout elements should be anchored to visible or "ghost" grid lines. Technical textures (like dot matrices or thin linear grids) should be used as background layers, aligned strictly to the spacing units. Use generous margins to maintain an "expensive" and authoritative feel.

## Elevation & Depth

This design system employs **Tonal Layering** and **Subtle Glassmorphism** rather than traditional heavy shadows.

- **Layers:** Use the Tertiary color (#112240) to create "containers" that sit slightly above the Primary background.
- **Borders:** Instead of shadows, use 1px "Inner Glow" borders using a low-opacity version of the secondary cyan color (10-15% opacity). This mimics a backlit screen or a high-end UI dashboard.
- **Depth:** Background textures (grids/patterns) should have a very low contrast (2-4% opacity) to create a sense of infinite spatial depth without distracting from the primary content.

## Shapes

The shape language is **Sharp and Engineering-Led**. 

A `0px` border radius is preferred for most structural elements to emphasize "Architecture" and "Logic." If containers are used for tags or chips, use a very slight `2px` (Soft) radius only if necessary to distinguish them from the background. 

Geometric accents should favor 45-degree angles and perfect circles for data-visualization markers. Avoid organic or overly rounded "bubbly" shapes, as they detract from the authoritative, high-tech persona of the design system.

## Components

- **Tech Chips:** Rectangular boxes with 1px solid borders in the neutral or secondary color. Text should be in `label-caps`.
- **Architecture Lines:** Ultra-thin (0.5pt to 1pt) lines used to connect text blocks to abstract points in the background, simulating a system diagram.
- **Data Markers:** Small circular nodes placed at grid intersections, occasionally "pulsing" with a subtle outer glow of the secondary color.
- **Code Snippet Containers:** Use a "Dark Mode IDE" style—background slightly darker than the primary color, with a vertical "line-number" border on the left in the secondary color.
- **Call-to-Action:** If an email or URL is included, it should be presented as a "Command Line" input string (e.g., `> contact: name@domain.com`) to reinforce the engineer identity.