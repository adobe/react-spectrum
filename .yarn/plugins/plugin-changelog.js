/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

module.exports = {
  name: 'plugin-changelog',
  factory: require => {
    const {BaseCommand} = require('@yarnpkg/cli');
    const {Configuration, Project, structUtils} = require('@yarnpkg/core');
    const OWNER = 'adobe';
    const REPO = 'react-spectrum';
    const API_BASE = 'https://api.github.com';

    const RATE_LIMIT_STATUS = 403;
    const TOO_MANY_REQUESTS = 429;
    const MAX_RETRIES = 5;
    const INITIAL_BACKOFF_MS = 1000;
    const MAX_CONCURRENT_REQUESTS = 10;

    async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function githubFetch(token, path, opts = {}) {
      const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
      const res = await fetch(url, {
        ...opts,
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${token}`,
          ...opts.headers
        }
      });
      if (!res.ok) {
        const e = new Error(`GitHub API ${res.status}: ${res.statusText}`);
        e.status = res.status;
        e.response = res;
        throw e;
      }
      return res.json();
    }

    // Fetch with exponential backoff on rate limit (403/429). Retry-After header is honored when present.
    async function githubFetchWithBackoff(token, path, opts = {}, attempt = 0) {
      try {
        return await githubFetch(token, path, opts);
      } catch (err) {
        const isRateLimit = err.status === RATE_LIMIT_STATUS || err.status === TOO_MANY_REQUESTS;
        if (!isRateLimit || attempt >= MAX_RETRIES) {
          throw err;
        }
        const res = err.response;
        let waitMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        if (res && res.headers) {
          const retryAfter = res.headers.get('Retry-After');
          if (retryAfter) {
            const seconds = parseInt(retryAfter, 10);
            waitMs = Number.isNaN(seconds) ? waitMs : Math.max(waitMs, seconds * 1000);
          }
        }
        await sleep(waitMs);
        return githubFetchWithBackoff(token, path, opts, attempt + 1);
      }
    }

    // Run async tasks with a concurrency limit. Each task is a () => Promise.
    // Workers loop until all tasks are taken: at most `limit` run at once, then the next starts as each finishes.
    async function runWithConcurrency(tasks, limit) {
      const results = [];
      let index = 0;
      async function worker() {
        while (index < tasks.length) {
          const i = index++;
          results[i] = await tasks[i]();
        }
      }
      await Promise.all(Array.from({length: Math.min(limit, tasks.length)}, () => worker()));
      return results;
    }

    class ReleaseNotesCommand extends BaseCommand {
      static paths = [['release-notes']];

      async execute() {
        const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
        const {project} = await Project.find(configuration, this.context.cwd);

        // Only consider workspaces that are published (have name, version, and are not private).
        const publicWorkspaces = project.workspaces.filter(w => {
          if (w.manifest.private) {
            return false;
          }
          if (w.manifest.name === null || w.manifest.version === null) {
            return false;
          }
          return true;
        });

        const packageList = publicWorkspaces.map(w => ({
          name: structUtils.stringifyIdent(w.manifest.name),
          version: w.manifest.version
        }));

        const token = process.env.GITHUB_TOKEN;
        if (!token) {
          this.context.stdout.write('Error: GITHUB_TOKEN environment variable is required.\n');
          return 1;
        }

        // Fetch each package tag's commit in parallel, max 10 concurrent (with backoff on rate limit).
        const tagResults = await runWithConcurrency(
          packageList.map((p) => async () => {
            const tag = `${p.name}@${p.version}`;
            try {
              const data = await githubFetchWithBackoff(
                token,
                `/repos/${OWNER}/${REPO}/commits/${encodeURIComponent(tag)}`
              );
              return {name: p.name, date: data.commit.committer.date, sha: data.sha, tag};
            } catch (err) {
              if (err.status === 404) {
                return null; // Tag doesn't exist (e.g. never published)
              }
              throw err;
            }
          }),
          MAX_CONCURRENT_REQUESTS
        );

        let lastPublishDateByPackage = {};
        let latestTag = null;
        let latestTagCommitSha = null;
        let latestDate = null;

        for (const result of tagResults) {
          if (!result) {
            continue;
          }
          lastPublishDateByPackage[result.name] = result.date;
          if (!latestDate || result.date > latestDate) {
            latestDate = result.date;
            latestTag = result.tag;
            latestTagCommitSha = result.sha;
          }
        }

        if (!latestTag) {
          this.context.stdout.write('No published package tags found. Ensure at least one package has been released and tagged.\n');
          return 1;
        }

        // Collect commits since the latest published tag (paginate until we hit the cutoff commit).
        const commits = new Map();
        let page = 1;
        const perPage = 100;

        while (true) {
          const pageCommits = await githubFetchWithBackoff(
            token,
            `/repos/${OWNER}/${REPO}/commits?sha=HEAD&per_page=${perPage}&page=${page}`
          );
          if (pageCommits.length === 0) {
            break;
          }
          for (const c of pageCommits) {
            if (c.sha === latestTagCommitSha) {
              page = -1;
              break;
            }
            const date = c.commit.committer.date;
            const author = (c.commit.author && c.commit.author.name) || (c.author && c.author.login) || '';
            const subject = c.commit.message ? c.commit.message.split('\n')[0] : '';
            commits.set(c.sha, [c.sha, date, author, subject]);
          }
          if (page === -1) {
            break;
          }
          if (pageCommits.length < perPage) {
            break;
          }
          page++;
        }

        // Sort by committer date ascending (oldest first) so release notes read chronologically.
        // Commit tuple: [sha, date, author, subject]; index 1 is ISO date string.
        const sortedCommits = [...commits.values()].sort((a, b) => a[1] < b[1] ? -1 : 1);

        // Collect unique PR IDs from commits that reference a PR (e.g. "fix: something (#123)").
        const prIdSet = new Set();
        for (const commit of sortedCommits) {
          const m = commit[3].match(/(.*?) \(#(\d+)\)$/);
          if (m) {
            prIdSet.add(m[2]);
          }
        }

        // Fetch all PRs in parallel with same concurrency limit and backoff.
        const prDataByPrId = new Map();
        const prIds = [...prIdSet];
        const prResults = await runWithConcurrency(
          prIds.map((prId) => async () => {
            const prData = await githubFetchWithBackoff(
              token,
              `/repos/${OWNER}/${REPO}/pulls/${prId}`
            );
            return {prId, prData};
          }),
          MAX_CONCURRENT_REQUESTS
        );
        for (const {prId, prData} of prResults) {
          prDataByPrId.set(prId, prData);
        }

        for (const commit of sortedCommits) {
          let message = '';
          let user = '';
          let pr;

          const m = commit[3].match(/(.*?) \(#(\d+)\)$/);

          if (m) {
            const prId = m[2];
            message = m[1];
            const prData = prDataByPrId.get(prId);
            if (prData) {
              user = `[@${prData.user.login}](${prData.user.html_url})`;
              pr = `https://github.com/${OWNER}/${REPO}/pull/${prId}`;
            } else {
              user = commit[2];
            }
          } else {
            message = commit[3];
            user = commit[2];
          }
          this.context.stdout.write(`* ${message} - ${user}` + (pr ? ` - [PR](${pr})` : '') + '\n');
        }

        return 0;
      }
    }

    return {
      commands: [ReleaseNotesCommand]
    };
  }
};
