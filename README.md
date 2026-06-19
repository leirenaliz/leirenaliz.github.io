# Lavender and Rage — Brand Workshop

Internal workshop for AI personas, prompts, character refs, and brand collateral for **Lavender and Rage**.

The customer-facing site lives at **lavenderandrage.com** (Shopify).
This repo is the *behind-the-scenes* toolkit: character bibles, AI image prompts, brand voice guides, and persona portfolios used to generate consistent brand imagery.

---

## Contents

| File | What it is |
|---|---|
| `index.html` | Visual showcase of Wren Ashford, the lead brand influencer |
| `portfolio.html` | Visual showcase of the full 20-persona roster |
| `character.md` | Wren Ashford full character bible — physical specs, tattoo atlas, wardrobe, voice |
| `portfolio.md` | 20-persona reference doc — 5 influencers + 15 customers with AI anchor prompts each |
| `prompts.md` | Copy-paste AI image generation prompts (Midjourney / DALL·E / SD) with consistency anchors |
| `styles.css` | Shared visual styling for the HTML files |
| `images/` | Drop folder for generated persona images (see `images/README.md` for naming conventions) |

---

## How to use this workshop

### Generating new persona images
1. Open `portfolio.md` (or `character.md` for Wren specifically)
2. Find the persona you want to feature
3. Copy their **AI Anchor Prompt** verbatim
4. Append a setting block from `prompts.md` (mirror selfie, neutral wall, etc.)
5. Append the universal style modifiers from `prompts.md`
6. Generate. Iterate. Save the best as your "hero shot" for that persona.
7. For every subsequent image of that persona, use the hero shot as a reference (Midjourney `--cref`, SD IP-Adapter Face, DALL·E image upload) so the face stays consistent.

### Previewing the showcase pages
Open `index.html` or `portfolio.html` directly in any web browser — they're standalone and don't need a server. Or enable GitHub Pages on this repo (Settings → Pages → Source: main branch) and it'll be live at a private URL only you know.

### Adding new personas
1. Add their full entry to `portfolio.md` following the existing template
2. Add a matching card to `portfolio.html` with their AI anchor prompt
3. Generate hero shots, drop into `/images/`

---

## Brand identity reference

- **Brand:** Lavender and Rage — alt tattoo & piercing shop with apothecary goods, zines, band merch
- **Aesthetic:** soft + sharp, the duality of lavender (witchy, botanical, blackwork) and rage (punk, traditional, bold)
- **Lead influencer:** Wren Ashford (32, alt, tattooed brand face)
- **Roster:** 20 total personas spanning ages 19–58, varied ethnicities, body types, gender expressions, and alt sub-aesthetics

---

*Private workshop. Not customer-facing. All generated imagery is AI-produced and must be disclosed as such per platform policy.*
