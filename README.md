# Rajesh Panwar — Portfolio

A dark-mode, fully responsive portfolio built with React, Vite, Tailwind CSS, and lucide-react icons.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

This creates a `dist/` folder with the final site.

## Deploy it live (free options)

**Vercel**
1. Push this folder to a GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Framework preset: Vite. Click Deploy.

**Netlify**
1. Push this folder to a GitHub repo (or drag-and-drop the `dist/` folder after `npm run build` at app.netlify.com/drop).
2. Build command: `npm run build`, publish directory: `dist`.

## Editing your info

- Text/content: `src/components/Hero.jsx`, `About.jsx`, `Skills.jsx`, `Projects.jsx`, `Contact.jsx`
- Colors/fonts: `tailwind.config.js`
- Email/social links: `src/components/Hero.jsx` and `src/components/Contact.jsx`

Dark mode is on by default and toggles from the sun/moon icon in the navbar; it's fully responsive from mobile to desktop.
