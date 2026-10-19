# DulceMood catalog

Objective: standalone catalog site for DulceMood (home bakery) fed by a Google Sheet, published with a button from the sheet.
Branch: `feat/catalog` · Delivery: single-pr · Test runner: vitest (`npm test`)

## Specs

- **S1** Stack: Codbyte standard package — Astro + Tailwind, static site, catalog read from a Google Sheet published as CSV at build time, local CSV fallback (reuse from `landing-propuesta`).
- **S2** Palette: "#f5ebe6, #55674c, #f9cdd5, #5c3a2e, #ffffff". Assumption: white text on #f9cdd5 fails contrast, so CTAs use #55674c / #5c3a2e and pink is accent/background only.
- **S3** Products: "cookies en varios tamaños (se distinguen por gramaje, por ejemplo, cookies de 10g, de 25g, etc.), cuadraditos de limon y de limon con arandanos, diversos budines, magdalenas diversas, trufas, y pedidos por encargo. Tortas no hace, tartas si pero por encargo."
- **S4** Packs: "una caja de 9 cuadraditos de limon, caja de 9 trufas y asi..."
- **S5** Data model (proposed, accepted with "dale"): one sheet row per variant; columns `producto, categoria, variante, precio, disponibilidad, imagen, descripcion`; rows sharing `producto`+`categoria` group into one card with a variant selector. `disponibilidad`: Disponible (default) / Por encargo / Agotado.
- **S6** Ordering via WhatsApp with the selected product and variant; a section for custom "pedidos por encargo".
- **S7** Publishing: "La idea es que ella cargue su lista de productos en la planilla de drive, y de alguna forma lo suba al sitio. [...] con que lo pueda subir con un boton desde un panel administrativo esta bien." Implemented as an Apps Script menu "Publicar cambios" in the sheet that calls the hosting deploy hook (no separate panel); the same script serves the sheet as CSV via a web app (`SHEET_URL`).
- **S8** Hosting: "Lo vamos a subir a netlify, asi que prepara eso tambien". External setup by the developer.

## Tasks

- [x] T1 (S1, S2) Scaffold Astro + Tailwind + palette tokens + layout — inline — 89876c8
- [x] T2 (S5) Catalog module: CSV parse, variant grouping, availability — inline, RED 11 failing → GREEN 15/15 — 42451b8
- [x] T3 (S3, S4, S6) Catalog page: categories, search, variant selector, WhatsApp order, encargo section — inline, build OK + DOM check in Chrome — a3983c3
- [x] T4 (S7) Apps Script "Publicar cambios" + sheet template + README setup — inline, CSV roundtrip test (written with the code, no RED) — a21872c
- [x] T5 (S8) Deploy, env var `SHEET_URL`, deploy hook, real WhatsApp number — user setup + PR #3, verified live end to end

## Log

- **L1** (2026-10-19) "buenas! comencemos a desarrollar el catalogo para el emprendimiento de mi novia! busca en la memoria y en este proyecto, que algo hablamos. Ya me cree el repo: https://github.com/JuaniLavenia/dulce-mood. Mi novia ya me paso su paleta de colores: #f5ebe6, #55674c, #f9cdd5, #5c3a2e, #ffffff"
- **L2** (2026-10-19) "genial, dale, por ahora vende cookies en varios tamaños (se distinguen por gramaje, por ejemplo, cookies de 10g, de 25g, etc.), cuadraditos de limon y de limon con arandanos, diversos budines, magdalenas diversas, trufas, y pedidos por encargo. Tortas no hace, tartas si pero por encargo. Luego tambien hace packs, por ejemplo, una caja de 9 cuadraditos de limon, caja de 9 trufas y asi... La idea es que ella cargue su lista de productos en la planilla de drive, y de alguna forma lo suba al sitio. Estaria bueno que sea tipo automatico, pero entiendo que puede ser costoso, asi que con que lo pueda subir con un boton desde un panel administrativo esta bien."
- **L3** Decision: automatic publish on every edit is free but would publish half-edited data; a sheet menu button is safer and needs no login/panel.
- **L4** Decision: build fails (instead of using sample CSV) when `SHEET_URL` is set but unreachable or empty, so the host keeps the previous deploy.
- **L5** Decision: "Publish to web" CSV is cached by Google for minutes, so a rebuild right after editing could read stale data; the Apps Script `doGet` web app serves fresh CSV instead.
- **L6** Bug found in browser check: `[data-price]` matched the radios (which carry `data-price`), so the visible price did not update; renamed display hooks to `data-price-display` / `data-badge-display`. Screenshots unavailable (Chrome renderer timeout); verified via DOM.
- **L7** Next: T5 needs the real WhatsApp number, hosting choice, the sheet setup and real prices/photos.
- **L8** (2026-10-19) "genial, ahi voy a probar de levantar la app y ver como funciona y te comento. Anda commiteando y pusheando. Lo vamos a subir a netlify, asi que prepara eso tambien" → added `netlify.toml` (build, `dist`, Node 22) and Netlify steps in README; pushed `feat/catalog`.
- **L9** (2026-10-19) Sheet, Apps Script web app, Netlify site, `SHEET_URL` and build hook (`DEPLOY_HOOK_URL`) set up by the user; "funciono todo punta a punta" (sheet edit → Publicar cambios → Netlify deploy).
- **L10** (2026-10-19) Follow-ups after launch, each verified on https://dulcemood.netlify.app/: PR #2 Cloudinary photo optimization (`f_auto,q_auto,w_800,c_limit`, 60-86 KB per photo); PR #3 real WhatsApp number (`+5493816292088`); PR #4 square product images (vertical phone photos cropped to ~1/4); PR #5 swipeable category row and 40px variant buttons on mobile (first product 570px → 498px at 390px wide).
- **L11** (2026-10-19) "dale commitea el env example y el odd en un PR chiquito" → `.env.example` tracked (`!.env.example` in `.gitignore`); T5 closed. Feature complete.
