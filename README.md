# leiren.aliz

A small, monospace personal writing site — plain HTML and CSS, no build
step, no dependencies. Hosted on GitHub Pages at
[leirenaliz.github.io](https://leirenaliz.github.io).

## Structure

```
index.html          # home — intro, latest posts, about
blog.html           # the full list of writing
posts/              # one HTML file per post
  hello-again.html
  on-monospace.html
styles.css          # the whole design system (~250 lines), light + dark
images/             # image assets
```

## Design

Retro / terminal aesthetic: monospace type, a paper-terminal light theme
and a dark theme (switched automatically via `prefers-color-scheme`),
faint scanlines, a blinking cursor, and ASCII rules. It respects
`prefers-reduced-motion` (no cursor blink, no scanline texture).

All styling lives in `styles.css` and is driven by CSS custom properties
declared at the top of the file — change the palette there and the whole
site follows.

## Adding a post

1. Copy an existing file in `posts/` to `posts/your-slug.html`.
2. Update the `<title>`, the post title, and the `.meta` line (date · tag · read time).
3. Add a matching `<li>` to the list in `blog.html` (and, if it's recent, to `index.html`).

## Local preview

It's static — open `index.html` in a browser, or serve the folder:

```
python3 -m http.server
```

Then visit <http://localhost:8000>.
