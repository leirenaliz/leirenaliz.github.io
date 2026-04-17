# /images — gallery drop folder

Drop generated selfies of Wren here. Suggested naming convention:

```
wren_[setting]_[tank-color]_[variant].jpg
```

**Examples**
- `wren_mirror_black_01.jpg`
- `wren_wall_lavender_01.jpg`
- `wren_bronco_oxblood_01.jpg`
- `wren_bedroom_bone_02.jpg`

## Recommendations

- **Aspect ratio:** 4:5 vertical (1080&times;1350) for Instagram feed + grid.
- **Format:** JPG at ~85% quality, or WebP for the site.
- **Max file size:** ~400 KB each so the Pages site stays fast.
- **Naming:** lowercase, underscores, no spaces.

## Design overlays

The "blank chest" on every tank is intentional — that's where your Lavender and Rage graphics go. Workflow:

1. Generate Wren in a blank-chest tank (see `/prompts.md`).
2. Open in Photoshop / Figma / Procreate.
3. Place your design on a new layer over the chest area.
4. Blend mode: **Multiply** (dark designs on light tank) or **Screen** (light designs on dark tank) for a printed-fabric feel.
5. Add subtle fabric texture + wrinkle warp to sell the print.
6. Export and drop back into this folder.

## Gallery auto-fill (future)

Right now the gallery in `index.html` uses static dashed placeholders. When you have enough real shots, swap the `.gallery__slot` divs for `<img>` tags pointing at files in this folder.
