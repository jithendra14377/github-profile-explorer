# GitHub Profile Explorer

A responsive React application for exploring public GitHub profiles, repositories, activity, and developer statistics.

## Features

- Search any public GitHub username and share profiles with `?user=username`
- Profile overview with avatar, bio, social links, followers, and join date
- Repository analytics: stars, forks, watchers, and open issues
- Search, sort, and language-filter public repositories
- Repository detail drawer with rendered README
- Recent public activity feed
- Language distribution, repository star charts, and an event-based contribution heatmap
- Suggested profiles and locally saved recent searches
- Responsive dark/light themes, loading states, and API error handling

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## GitHub API and rate limits

The app uses GitHub's public REST API directly from the browser. Anonymous requests have a limited hourly quota. You can optionally enter a GitHub personal access token in the app to increase the quota. The token is stored only in the current browser session and is never committed to this repository.

## Build

```bash
npm run build
npm run preview
```

## Notes

The contribution heatmap is an estimate based on public events returned by GitHub's Events API, not GitHub's private contribution graph. Public events are limited by GitHub's API retention and response limits.