# Kamal Teja Reddy, portfolio site

Static site, no framework and no build step. Everything needed to view it is
in this folder: `index.html`, `assets/`, `cv/`.

## Run it locally

Any static file server works, for example:

```
python -m http.server 8000
```

then open `http://localhost:8000/`. Opening `index.html` directly by double
click also works, but a local server is closer to how a real host serves it
(relative paths, correct MIME types for the PDF downloads).

## Replace the portrait

Drop a photo at `assets/portrait.jpg`, sized 1200 by 1500 pixels (a 4:5
portrait crop), and the site will use it automatically on the next load. No
HTML or CSS change is needed. Until that file exists, the hero shows a
placeholder, a large "KT" monogram on a tinted panel, drawn with plain HTML
and CSS inside an `<object>` element, so nobody ever sees a broken-image
icon. The filename and location must match exactly:
`assets/portrait.jpg`.

## Update the text

All page text lives directly in `index.html`, in English and German side by
side. Each translated piece of text is duplicated as two elements marked
`data-lang="en"` and `data-lang="de"`; only one is shown at a time, based on
the `data-lang-active` attribute on the `<html>` element (set by
`assets/site.js` from the visitor's saved choice or browser language). To
change a sentence, find both the `data-lang="en"` and `data-lang="de"`
copies nearby and edit them in place. There is no build step: edit and
reload.

The six key numbers and their captions are in the `id="numbers"` section.
Each number is written out as one `<span class="t-digit">` per character
(including punctuation such as `~`, `%`, and the letters in `WD18`) so it
can play the pop-in animation; edit the character spans directly rather
than replacing them with a plain text node, or the animation stops working
for that tile.

## Update the CV downloads

The two PDFs in `cv/` are already phone-number-free "web" copies, built
from `build/teja-en-web.json` and `build/teja-de-web.json` (copies of the
approved `build/teja-en.json` / `build/teja-de.json` with the phone contact
line removed) using the existing `build/build_cv.py`:

```
cd build
python build_cv.py teja-en-web.json --out out-web
python build_cv.py teja-de-web.json --out out-web
```

then copy the two PDFs from `build/out-web/` into `site/cv/`, replacing the
existing files. Do this whenever the source CV content changes. Do not
point the site at `build/out/` or `build/out-teja/`; those PDFs still carry
the phone number.

## Deploy

The whole `site/` folder can be published as-is to any static host:

- **Vercel**: `vercel --prod` from inside this folder (or drag-and-drop the
  folder in the dashboard). No framework preset needed, no build command.
- **Netlify**: drag-and-drop this folder onto the Netlify dashboard, or
  `netlify deploy --prod --dir .`.
- **GitHub Pages**: commit this folder's contents to a repository (root or
  a `docs/` folder) and enable Pages on that branch/folder in the
  repository settings.

Before going live:

1. Replace the placeholder canonical URL and the Open Graph/Twitter `url`
   implied by it: search `index.html` for `example.com` and replace with
   the real deployed address.
2. Re-render `assets/og-image.jpg` if the hero content changes materially
   (it is a screenshot of the hero, not hand-drawn).
3. Add the real `assets/portrait.jpg` (see above).

Nothing in this build step publishes or uploads anything automatically.

## Files

- `index.html`: the whole page markup, both languages inline.
- `assets/site.css`: all styling, including the transitions-dev motion
  tokens and the thirty-two-pattern skill's transition CSS actually used
  here (texts reveal, number pop-in, text-states swap, tabs sliding,
  accordion expand, learn-more hover).
- `assets/site.js`: language switching, mobile nav, sticky-nav active
  indicator, accordion wiring, scroll reveals, the reading-progress rule.
  Every enhancement in here is optional: the raw HTML already renders
  complete, correct content without it.
- `assets/favicon.svg`: the "KT" monogram used as the browser-tab icon.
- `assets/og-image.jpg`: the social-preview image, a 1200 by 630 render of
  the hero section.
- `cv/`: the two downloadable, phone-number-free CV PDFs.
