function extractGitHubRepoInfo(repoUrl: string): { owner: string; repo: string } | null {
  // Example: url:https://github.com/backstage/backstage/tree/master/
  const match = repoUrl.match(/github.com\/(.+?)\/(.+?)(\/|$)/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

export async function checkReadmeInGithub(repoUrl: string, githubToken?: string): Promise<boolean> {
  const repoInfo = extractGitHubRepoInfo(repoUrl);
  if (!repoInfo) return false;
  const { owner, repo } = repoInfo;
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/README.md`;
    const headers: Record<string, string> = {};
    if (githubToken) {
      headers['Authorization'] = `Bearer ${githubToken}`;
    }
    const response = await fetch(apiUrl, { headers });
    if (response.ok) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
} 