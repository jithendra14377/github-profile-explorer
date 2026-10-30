const API = "https://api.github.com";

export function makeHeaders(token) {
  return token ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } : { Accept: "application/vnd.github+json" };
}

async function request(path, token) {
  const response = await fetch(`${API}${path}`, { headers: makeHeaders(token) });
  if (!response.ok) {
    if (response.status === 403 || response.status === 429) throw new Error("GitHub API rate limit reached. Add a personal access token in Settings, or try again later.");
    if (response.status === 404) throw new Error("GitHub user or resource was not found. Check the username and try again.");
    if (response.status === 401) throw new Error("The GitHub token is invalid or expired. Remove it or enter a valid token.");
    throw new Error(`GitHub API error (${response.status}). Please try again.`);
  }
  return response.json();
}

export async function getProfile(username, token) {
  const [profile, repos, events] = await Promise.all([
    request(`/users/${encodeURIComponent(username)}`, token),
    request(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, token),
    request(`/users/${encodeURIComponent(username)}/events/public?per_page=100`, token)
  ]);
  return { profile, repos, events };
}

export async function getReadme(owner, repo, token) {
  const response = await fetch(`${API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`, {
    headers: { ...makeHeaders(token), Accept: "application/vnd.github.raw+json" }
  });
  if (!response.ok) throw new Error(response.status === 404 ? "This repository does not have a README." : "Could not load the README.");
  return response.text();
}

export async function searchUsers(query, token) {
  const data = await request(`/search/users?q=${encodeURIComponent(query)}&per_page=6`, token);
  return data.items || [];
}
