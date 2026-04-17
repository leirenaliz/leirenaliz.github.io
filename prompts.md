# Wren Ashford — AI Image Prompt Library

Copy-paste prompts for generating consistent selfie-style images of Wren for **Lavender and Rage**. Pair every prompt with a negative prompt (bottom of file) and reuse the **Character Anchor Block** below so she looks like herself every time.

---

## The Character Anchor Block (paste into every prompt)

> **32-year-old woman, heart-shaped face, sharp jaw, pale grey-green eyes, freckles across nose and cheeks, collarbone-length near-black hair with dusty lavender under-layer and heavy curtain bangs, matte deep-plum lipstick, sharp black winged eyeliner, silver septum piercing, double nose stud on left, stretched lobes with black plugs, industrial ear barbell, vertical labret. Heavily tattooed: blackwork botanical right sleeve (lavender sprigs, luna moth, fine-line snake), American traditional left sleeve (dagger, rose, flaming heart, "RAGE" script), blackwork moth on chest between collarbones, small neck tattoos, tattooed fingers. Lean athletic build, 5'6". Silver stacked rings, gold hoop earrings, layered silver necklaces.**

Drop that block in verbatim. Then append the scene + top-specific language below.

---

## Universal style modifiers (append after the scene)

> *Shot on iPhone 15 Pro, candid selfie, natural window light, Kodak Portra 400 film grain, unretouched skin texture with visible pores and freckles, shallow depth of field, slight motion blur, 4:5 vertical, cinematic color grade, moody warm highlights, cool shadow tones.*

---

## Setting A — Bathroom Mirror Selfie

```
[CHARACTER ANCHOR BLOCK]

Wearing a fitted black ribbed tank top, blank chest, no graphic,
solid color, clean cotton texture for post-production design overlay.
Bathroom mirror selfie, phone held in tattooed right hand partially
covering the lower face, other hand relaxed at her side. Cream
subway tile walls, warm brass sconces casting golden light, small
pothos plant on counter, single lit pillar candle, slight fog at
mirror edges. Mirror slightly smudged. Chest-up framing.

[UNIVERSAL STYLE MODIFIERS]
```

**Tank color variants — swap line 1 accordingly:**
- `...fitted bone-white ribbed tank top...`
- `...fitted dusty lavender ribbed tank top...`
- `...fitted charcoal grey ribbed tank top...`
- `...fitted oxblood burgundy ribbed tank top...`
- `...fitted sage olive ribbed tank top...`

---

## Setting B — Bedroom / Home Studio

```
[CHARACTER ANCHOR BLOCK]

Wearing a cropped boxy washed-black tee, blank chest, solid color,
plain cotton for design overlay. Seated cross-legged on a bed with
off-white linen sheets and an oxblood throw. Black sheer curtains
diffusing afternoon light. Trailing pothos plant, tattoo flash prints
pinned to the wall behind her, open tarot deck on nightstand, warm
amber lamp on low setting. Phone held up casually for a mirror-free
selfie, slight smirk, eye contact with camera. Waist-up framing.

[UNIVERSAL STYLE MODIFIERS]
```

**Top variant for hoodie drops:**
- `Wearing an oversized lavender crewneck sweatshirt, blank chest, solid color, soft cotton fleece texture for design overlay.`

---

## Setting C — Car / Outdoor

```
[CHARACTER ANCHOR BLOCK]

Wearing a fitted black ribbed tank top, blank chest, solid color.
Seated in the driver's seat of a matte black vintage 1978 Ford
Bronco, golden hour sun streaming through the windshield creating
warm lens flare across her chest. Hand on the steering wheel
showing left-arm traditional tattoos, other hand holding phone
for selfie. Aviator sunglasses pushed up on her head. Dust motes
in the light. Shoulders-up to mid-chest framing.

[UNIVERSAL STYLE MODIFIERS]
```

**Outdoor alley variant:**
```
[CHARACTER ANCHOR BLOCK]

Wearing a bone-white fitted ribbed tank top, blank chest, solid color.
Standing against a weathered red-brick alley wall with subtle graffiti
tag in the corner, sodium-vapor streetlight beginning to glow at dusk.
Arm raised holding phone for selfie, free hand hooked in the pocket
of black Dickies shorts. Slight wind lifting her bangs. Waist-up
framing. Moth chest tattoo clearly visible above the neckline.

[UNIVERSAL STYLE MODIFIERS]
```

---

## Setting D — Neutral Wall (Clean Product Shot)

Use this setting whenever the **design on the tank is the hero.** Minimum visual noise, maximum tattoo + garment clarity.

```
[CHARACTER ANCHOR BLOCK]

Wearing a fitted [BLACK / BONE / LAVENDER / OXBLOOD / CHARCOAL / OLIVE]
ribbed tank top, perfectly blank chest area, solid color, even lighting
across the torso, clean cotton weave for high-fidelity design overlay
in post-production. Standing square to camera against a plain dusty-
lavender plaster wall, soft diffused window light from the left, gentle
shadow on right side. Phone held at shoulder height for selfie, minimal
expression, calm eye contact. Waist-up framing, tank fully visible
from neckline to mid-ribcage, no obstruction of chest area.

[UNIVERSAL STYLE MODIFIERS]
```

> **Why this one matters most:** this is the shot you'll actually overlay graphics onto. Keep her arm/hand *out of the chest area* so you have a clean rectangle to drop art into.

---

## Negative prompt (always include)

```
airbrushed skin, plastic skin, over-smoothed face, glamour retouching,
fake-looking tattoos, text on clothing, logo on clothing, graphic print
on clothing, band tee graphic, visible brand label, fashion campaign
lighting, studio softbox, uncanny eyes, asymmetric eyes, extra fingers,
extra hands, malformed hands, warped jewelry, melted piercings, blurry
tattoos, muddy blackwork, cartoonish, anime, 3D render, CGI, low detail,
oversaturated, HDR, watermark, signature, duplicate person, twins
```

---

## Seed & consistency workflow

1. **Pick one "hero" generation** of Wren's face you love.
2. In Midjourney: use `--cref [URL of that image]` on every subsequent prompt. Adjust `--cw 80-100` for strong character weight.
3. In SD / ComfyUI: train a small **LoRA** on 15-20 hero images, or use **IP-Adapter Face** with the hero reference.
4. In DALL·E / GPT-image: upload the hero image and say *"same woman, same face, same tattoos, different outfit/setting."*
5. Always regenerate rather than edit if the face drifts. Face consistency > speed.

---

## Prompt shortcut cheat-sheet

| I want... | Use |
|---|---|
| Mirror selfie, black tank, clean overlay area | Setting A, black tank variant |
| Lifestyle / "lived-in" post | Setting B |
| Moody brand hero shot | Setting C (Bronco) |
| Product flatlay-style where design is king | Setting D, lavender wall |
| Band-merch / festival energy | Setting C (alley variant) + oxblood tank |

---

*Paired with `character.md`. Update both together whenever Wren evolves.*
