# Design Preferences — Connecting Cyber Networks LMS

## Rules (always apply)
1. **No opacity-based colors** — never use `bg-[#x]/10`, `text-[#x]/70`, `border-[#x]/30` etc. Use solid hex values only.
2. **Less spacing** — client screens are small. Use `p-3 sm:p-5`, `gap-2 sm:gap-3`, tight paddings. Avoid large `p-6`, `gap-6`, `mb-8` etc.
3. **Less border radius** — prefer `rounded-lg` over `rounded-2xl`, `rounded` over `rounded-xl`. Avoid `rounded-3xl`.
4. but the single sided border is not looks good, always use full border
5. **Well designed** — clean, structured, data-dense but not cluttered.
6. **No emojis** — always use icons (react-icons or lucide-react) instead of emoji anywhere in UI.
7. **Always responsive** — every component must work on mobile. Use `sm:`, `md:`, `lg:` breakpoints. Hide secondary columns on small screens, stack layouts vertically on mobile, use smaller text/padding at base size.
8. **MUI first** — always prefer MUI components (TextField, Select, Autocomplete, Tabs, Paper, Chip, Button, etc.) over raw HTML inputs/buttons or plain tailwind-only divs. Use Tailwind only for layout/spacing utility on top of MUI.
9. **Always colorful, never static/flat** — avoid plain white/gray-border-only cards. Give every section/tab/card its own accent color (colored top/left border, colored icon chip, colored pill), use gradients for header banners, and add hover elevation (Paper + boxShadow transition) so surfaces feel alive, not static.
10. **Keep editable forms inside tab content, not in the top info bar** — a profile/header bar at the top should stay read-only (avatar, name, status, quick-info chips, an Edit button). Clicking Edit should switch to/reveal the relevant tab's edit form; it must never expand the top bar into a big form.

## Brand Colors (always use these — solid fills only)
| Purpose | Hex |
|---------|-----|
| **Primary / CTA** | `#009DFF` (hover: `#007fd4`) |
| Violet / accent | `#7c3aed` (hover: `#6d28d9`) |
| Sky / Info | `#0284c7` (dark: `#0369a1`) |
| Cyan | `#06b6d4` |
| Emerald / Success | `#10b981` (dark: `#059669`) |
| Orange / Warning | `#f97316` (dark: `#ea6e0b`) |
| Amber | `#f59e0b` (dark: `#d97706`) |
| Rose / Error | `#f43f5e` |


Always prefer MUI design first
then any other like tailwindcss

also always ai need screen colorful
make the best looking design not a static looking design 
