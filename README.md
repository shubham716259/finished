# CookFusion

CookFusion is a React single-page app for discovering recipes and organizing meals. It uses TheMealDB for recipe data and stores favorites, meal plans, shopping-list state, and locally created account data in the browser.

## Features

- Explore recipes by name, main ingredient, cuisine/area, or category. Sort results and choose paged or load-more browsing.
- View recipe details and save or remove recipes from Favorites.
- Plan breakfast, lunch, and dinner across the week. Add recipes from Favorites or search, and auto-plan empty meal slots using available favorites and chicken recipes.
- Build a shopping list from planned recipes, add custom items, categorize ingredients, and check items off.
- Discover a random recipe, optionally filtered by a meal preference.
- Use the sign-up, sign-in, and password-reset flows. Account details are stored locally in the browser; this project does not include a server-side account system.

Recipe search and detail features request data from TheMealDB, so an internet connection is needed for those features. Favorites, planner data, shopping-list state, and locally stored account data use `localStorage` in the current browser.

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0` (the range required by the installed Vite version).
- npm.

## Installation

From the project root, install the locked dependencies:

```sh
npm ci
```

## Environment variables

The only environment variable referenced by the app is:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | No | Read by the Google OAuth provider and sign-in component. `.env.example` contains a placeholder and notes for configuring a Google OAuth client. |

To configure it, create a `.env.local` file in the project root and replace the placeholder value with your Google OAuth client ID. Add the app's origin (for local development, `http://localhost:5173`) to the authorized JavaScript origins in Google Cloud.

The sign-in component includes an in-app account chooser fallback. The current OAuth client-ID detection also treats IDs containing `apps.googleusercontent.com` as unconfigured, so real Google OAuth may fall back to that chooser even when a standard Google client ID is provided.

## Development

Start the Vite development server:

```sh
npm run dev
```

Run ESLint:

```sh
npm run lint
```

## Production build

Create the production bundle in `dist/`:

```sh
npm run build
```

To serve the built bundle locally for preview:

```sh
npm run preview
```
