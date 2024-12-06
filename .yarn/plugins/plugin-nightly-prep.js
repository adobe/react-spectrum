// From https://github.com/yarnpkg/berry/blob/master/packages/plugin-version/sources/commands/version/apply.ts in accordance with the BSD license, see Notice.txt

const Decision = {
  UNDECIDED: 'undecided',
  DECLINE: 'decline',
  MAJOR: 'major',
  MINOR: 'minor',
  PATCH: 'patch',
  PRERELEASE: 'prerelease'
};

module.exports = {
  name: `plugin-nightly-prep`,
  factory: require => {
    const {PortablePath, npath, ppath, xfs} = require('@yarnpkg/fslib');
    const {BaseCommand} = require(`@yarnpkg/cli`);
    const {Project, Configuration, Cache, StreamReport, structUtils, Manifest, miscUtils, MessageName, WorkspaceResolver} = require(`@yarnpkg/core`);
    const {Command, Option} = require(`clipanion`);
    const {parseSyml, stringifySyml} = require(`@yarnpkg/parsers`);

    class NightlyPrepCommand extends BaseCommand {
      static paths = [[`apply-nightly`]];

      // Show descriptive usage for a --help argument passed to this command
      static usage = Command.Usage({
        description: `apply nightly version bumps`,
        details: `
          This command will update all references in every workspace package json to point to the exact nightly version, no range.
        `,
        examples: [[
          `yarn apply-nightly`,
        ]],
      });

      all = Option.Boolean(`--all`, false, {
        description: `Apply the deferred version changes on all workspaces`,
      });

      async execute() {
        const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
        const {project, workspace} = await Project.find(configuration, this.context.cwd);
        const cache = await Cache.find(configuration);

        const applyReport = await StreamReport.start({
          configuration,
          json: this.json,
          stdout: this.context.stdout,
        }, async report => {
          const prerelease = this.prerelease
            ? typeof this.prerelease !== `boolean` ? this.prerelease : `rc.%n`
            : null;

          const allReleases = await resolveVersionFiles(project, xfs, ppath, parseSyml, structUtils, {prerelease});
          let filteredReleases = new Map();

          if (this.all) {
            filteredReleases = allReleases;
          } else {
            const relevantWorkspaces = this.recursive
              ? workspace.getRecursiveWorkspaceDependencies()
              : [workspace];

            for (const child of relevantWorkspaces) {
              const release = allReleases.get(child);
              if (typeof release !== `undefined`) {
                filteredReleases.set(child, release);
              }
            }
          }

          if (filteredReleases.size === 0) {
            const protip = allReleases.size > 0
              ? ` Did you want to add --all?`
              : ``;

            report.reportWarning(MessageName.UNNAMED, `The current workspace doesn't seem to require a version bump.${protip}`);
            return;
          }

          applyReleases(project, filteredReleases, Manifest, miscUtils, structUtils, MessageName, npath, WorkspaceResolver, {report});

          if (!this.dryRun) {
            if (!prerelease) {
              if (this.all) {
                await clearVersionFiles(project, xfs);
              } else {
                await updateVersionFiles(project, [...filteredReleases.keys()], xfs, parseSyml, stringifySyml, structUtils);
              }
            }

            report.reportSeparator();
          }
        });

        if (this.dryRun || applyReport.hasErrors())
          return applyReport.exitCode();

        return await project.installWithNewReport({
          json: this.json,
          stdout: this.context.stdout,
        }, {
          cache,
        });
      }
    }

    return {
      commands: [
        NightlyPrepCommand,
      ],
    };
  }
};

async function resolveVersionFiles(project, xfs, ppath, parseSyml, structUtils, miscUtils, {prerelease = null} = {}) {
  let candidateReleases = new Map();

  const deferredVersionFolder = project.configuration.get(`deferredVersionFolder`);
  if (!xfs.existsSync(deferredVersionFolder))
    return candidateReleases;

  const deferredVersionFiles = await xfs.readdirPromise(deferredVersionFolder);

  for (const entry of deferredVersionFiles) {
    if (!entry.endsWith(`.yml`))
      continue;

    const versionPath = ppath.join(deferredVersionFolder, entry);
    const versionContent = await xfs.readFilePromise(versionPath, `utf8`);
    const versionData = parseSyml(versionContent);


    for (const [identStr, decision] of Object.entries(versionData.releases || {})) {
      if (decision === Decision.DECLINE)
        continue;

      const ident = structUtils.parseIdent(identStr);

      const workspace = project.tryWorkspaceByIdent(ident);
      if (workspace === null)
        throw new Error(`Assertion failed: Expected a release definition file to only reference existing workspaces (${ppath.basename(versionPath)} references ${identStr})`);

      if (workspace.manifest.version === null)
        throw new Error(`Assertion failed: Expected the workspace to have a version (${structUtils.prettyLocator(project.configuration, workspace.anchoredLocator)})`);

      // If there's a `stableVersion` field, then we assume that `version`
      // contains a prerelease version and that we need to base the version
      // bump relative to the latest stable instead.
      const baseVersion = workspace.manifest.raw.stableVersion ?? workspace.manifest.version;
      const suggestedRelease = applyStrategy(baseVersion, validateReleaseDecision(decision, miscUtils), miscUtils);

      if (suggestedRelease === null)
        throw new Error(`Assertion failed: Expected ${baseVersion} to support being bumped via strategy ${decision}`);

      const bestRelease = suggestedRelease;

      candidateReleases.set(workspace, bestRelease);
    }
  }

  if (prerelease) {
    candidateReleases = new Map([...candidateReleases].map(([workspace, release]) => {
      return [workspace, applyPrerelease(release, {current: workspace.manifest.version, prerelease})];
    }));
  }

  return candidateReleases;
}

function applyReleases(project, newVersions, Manifest, miscUtils, structUtils, MessageName, npath, WorkspaceResolver, {report}) {
  const allDependents = new Map();

  // First we compute the reverse map to figure out which workspace is
  // depended upon by which other.
  //
  // Note that we need to do this before applying the new versions,
  // otherwise the `findWorkspacesByDescriptor` calls won't be able to
  // resolve the workspaces anymore (because the workspace versions will
  // have changed and won't match the outdated dependencies).

  for (const dependent of project.workspaces) {
    for (const set of Manifest.allDependencies) {
      for (const descriptor of dependent.manifest[set].values()) {
        const workspace = project.tryWorkspaceByDescriptor(descriptor);
        if (workspace === null)
          continue;

        // We only care about workspaces that depend on a workspace that will
        // receive a fresh update
        if (!newVersions.has(workspace))
          continue;

        const dependents = miscUtils.getArrayWithDefault(allDependents, workspace);
        dependents.push([dependent, set, descriptor.identHash]);
      }
    }
  }

  // Now that we know which workspaces depend on which others, we can
  // proceed to update everything at once using our accumulated knowledge.

  for (const [workspace, newVersion] of newVersions) {
    const oldVersion = workspace.manifest.version;
    workspace.manifest.version = newVersion;

    const identString = workspace.manifest.name !== null
      ? structUtils.stringifyIdent(workspace.manifest.name)
      : null;

    report.reportInfo(MessageName.UNNAMED, `${structUtils.prettyLocator(project.configuration, workspace.anchoredLocator)}: Bumped to ${newVersion}`);
    report.reportJson({cwd: npath.fromPortablePath(workspace.cwd), ident: identString, oldVersion, newVersion});

    const dependents = allDependents.get(workspace);
    if (typeof dependents === `undefined`)
      continue;

    for (const [dependent, set, identHash] of dependents) {
      const descriptor = dependent.manifest[set].get(identHash);
      if (typeof descriptor === `undefined`)
        throw new Error(`Assertion failed: The dependency should have existed`);

      let range = descriptor.range;
      let useWorkspaceProtocol = false;

      if (range.startsWith(WorkspaceResolver.protocol)) {
        range = range.slice(WorkspaceResolver.protocol.length);
        useWorkspaceProtocol = true;

        // Workspaces referenced through their path never get upgraded ("workspace:packages/yarnpkg-core")
        if (range === workspace.relativeCwd) {
          continue;
        }
      }

      let newRange = `${newVersion}`;
      if (useWorkspaceProtocol)
        newRange = `${WorkspaceResolver.protocol}${newRange}`;

      const newDescriptor = structUtils.makeDescriptor(descriptor, newRange);
      dependent.manifest[set].set(identHash, newDescriptor);
    }
  }
}

async function clearVersionFiles(project, xfs) {
  const deferredVersionFolder = project.configuration.get(`deferredVersionFolder`);
  if (!xfs.existsSync(deferredVersionFolder))
    return;

  await xfs.removePromise(deferredVersionFolder);
}

async function updateVersionFiles(project, workspaces, xfs, parseSyml, stringifySyml, structUtils) {
  const workspaceSet = new Set(workspaces);

  const deferredVersionFolder = project.configuration.get(`deferredVersionFolder`);
  if (!xfs.existsSync(deferredVersionFolder))
    return;

  const deferredVersionFiles = await xfs.readdirPromise(deferredVersionFolder);

  for (const entry of deferredVersionFiles) {
    if (!entry.endsWith(`.yml`))
      continue;

    const versionPath = ppath.join(deferredVersionFolder, entry);
    const versionContent = await xfs.readFilePromise(versionPath, `utf8`);
    const versionData = parseSyml(versionContent);

    const releases = versionData?.releases;
    if (!releases)
      continue;

    for (const locatorStr of Object.keys(releases)) {
      const ident = structUtils.parseIdent(locatorStr);
      const workspace = project.tryWorkspaceByIdent(ident);

      if (workspace === null || workspaceSet.has(workspace)) {
        delete versionData.releases[locatorStr];
      }
    }

    if (Object.keys(versionData.releases).length > 0) {
      await xfs.changeFilePromise(versionPath, stringifySyml(
        new stringifySyml.PreserveOrdering(
          versionData,
        ),
      ));
    } else {
      await xfs.unlinkPromise(versionPath);
    }
  }
}

function applyStrategy(version, strategy) {
  return strategy;
}

function validateReleaseDecision(decision, miscUtils) {
  return decision;
}
