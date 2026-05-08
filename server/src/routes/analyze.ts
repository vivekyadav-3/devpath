// server/src/routes/analyze.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { extractGitHubMetrics } from '../services/githubExtractor';
import { runLogicEngine } from '../services/logicEngine';
import { generateAIRoadmap } from '../services/aiSynthesizer';

import { PrismaLibSql } from '@prisma/adapter-libsql';

const router  = Router();

let _prisma: PrismaClient | null = null;
const getPrisma = () => {
  if (!_prisma) {
    const dbUrl = process.env['DATABASE_URL'] || 'file:./dev.db';
    const adapter = new PrismaLibSql({ url: dbUrl });
    _prisma = new PrismaClient({ adapter });
  }
  return _prisma;
};

// ─────────────────────────────────────────────
// POST /api/analyze
// Full pipeline: GitHub → Logic → DB → NVIDIA AI → DB → Return
// ─────────────────────────────────────────────
router.post('/analyze', async (req: Request, res: Response) => {
  const { username, targetCompany } = req.body as {
    username?: string;
    targetCompany?: string;
  };

  if (!username || !targetCompany) {
    res.status(400).json({ error: 'username and targetCompany are required' });
    return;
  }

  const githubToken = process.env['GITHUB_TOKEN'];
  const nvidiaKey   = process.env['NVIDIA_API_KEY'];

  if (!githubToken || !nvidiaKey) {
    res.status(500).json({ error: 'Server misconfiguration: missing GITHUB_TOKEN or NVIDIA_API_KEY' });
    return;
  }

  try {
    // ── Step 1: Extract raw GitHub data ──
    console.log(`[analyze] Extracting GitHub data for: ${username}`);
    const rawData = await extractGitHubMetrics(username, githubToken);

    // ── Step 2: Run scoring logic engine ──
    console.log('[analyze] Running Logic Engine...');
    const engineResult = runLogicEngine(rawData);

    // ── Step 3: Upsert user in DB ──
    const user = await getPrisma().user.upsert({
      where:  { username },
      update: { updatedAt: new Date() },
      create: {
        githubId:  rawData.user.login,
        username,
        name:      rawData.user.login,
        avatarUrl: `https://avatars.githubusercontent.com/${username}`,
      },
    });

    // ── Step 4: Save profile snapshot for progress tracking ──
    const snapshot = await getPrisma().profileSnapshot.create({
      data: {
        userId:           user.id,
        totalRepos:       rawData.user.repositories.totalCount,
        activeRepoCount:  engineResult.activeRepoCount,
        totalStars:       engineResult.totalStars,
        commitsLast90Days: rawData.user.contributionsCollection.totalCommitContributions,
        backendScore:     engineResult.backendScore,
        frontendScore:    engineResult.frontendScore,
        systemsScore:     engineResult.systemsScore,
        consistencyScore: engineResult.consistencyScore,
        calculatedLevel:  engineResult.level,
      },
    });

    // ── Step 5: Generate AI roadmap (Exclusively via NVIDIA NIM) ──
    const roadmap = await generateAIRoadmap(engineResult, targetCompany, nvidiaKey);

    // ── Step 6: Save roadmap ──
    await getPrisma().roadmap.create({
      data: {
        userId:        user.id,
        targetCompany,
        missingSkills: engineResult.missingSkills.join(','),
        geminiPayload: JSON.stringify(roadmap), // Kept name for schema compatibility or rename it in schema later
      },
    });

    // ── Step 7: Return full analysis ──
    res.json({
      username,
      targetCompany,
      snapshotId: snapshot.id,
      scores: {
        backend:     engineResult.backendScore,
        frontend:    engineResult.frontendScore,
        systems:     engineResult.systemsScore,
        consistency: engineResult.consistencyScore,
        overall:     engineResult.overallScore,
      },
      level:         engineResult.level,
      missingSkills: engineResult.missingSkills,
      strongSkills:  engineResult.strongSkills,
      topLanguages:  engineResult.topLanguages,
      roadmap,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[analyze] Pipeline failed:', message);
    res.status(500).json({ error: message });
  }
});

// ─────────────────────────────────────────────
// GET /api/history/:username
// Returns all past snapshots for progress tracking
// ─────────────────────────────────────────────
router.get('/history/:username', async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const user = await getPrisma().user.findUnique({
      where:   { username },
      include: {
        snapshots: { orderBy: { createdAt: 'asc' } },
        roadmaps:  { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!user) {
      res.status(404).json({ error: `No data found for user: ${username}` });
      return;
    }

    res.json({
      username:  user.username,
      snapshots: user.snapshots,
      roadmaps:  user.roadmaps.map(r => ({
        ...r,
        missingSkills: r.missingSkills.split(','),
        geminiPayload: JSON.parse(r.geminiPayload)
      })),
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

// ─────────────────────────────────────────────
// GET /api/leaderboard
// Top 20 users by overall score (latest snapshot)
// ─────────────────────────────────────────────
router.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const snapshots = await getPrisma().profileSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, avatarUrl: true } } },
      take: 100,
    });

    const seen = new Set<string>();
    const unique = snapshots
      .filter(s => {
        if (seen.has(s.userId)) return false;
        seen.add(s.userId);
        return true;
      })
      .map(s => ({
        rank:             0,
        username:         s.user.username,
        avatarUrl:        s.user.avatarUrl,
        backendScore:     s.backendScore,
        frontendScore:    s.frontendScore,
        systemsScore:     s.systemsScore,
        consistencyScore: s.consistencyScore,
        overallScore:     Math.round((s.backendScore + s.frontendScore + s.systemsScore + s.consistencyScore) / 4),
        level:            s.calculatedLevel,
        analyzedAt:       s.createdAt,
      }))
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 20)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    res.json({ leaderboard: unique });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
