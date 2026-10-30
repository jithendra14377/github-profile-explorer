# GitHub Profile Explorer

A responsive React + Vite application for exploring public GitHub profiles, repositories, and recent developer activity.

## Features

- Search public GitHub users with autocomplete suggestions
- Shareable profile URLs using `?user=username`
- Profile overview with avatar, bio, social links, followers, following, and join date
- Repository totals for stars, forks, watchers, and open issues
- Repository keyword search, language filtering, and sorting by stars, update date, or name
- Repository detail dialog with rendered README content
- Recent public GitHub event feed, including push, issue, pull request, fork, star, and release events when returned by the API
- Language distribution chart and a 14-day recent public-event activity chart
- Top repositories, suggested profiles, and locally saved recent searches
- Responsive layout, dark/light theme, loading states, and API error handling
- Optional personal access token setting for users who need a higher API rate limit

## Run locally

Install [Node.js](https://nodejs.org/) (LTS recommended), then run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

To create and preview a production build:

```bash
npm run build
npm run preview
```

## GitHub API and token privacy

The app calls GitHub's public REST API directly from the browser. Anonymous requests have a limited hourly quota. An optional GitHub personal access token can be entered in Explorer Settings to increase the quota. The token is kept in the current browser tab's `sessionStorage`, is not committed to this repository, and is sent only to GitHub API requests. Never paste your token into an issue or share it with anyone.

## Data limitations

The activity chart is an estimate based on recent public events returned by GitHub's Events API. It is **not** GitHub's official contribution graph and cannot show private contributions. GitHub limits the number and age of public events available through this endpoint, so older activity may not appear. Repository watcher counts use GitHub's subscriber count, and open issue totals can include pull requests as reported by GitHub.

## Technology

- React
- Vite
- GitHub REST API
- Recharts
- Lucide React
- React Markdown
