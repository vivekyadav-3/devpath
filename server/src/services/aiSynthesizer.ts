// server/src/services/aiSynthesizer.ts
import { EngineResult } from './logicEngine';

// ─────────────────────────────────────────────
// Output types (strict contract)
// ─────────────────────────────────────────────
export interface ProjectRecommendation {
  name:        string;
  why:         string;
  difficulty:  'Beginner' | 'Intermediate' | 'Advanced';
  time_weeks:  number;
}

export interface RoadmapStep {
  step:   number;
  action: string;
  time:   string;
}

export interface AIRoadmap {
  skill_gap_summary:        string;
  projects_to_build:        ProjectRecommendation[];
  roadmap_steps:            RoadmapStep[];
  estimated_ready_in:       string;
  hiring_probability_boost: string;
}

const FALLBACK_ROADMAP: AIRoadmap = {
  skill_gap_summary:
    'Unable to generate AI roadmap at this time. Please review your missing skills and build projects targeting those gaps.',
  projects_to_build: [
    { name: 'REST API with Auth', why: 'Demonstrates backend fundamentals', difficulty: 'Beginner',     time_weeks: 2 },
    { name: 'Dockerized App',     why: 'Shows DevOps awareness',            difficulty: 'Intermediate', time_weeks: 4 },
    { name: 'Microservice System', why: 'Proves system design skills',      difficulty: 'Advanced',     time_weeks: 6 },
  ],
  roadmap_steps: [
    { step: 1, action: 'Build a REST API project with authentication', time: '2 weeks' },
    { step: 2, action: 'Learn Docker and containerize your projects',  time: '1 month' },
    { step: 3, action: 'Design a microservices-based system',          time: '6 weeks' },
  ],
  estimated_ready_in:       '3-4 months',
  hiring_probability_boost: '40%',
};

function isValidRoadmap(obj: unknown): obj is AIRoadmap {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  return (
    typeof r['skill_gap_summary']        === 'string'  &&
    Array.isArray(r['projects_to_build'])               &&
    Array.isArray(r['roadmap_steps'])                   &&
    typeof r['estimated_ready_in']       === 'string'  &&
    typeof r['hiring_probability_boost'] === 'string'
  );
}

function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) return fenceMatch[1].trim();
  const braceStart = text.indexOf('{');
  const braceEnd   = text.lastIndexOf('}');
  if (braceStart !== -1 && braceEnd !== -1) {
    return text.slice(braceStart, braceEnd + 1);
  }
  return text.trim();
}

// ─────────────────────────────────────────────
// Main AI Synthesizer
// Exclusively uses NVIDIA NIM (Llama 3.1)
// ─────────────────────────────────────────────
export async function generateAIRoadmap(
  engine: EngineResult,
  targetCompany: string,
  nvidiaApiKey: string
): Promise<AIRoadmap> {
  const weakAreas   = engine.missingSkills.join(', ') || 'None identified';
  const strongAreas = engine.strongSkills.join(', ')  || 'None identified';

  const prompt = `You are a senior engineering mentor at a top tech company.
A developer wants to get hired at ${targetCompany}.

Here is their CURRENT profile analysis:
- Level: ${engine.level}
- Overall Score: ${engine.overallScore}/100
- Backend Score: ${engine.backendScore}/100
- Frontend Score: ${engine.frontendScore}/100
- Systems Score: ${engine.systemsScore}/100
- Consistency Score: ${engine.consistencyScore}/100
- Missing Skills: ${weakAreas}
- Weak areas: ${weakAreas}
- Strong areas: ${strongAreas}
- Top Languages: ${engine.topLanguages.join(', ')}

Return ONLY a valid JSON object with this EXACT structure. Do NOT copy the examples, you MUST generate personalized content based on the user's specific missing skills. No markdown. No extra text. No explanation.

{
  "skill_gap_summary": "[Write a sharp, brutal 2-sentence summary of why they would be rejected today, and exactly what they must fix.]",
  "projects_to_build": [
    { "name": "[Generate a specific, complex project name]", "why": "[Explain how it proves their skills to recruiters]", "difficulty": "Intermediate", "time_weeks": 2 }
  ],
  "roadmap_steps": [
    { "step": 1, "action": "[Generate a highly specific technical milestone tailored to their missing skills]", "time": "2 weeks" },
    { "step": 2, "action": "[Generate a second specific technical goal building on step 1]", "time": "1 month" },
    { "step": 3, "action": "[Generate a final complex architectural milestone]", "time": "6 weeks" }
  ],
  "estimated_ready_in": "X months",
  "hiring_probability_boost": "X%"
}`;

  try {
    console.log(`[AI] Consulting NVIDIA NIM for ${targetCompany} roadmap...`);
    
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nvidiaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json() as any;
    const rawText = data.choices[0].message.content;

    const jsonStr = extractJSON(rawText);
    const parsed  = JSON.parse(jsonStr) as unknown;

    if (isValidRoadmap(parsed)) {
      return parsed;
    }

    console.warn('[AI] Invalid response structure — using fallback');
    return FALLBACK_ROADMAP;

  } catch (err) {
    console.error('[AI] Error:', err);
    return FALLBACK_ROADMAP;
  }
}
