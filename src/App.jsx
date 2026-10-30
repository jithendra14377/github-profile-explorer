import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, BookOpen, CalendarDays, Code2, ExternalLink, GitFork, Heart, MapPin, Moon, Search, Settings2, Star, Sun, Users, Eye, X, AlertCircle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import ReactMarkdown from "react-markdown";
import { getProfile, getReadme, searchUsers } from "./services/githubApi";

const number = (n) => new Intl.NumberFormat("en", { notation: n > 9999 ? "compact" : "standard" }).format(n || 0);
const ago = (value) => { const n = Math.max(0, (Date.now() - new Date(value)) / 1000); return n < 3600 ? Math.max(1, Math.floor(n / 60)) + "m ago" : n < 86400 ? Math.floor(n / 3600) + "h ago" : Math.floor(n / 86400) + "d ago"; };

export default function App() {
  const first = new URLSearchParams(location.search).get("user") || "jithendra14377";
  const [query, setQuery] = useState(first), [profile, setProfile] = useState(null), [repos, setRepos] = useState([]), [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [dark, setDark] = useState(localStorage.getItem("gpe-theme") !== "light");
  const [token, setToken] = useState(sessionStorage.getItem("gpe-token") || ""), [settings, setSettings] = useState(false);
  const [filter, setFilter] = useState(""), [language, setLanguage] = useState("All languages"), [sort, setSort] = useState("stars");
  const [tab, setTab] = useState("repos"), [suggestions, setSuggestions] = useState([]), [history, setHistory] = useState(JSON.parse(localStorage.getItem("gpe-history") || "[]"));
  const [chosen, setChosen] = useState(null), [readme, setReadme] = useState(""), [readmeBusy, setReadmeBusy] = useState(false);

  async function load(name = query) {
    const clean = name.trim().replace(/^@/, "");
    if (!clean) return;
    setBusy(true); setError(""); setChosen(null);
    try {
      const result = await getProfile(clean, token);
      setProfile(result.profile); setRepos(result.repos); setEvents(result.events); setQuery(clean);
      const recent = [clean, ...history.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      setHistory(recent); localStorage.setItem("gpe-history", JSON.stringify(recent));
      const url = new URL(location.href); url.searchParams.set("user", clean); historyReplace(url);
    } catch (e) { setError(e.message); setProfile(null); }
    finally { setBusy(false); }
  }
  function historyReplace(url) { window.history.replaceState({}, "", url); }
  useEffect(() => { load(first); }, []);
  useEffect(() => { localStorage.setItem("gpe-theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(() => searchUsers(query, token).then(setSuggestions).catch(() => setSuggestions([])), 500);
    return () => clearTimeout(timer);
  }, [query, token]);

  const totalStars = repos.reduce((n, r) => n + r.stargazers_count, 0);
  const totalForks = repos.reduce((n, r) => n + r.forks_count, 0);
  const totalWatchers = repos.reduce((n, r) => n + r.subscribers_count, 0);
  const totalIssues = repos.reduce((n, r) => n + r.open_issues_count, 0);
  const langs = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
  const langData = useMemo(() => { const counts = {}; repos.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; }); return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,7).map(([name,value]) => ({name,value})); }, [repos]);
  const chartData = useMemo(() => Array.from({length:14}, (_,i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); const key = d.toISOString().slice(0,10); return {day:d.toLocaleDateString("en",{weekday:"short"}), count:events.filter((e) => e.created_at.slice(0,10) === key).length}; }), [events]);
  const shown = repos.filter((r) => (language === "All languages" || r.language === language) && (r.name + " " + (r.description || "") + " " + (r.topics || []).join(" ")).toLowerCase().includes(filter.toLowerCase())).sort((a,b) => sort === "stars" ? b.stargazers_count-a.stargazers_count : sort === "updated" ? new Date(b.updated_at)-new Date(a.updated_at) : a.name.localeCompare(b.name));
  const top = [...repos].sort((a,b) => b.stargazers_count-a.stargazers_count).slice(0,5);

  async function openRepo(repo) {
    setChosen(repo); setReadme(""); setReadmeBusy(true);
    try { setReadme(await getReadme(repo.owner.login, repo.name, token)); } catch (e) { setReadme(e.message); } finally { setReadmeBusy(false); }
  }
  function saveSettings() { if (token.trim()) sessionStorage.setItem("gpe-token", token.trim()); else sessionStorage.removeItem("gpe-token"); setSettings(false); load(); }

  return <div className={dark ? "app dark" : "app light"}>
    <header className="topbar"><a className="brand" href="/"><span className="brand-icon"><Code2/></span>git<span>scope</span><small>PROFILE EXPLORER</small></a><div className="top-actions"><span className="api-live"><i/> GitHub API connected</span><button className="icon-btn" onClick={() => setSettings(true)} title="Settings"><Settings2/></button><button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? <Sun/> : <Moon/>}</button><a className="github-button" href="https://github.com" target="_blank" rel="noreferrer">GitHub <ExternalLink size={14}/></a></div></header>
    <main className="shell">
      <section className="hero"><div className="eyebrow">— THE OPEN SOURCE RADAR</div><h1>Explore the people<br/>behind the <em>code.</em></h1><p>A deeper look into GitHub profiles, projects, and developer activity. All in one beautifully simple space.</p>
        <form className="search-box" onSubmit={(e) => {e.preventDefault(); setSuggestions([]); load();}}><Search/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a GitHub username..." aria-label="GitHub username"/><kbd>↵</kbd><button disabled={busy}>{busy ? "Searching…" : "Explore profile"} <ArrowUpRight size={16}/></button>
          {suggestions.length > 0 && <div className="suggestions">{suggestions.slice(0,6).map((s) => <button type="button" key={s.id} onClick={() => {setQuery(s.login);setSuggestions([]);load(s.login);}}><img src={s.avatar_url}/><b>{s.login}</b><small>{s.type}</small></button>)}</div>}
        </form><div className="hero-tags"><span>✓ Public GitHub data</span><span>✦ Live API results</span><span>◎ No account required</span></div>
      </section>
      {error && <div className="error"><AlertCircle/><div><b>Couldn't load this profile</b><p>{error}</p></div><button onClick={() => load()}>Retry</button></div>}
      {busy && <div className="skeleton-grid"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div>}
      {!busy && profile && <>
        <section className="profile-card"><div className="profile-main"><img className="avatar" src={profile.avatar_url} alt="Profile avatar"/><div className="profile-copy"><h2>{profile.name || profile.login}</h2><a className="handle" href={profile.html_url} target="_blank" rel="noreferrer">@{profile.login} <ExternalLink size={13}/></a>{profile.bio && <p>{profile.bio}</p>}<div className="profile-meta">{profile.company && <span>{profile.company}</span>}{profile.location && <span><MapPin/>{profile.location}</span>}{profile.blog && <a href={profile.blog.startsWith("http") ? profile.blog : "https://" + profile.blog} target="_blank" rel="noreferrer">{profile.blog}</a>}<span><CalendarDays/> Joined {new Date(profile.created_at).toLocaleDateString("en",{month:"short",year:"numeric"})}</span></div></div></div><div className="social-stats"><div><b>{number(profile.followers)}</b><small>Followers</small></div><div><b>{number(profile.following)}</b><small>Following</small></div><div><b>{number(profile.public_repos)}</b><small>Repositories</small></div><a href={profile.html_url} target="_blank" rel="noreferrer">View profile ↗</a></div></section>
        <section className="stats-grid">{[{label:"Total stars",value:totalStars,icon:<Star/>},{label:"Total forks",value:totalForks,icon:<GitFork/>},{label:"Watchers",value:totalWatchers,icon:<Eye/>},{label:"Open issues",value:totalIssues,icon:<Activity/>}].map((s) => <article className="stat-card" key={s.label}><div>{s.label}<span>{s.icon}</span></div><strong>{number(s.value)}</strong><small>Across public repositories</small></article>)}</section>
        <section className="insights"><article className="panel"><div className="panel-head"><div><small>LANGUAGE BREAKDOWN</small><h3>What they build with</h3></div><Code2/></div>{langData.length ? <div className="language-wrap"><div className="donut"><ResponsiveContainer><PieChart><Pie data={langData} dataKey="value" innerRadius="66%" outerRadius="94%" paddingAngle={3}>{langData.map((x,i)=><Cell key={x.name} fill={["#8978f7","#45c7a4","#e7a75a","#df769d","#61a8e7","#aa9bed","#8b9bad"][i%7]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div><div className="legend">{langData.map((x,i)=><div key={x.name}><span><i style={{background:["#8978f7","#45c7a4","#e7a75a","#df769d","#61a8e7","#aa9bed","#8b9bad"][i%7]}}/>{x.name}</span><b>{x.value}</b></div>)}</div></div> : <p className="muted">No language data available.</p>}</article>
          <article className="panel"><div className="panel-head"><div><small>PUBLIC EVENT ACTIVITY</small><h3>Recent activity rhythm</h3></div><span className="period">14 DAYS</span></div><div className="area-chart"><ResponsiveContainer><AreaChart data={chartData}><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8978f7" stopOpacity=".4"/><stop offset="100%" stopColor="#8978f7" stopOpacity="0"/></linearGradient></defs><CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="day" tick={{fontSize:11,fill:"var(--muted)"}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)",borderRadius:9}}/><Area dataKey="count" stroke="#8978f7" strokeWidth={2.5} fill="url(#fill)"/></AreaChart></ResponsiveContainer></div><p className="footnote">Event-based estimate from recent public activity, not GitHub's official contribution graph.</p></article></section>
        <section className="workspace"><div className="section-heading"><div><small>DEVELOPER WORKSPACE</small><h2>Explore the work</h2></div><div className="tabs"><button className={tab==="repos"?"selected":""} onClick={()=>setTab("repos")}><BookOpen size={15}/> Repositories <b>{repos.length}</b></button><button className={tab==="activity"?"selected":""} onClick={()=>setTab("activity")}><Activity size={15}/> Activity <b>{events.length}</b></button></div></div>
          {tab==="repos" ? <><div className="filters"><label><Search/><input placeholder="Filter repositories..." value={filter} onChange={(e)=>setFilter(e.target.value)}/></label><select value={language} onChange={(e)=>setLanguage(e.target.value)}><option>All languages</option>{langs.map((l)=><option key={l}>{l}</option>)}</select><select value={sort} onChange={(e)=>setSort(e.target.value)}><option value="stars">Most stars</option><option value="updated">Recently updated</option><option value="name">Name A–Z</option></select></div><div className="repo-columns"><div className="repo-list">{shown.length ? shown.map((r)=><article className="repo-card" key={r.id}><div className="repo-title"><BookOpen/><button onClick={()=>openRepo(r)}>{r.name}</button>{r.fork && <small>FORK</small>}<button className="open-arrow" onClick={()=>openRepo(r)}><ArrowUpRight/></button></div><p>{r.description || "No description provided for this repository."}</p><div className="topics">{(r.topics||[]).slice(0,4).map((t)=><span key={t}>{t}</span>)}</div><div className="repo-meta"><span>{r.language && <i/>}{r.language}</span><span><Star/>{number(r.stargazers_count)}</span><span><GitFork/>{number(r.forks_count)}</span><small>Updated {ago(r.updated_at)}</small></div></article>) : <div className="empty">No repositories match those filters.</div>}</div><aside className="side-panels"><article className="panel"><div className="panel-head"><div><small>COMMUNITY FAVORITES</small><h3>Top repositories</h3></div><Star/></div>{top.map((r,i)=><button className="top-repo" key={r.id} onClick={()=>openRepo(r)}><span>0{i+1}</span><b>{r.name}<small>{r.language || "Other"}</small></b><strong>★ {number(r.stargazers_count)}</strong></button>)}</article><article className="panel snapshot"><small>PROFILE SNAPSHOT</small><h3>Open source footprint</h3><div><span>Public gists</span><b>{number(profile.public_gists)}</b></div><div><span>Public events loaded</span><b>{events.length}</b></div><div><span>Account type</span><b>{profile.type}</b></div></article></aside></div></> :
          <div className="event-list">{events.length ? events.slice(0,35).map((e)=><article className="event" key={e.id}><span><Activity/></span><div><p><b>{profile.login}</b> {({PushEvent:"pushed commits to",WatchEvent:"starred",ForkEvent:"forked",IssuesEvent:"updated an issue in",PullRequestEvent:"updated a pull request in",CreateEvent:"created a branch or tag in",ReleaseEvent:"published a release in"}[e.type]||"was active in")} <a href={"https://github.com/"+e.repo.name} target="_blank" rel="noreferrer">{e.repo.name}</a></p>{e.type==="PushEvent" && e.payload.commits?.slice(0,2).map((c)=><small key={c.sha}>{c.message} · </small>)}</div><time>{ago(e.created_at)}</time></article>) : <div className="empty">No recent public events found.</div>}</div>}
        </section>
        <footer className="profile-footer"><span>Exploring <b>@{profile.login}</b></span><span>Data provided by GitHub REST API</span></footer>
      </>}
      {!busy && !profile && !error && <section className="welcome"><div className="welcome-symbol"><Code2/></div><h2>Ready to explore?</h2><p>Search any public GitHub username to discover their profile, projects, and developer activity.</p><small>TRY A PROFILE</small><div>{["torvalds","vercel","sindresorhus","gaearon"].map((u)=><button key={u} onClick={()=>{setQuery(u);load(u);}}>@{u} ↗</button>)}</div>{history.length>0 && <div className="recent"><small>RECENT SEARCHES</small>{history.map((u)=><button key={u} onClick={()=>load(u)}>{u}</button>)}</div>}</section>}
      <footer className="site-footer"><span>© 2026 GITSCOPE</span><span>Built for the curious minds of open source.</span><a href="https://docs.github.com/en/rest" target="_blank" rel="noreferrer">API documentation ↗</a></footer>
    </main>
    {settings && <div className="overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSettings(false);}}><section className="dialog"><button className="close" onClick={()=>setSettings(false)}><X/></button><small>PREFERENCES</small><h3>Explorer settings</h3><label>GitHub personal access token <em>OPTIONAL</em><input type="password" value={token} onChange={(e)=>setToken(e.target.value)} placeholder="ghp_••••••••••••••••"/></label><p>Optional token for a higher GitHub API rate limit. Stored only in this browser tab's session storage and sent only to GitHub. Never share your token.</p><div className="dialog-actions"><button onClick={()=>{setToken("");sessionStorage.removeItem("gpe-token");}}>Remove token</button><button className="primary" onClick={saveSettings}>Save settings ↗</button></div></section></div>}
    {chosen && <div className="overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget)setChosen(null);}}><section className="dialog readme-dialog"><button className="close" onClick={()=>setChosen(null)}><X/></button><small>REPOSITORY DETAILS</small><h3>{chosen.name}</h3><a href={chosen.html_url} target="_blank" rel="noreferrer">Open on GitHub ↗</a><p>{chosen.description}</p><div className="readme-stats">★ {number(chosen.stargazers_count)} stars　⑂ {number(chosen.forks_count)} forks　◉ {number(chosen.subscribers_count)} watchers</div><hr/><h4><BookOpen/> README</h4><div className="markdown">{readmeBusy ? "Loading README…" : <ReactMarkdown>{readme || "No README content."}</ReactMarkdown>}</div></section></div>}
    </div>;
}
