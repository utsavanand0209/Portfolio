# Dynamic Portfolio

Static, data-driven portfolio website for Utsav Anand.

## Live URLs

- Primary (GitHub Pages): `https://utsavanand0209.github.io/Portfolio/`
- Backup (Netlify): `https://utsav-anand-portfolio.netlify.app`

## Local Preview

```bash
cd /Users/utsavanand/personal-portfolio
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Content Source

Update all profile/project content in:

- `data/portfolio.json`

## Deploy In One Step

### GitHub Pages

This repo is pre-configured with `.github/workflows/deploy-pages.yml`.

1. Push to your default branch (`main` or `master`):

```bash
git add .
git commit -m "Deploy portfolio"
git push origin <your-default-branch>
```

After push, GitHub Actions deploys automatically to Pages.

### Netlify

This repo is pre-configured with `netlify.toml` and a Netlify-compatible contact form.

1. CLI one-step deploy:

```bash
netlify deploy --prod --dir .
```

Or connect the repo in Netlify and it deploys without extra build settings.

## Notes

- Resume download and profile photo are served from `assets/`.
- On Netlify, the contact form submits to Netlify Forms.
- On GitHub Pages, the contact form gracefully falls back to opening a mail draft.
