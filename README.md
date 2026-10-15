# my-react-app

React app built with Vite, TypeScript, and Tailwind CSS. ESLint and Prettier keep the code consistent, and Lefthook runs format, lint, and typecheck before each commit.

## Scripts

- `pnpm dev` — start the development server
- `pnpm build` — typecheck and create a production build
- `pnpm preview` — preview the production build
- `pnpm lint` — run ESLint
- `pnpm format` — format the project with Prettier
- `pnpm typecheck` — run the TypeScript project build check

## Layout

```
src/
  assets/      static files imported by components
  components/  reusable UI
  hooks/       shared hooks
  layouts/     page shells
  pages/       route-level screens
  services/    API and data access
  types/       shared TypeScript types
  utils/       pure helpers
```
