# Full Responsive UI Refactor & Architecture Restructuring

## Goal Description

Implement the approved major changes:
- Restructure component directories to plural naming (`layouts`, `sections`, `ui`, `three`, `admin`, `animations`, `shared`, `overlays`, `forms`).
- Move existing components into the new folders accordingly.
- Rename `ThreeScene.tsx` to `ThreeCanvas.tsx` and update all imports.
- Create a UI primitive library under `src/components/ui/` with barrel export (`index.ts`).
- Update the Navbar and ResponsiveNavbar to use the new UI primitives where possible.
- Ensure all imports across the codebase are updated to the new paths.
- Preserve existing functionality and visual design.
- Run build and dev servers to verify stability.

## User Review Required

> [!IMPORTANT]
> The restructuring will modify many import paths. Please confirm that you are comfortable with a sweeping rename and that no external packages rely on the original import paths.

## Open Questions

> [!QUESTION]
> Do you want the existing UI components (e.g., `Button`, `GlassCard`) to be extracted into separate files now, or should we keep them inline for the moment?

> [!QUESTION]
> Should we generate any new design token entries in `tailwind.config.js` for the new breakpoints, or are the current custom screens sufficient?

## Proposed Changes

---
### Directory Restructuring

- **[MODIFY]** `src/components/layouts/.keep` – placeholder to ensure folder exists.
- **[MODIFY]** `src/components/sections/.keep` – placeholder.
- **[MODIFY]** `src/components/ui/.keep` – placeholder.
- **[MODIFY]** `src/components/three/.keep` – placeholder.
- **[MODIFY]** `src/components/admin/.keep`
- **[MODIFY]** `src/components/animations/.keep`
- **[MODIFY]** `src/components/shared/.keep`
- **[MODIFY]** `src/components/overlays/.keep`
- **[MODIFY]** `src/components/forms/.keep`

---
### Component Moves

- Move `Navbar.tsx` → `src/components/layouts/Navbar.tsx`
- Move `ResponsiveNavbar.tsx` → `src/components/layouts/ResponsiveNavbar.tsx`
- Move `ThreeScene.tsx` → `src/components/three/ThreeCanvas.tsx` (rename)
- Move any other layout‑related components into `layouts` (e.g., `LoadingScreen.tsx` if used as overlay).

---
### UI Primitive Library

Create new files under `src/components/ui/`:
- `Button.tsx` – wraps standard button with glassmorphism styling.
- `GlassCard.tsx`
- `SectionTitle.tsx`
- `GlowText.tsx`
- `AnimatedContainer.tsx`
- `Modal.tsx`
- `InputField.tsx`

Add barrel export `src/components/ui/index.ts` exporting all above.

---
### Import Updates

Search and replace throughout the project:
- `../components/ThreeScene` → `../components/three/ThreeCanvas`
- `../components/Navbar` → `../components/layouts/Navbar`
- `../components/ResponsiveNavbar` → `../components/layouts/ResponsiveNavbar`
- Any UI component imports updated to `../components/ui`.

---
### Build & Verification

1. Run `npm run dev` – ensure no TypeScript errors.
2. Run `npm run build` – ensure production bundle succeeds.
3. Manually test main sections (Hero, Navbar, mobile menu) for visual regressions.
4. Verify that the mobile overlay menu still uses glassmorphism and scroll lock.
5. Confirm that Three.js canvas renders correctly after rename.

## Verification Plan

### Automated Tests
- `npm run lint` – ensure no import path lint errors.
- `npm run type-check` (if script exists) – TypeScript compile.

### Manual Verification
- Open the app in a desktop browser, check all navigation links, hero section, and 3D canvas.
- Resize to xs/fold/mobile breakpoints; verify layout, typography (clamp), and no overflow.
- Open mobile menu, test touch targets, scroll lock, and animation.
- Inspect console for any runtime errors.

---
