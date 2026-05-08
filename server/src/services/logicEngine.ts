// server/src/services/logicEngine.ts
import { GitHubRawData } from './githubExtractor';

// ─────────────────────────────────────────────
// Language category maps
// ─────────────────────────────────────────────
const BACKEND_LANGS  = new Set(['Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby']);
const FRONTEND_LANGS = new Set(['JavaScript', 'TypeScript', 'CSS', 'HTML']);
const SYSTEMS_LANGS  = new Set(['C', 'C++', 'Rust', 'Assembly']);

// Repo name keywords that imply backend API work
const BACKEND_KEYWORDS = ['api', 'backend', 'server', 'service'];

// ─────────────────────────────────────────────
// Output types
// ─────────────────────────────────────────────
export interface EngineResult {
  backendScore:      number;
  frontendScore:     number;
  systemsScore:      number;
  consistencyScore:  number;
  overallScore:      number;
  level:             'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  missingSkills:     string[];
  strongSkills:      string[];
  topLanguages:      string[];
  hasDocker:         boolean;
  hasAPI:            boolean;
  hasMicroservices:  boolean;
  activeRepoCount:   number;
  totalStars:        number;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const cap = (n: number, max = 100): number => Math.min(Math.round(n), max);

function isActiveInLast90Days(pushedAt: string): boolean {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  return new Date(pushedAt) >= cutoff;
}

// ─────────────────────────────────────────────
// Main Engine
// ─────────────────────────────────────────────
export function runLogicEngine(raw: GitHubRawData): EngineResult {
  const repos = raw.user.repositories.nodes.filter(r => !r.isFork);
  const commits = raw.user.contributionsCollection.totalCommitContributions;

  // ── Tech detection ──
  const hasDocker = repos.some(r =>
    r.name.toLowerCase().includes('docker') ||
    r.name.toLowerCase().includes('compose')
  );

  const hasAPI = repos.some(r =>
    BACKEND_KEYWORDS.some(kw => r.name.toLowerCase().includes(kw))
  );

  const hasMicroservices = repos.some(r =>
    r.name.toLowerCase().includes('microservice') ||
    r.name.toLowerCase().includes('micro-service')
  );

  // ── Language breakdown ──
  const langCount: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.primaryLanguage) {
      langCount[repo.primaryLanguage.name] = (langCount[repo.primaryLanguage.name] ?? 0) + 1;
    }
  }

  const topLanguages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang);

  const backendRepoCount  = repos.filter(r => r.primaryLanguage && BACKEND_LANGS.has(r.primaryLanguage.name)).length;
  const frontendRepoCount = repos.filter(r => r.primaryLanguage && FRONTEND_LANGS.has(r.primaryLanguage.name)).length;
  const systemsRepoCount  = repos.filter(r => r.primaryLanguage && SYSTEMS_LANGS.has(r.primaryLanguage.name)).length;

  const totalStars     = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
  const activeRepoCount = repos.filter(r => isActiveInLast90Days(r.pushedAt)).length;

  // ── Score calculations (per plan) ──
  const backendScore    = cap(backendRepoCount * 15 + (hasDocker ? 20 : 0) + (hasAPI ? 15 : 0));
  const frontendScore   = cap(frontendRepoCount * 15 + (langCount['TypeScript'] ?? 0 > 0 ? 20 : 0) + totalStars * 0.5);
  const systemsScore    = cap((hasDocker ? 30 : 0) + (hasMicroservices ? 40 : 0) + systemsRepoCount * 10);
  const consistencyScore = cap((commits / 90) * 100);

  const overallScore = Math.round(
    (backendScore + frontendScore + systemsScore + consistencyScore) / 4
  );

  // ── Level classification ──
  let level: EngineResult['level'];
  if      (overallScore < 30) level = 'Beginner';
  else if (overallScore < 60) level = 'Intermediate';
  else if (overallScore < 80) level = 'Advanced';
  else                         level = 'Elite';

  // ── Skill gap analysis ──
  const missingSkills: string[] = [];
  const strongSkills:  string[] = [];

  if (backendScore  < 40)  missingSkills.push('Backend APIs');
  else                     strongSkills.push('Backend Development');

  if (!hasDocker)           missingSkills.push('Docker / Containerization');
  else                     strongSkills.push('Docker');

  if (frontendScore < 40)  missingSkills.push('Frontend Development');
  else                     strongSkills.push('Frontend Development');

  if (systemsScore  < 30)  missingSkills.push('System Design / DevOps');
  else                     strongSkills.push('Systems & DevOps');

  if (!hasMicroservices)    missingSkills.push('Microservices Architecture');

  if (consistencyScore < 40) missingSkills.push('Consistent Coding Habit');
  else                       strongSkills.push('Coding Consistency');

  return {
    backendScore,
    frontendScore,
    systemsScore,
    consistencyScore,
    overallScore,
    level,
    missingSkills,
    strongSkills,
    topLanguages,
    hasDocker,
    hasAPI,
    hasMicroservices,
    activeRepoCount,
    totalStars,
  };
}
