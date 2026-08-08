# OR Frontend

Frontend project built with React, JavaScript, Tailwind CSS, and Vite.

UI implementation based on the OR SMART SSI workflow. The application uses a
shared hospital layout, reusable table/form components, route-based pages, and a
mock API boundary that can later be replaced with the real backend.

## Getting started

```bash
npm install
npm run dev
```

## Commands

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run lint` checks the source code
- `npm run preview` previews the production build locally

## Architecture

- `src/components/layout` shared sidebar, header, and application shell
- `src/components/ui` reusable cards, filters, badges, and tables
- `src/pages` route-level screens
- `src/data` mock datasets
- `src/services/api.js` API boundary; replace mock methods with backend calls

## Images

Place image assets in `public/assets/images` and reference them from React with:

```jsx
<img src="/assets/images/example.png" alt="" />
```
