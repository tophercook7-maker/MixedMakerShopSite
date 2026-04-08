# `/builds` media — drop final shots here

All paths are under `next-app/public/`.

## StrainSpotter

| File | Slot |
|------|------|
| **`videos/strainspotter_ad_v2.mp4`** | Scanner / identification flow (hero video in page) |
| **`images/builds/strainspotter-database.jpg`** | Strain database |
| **`images/builds/strainspotter-vendors.jpg`** | Seed vendors |
| **`images/builds/strainspotter-garden.jpg`** | Garden / dashboard (wide) |

Wiring lives in `components/public/BuildsPage.tsx` (`MediaSlot` labels + `<video>` source).

## Henry AI

| File | Slot |
|------|------|
| **`images/builds/henry-ai-workspace.jpg`** | Workspace overview |
| **`images/builds/henry-ai-assistant.jpg`** | Assistant / tools |
| **`images/builds/henry-ai-systems.jpg`** | Workflows / systems (wide) |

Replace `MediaSlot` blocks with `<Image />` (or a small helper) when assets exist.
