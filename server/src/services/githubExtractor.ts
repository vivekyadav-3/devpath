// server/src/services/githubExtractor.ts
import axios from 'axios';

export interface GitHubRawData {
  user: {
    login: string;
    repositories: {
      totalCount: number;
      nodes: Array<{
        name: string;
        isFork: boolean;
        stargazerCount: number;
        pushedAt: string;
        primaryLanguage: {
          name: string;
        } | null;
      }>;
    };
    contributionsCollection: {
      totalCommitContributions: number;
    };
  };
}

export async function extractGitHubMetrics(username: string, token: string): Promise<GitHubRawData> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        login
        repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false) {
          totalCount
          nodes {
            name
            isFork
            stargazerCount
            pushedAt
            primaryLanguage {
              name
            }
          }
        }
        contributionsCollection {
          totalCommitContributions
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query,
        variables: { login: username },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.errors) {
      const msg = response.data.errors[0]?.message || 'GitHub API error';
      throw new Error(msg);
    }

    if (!response.data.data.user) {
      throw new Error(`GitHub user "${username}" not found.`);
    }

    return response.data.data as GitHubRawData;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch GitHub data';
    throw new Error(message);
  }
}
