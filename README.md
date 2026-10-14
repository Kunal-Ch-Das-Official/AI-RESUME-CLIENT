
## Routes

- `/` — landing page
- `/resume-templates` — template gallery
- `/resume-builder` — interactive resume builder
- `/about` — about page
- `/contact` — contact page

## Design source

The downloaded `AIResume.Download*` HTML/CSS exports were treated as the visual source of truth. The shared compiled stylesheet and local font assets were retained; the downloaded JavaScript bundles were not copied into the application.

## Reused application logic

Only essential pieces from the old Next.js project were carried over:

- resume data model and demo data
- template registry/definitions
- the 10 resume template components
- resume rendering/preview helpers
- the builder's local draft, editing, template switching, sample/reset, print, zoom, and mobile preview behaviors

## Templates

1. Clean ATS Optimizer
2. Executive Minimalist
3. Tech Modernist
4. Academic Researcher
5. Creative Professional
6. Two Column Split
7. Startup Innovator
8. Consultant Strategist
9. Entry Level Graduate
10. International Europass

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Verification performed in the sandbox

- All JavaScript/JSX source files were parsed/transpiled with the installed TypeScript compiler without syntax diagnostics.
- Route/component import paths were checked against the generated project tree.
- The 10-template registry was checked against all 10 template component files.
- Downloaded local font assets were retained and referenced by the stylesheet.

The sandbox could not complete `npm install`/`npm run build` because external npm registry DNS access was unavailable (`EAI_AGAIN registry.npmjs.org`). The source package is therefore delivered with its dependency manifest and PostCSS configuration ready for a normal networked install.
