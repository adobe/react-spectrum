
let gitHash = process.env.CIRCLE_SHA1 ?? 'HEAD';
let now = Date.now();
let today = new Intl.DateTimeFormat('en-US', {day: '2-digit', month: '2-digit', year: '2-digit'}).format(now).replaceAll('/', '');

// Basically we only support auto-upgrading the ranges that are very simple (^x.y.z, ~x.y.z, >=x.y.z, and of course x.y.z)
const SUPPORTED_UPGRADE_REGEXP = /^(>=|[~^]|)(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/;

let Decision = {
  UNDECIDED: `undecided`,
  DECLINE: `decline`,
  MAJOR: `major`,
  MINOR: `minor`,
  PATCH: `patch`,
  PRERELEASE: `prerelease`,
}

module.exports = {
  name: 'nightly',
  factory: require => {
    let {BaseCommand, WorkspaceRequiredError} = require('@yarnpkg/cli');
    let {Configuration, Project, Manifest, StreamReport, structUtils, Cache, miscUtils, MessageName, WorkspaceResolver}              = require('@yarnpkg/core');
    let {PortablePath, npath, ppath, xfs}                       = require('@yarnpkg/fslib');
    let {parseSyml, stringifySyml}                           = require('@yarnpkg/parsers');
    let {Command, Option, Usage, UsageError}  = require('clipanion');
    let semver                                = require('semver');
    let versionUtils = require('@yarnpkg/plugin-version');

    class NightlyCommand extends BaseCommand {
      static paths = [['nightly']];
      dryRun = Option.Boolean('--dry-run', false, {
        description: 'Print the versions without actually generating the package archive',
      });
      all = Option.Boolean(`--all`, false, {
        description: `Apply the deferred version changes on all workspaces`,
      });
      prerelease = Option.String(`--prerelease`, {
        description: `Add a prerelease identifier to new versions`,
        tolerateBoolean: true,
      });

      async execute() {
        const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
        const {project, workspace} = await Project.find(configuration, this.context.cwd);
        const cache = await Cache.find(configuration);

        if (!workspace) {
          throw new WorkspaceRequiredError(project.cwd, this.context.cwd);
        }

        await project.restoreInstallState({
          restoreResolutions: false,
        });

        const applyReport = await StreamReport.start({
          configuration,
          json: this.json,
          stdout: this.context.stdout,
        }, async report => {
          const prerelease = this.prerelease
            ? typeof this.prerelease !== `boolean` ? this.prerelease : `rc.%n`
            : null;

          const allReleases = await resolveVersionFiles(project, {prerelease}, {xfs, parseSyml, ppath, structUtils, semver, Decision});
          let filteredReleases = new Map();

          if (this.all) {
            filteredReleases = allReleases;
          } else {
            const relevantWorkspaces = this.recursive
              ? workspace.getRecursiveWorkspaceDependencies()
              : [workspace];

            for (const child of relevantWorkspaces) {
              const release = allReleases.get(child);
              if (typeof release !== 'undefined') {
                filteredReleases.set(child, release);
              }
            }
          }

          if (filteredReleases.size === 0) {
            const protip = allReleases.size > 0
              ? ' Did you want to add --all?'
              : '';

            report.reportWarning(MessageName.UNNAMED, `The current workspace doesn't seem to require a version bump.${protip}`);
            return;
          }

          applyReleases(project, filteredReleases, {report}, {Manifest, miscUtils, workspace, structUtils, MessageName, npath, WorkspaceResolver, semver});

          if (!this.dryRun) {
            if (!prerelease) {
              if (this.all) {
                await clearVersionFiles(project, {xfs});
              } else {
                await updateVersionFiles(project, [...filteredReleases.keys()], {xfs, ppath, parseSyml, structUtils, stringifySyml});
              }
            }

            report.reportSeparator();
          }
        });

        if (this.dryRun || applyReport.hasErrors()) {
          return applyReport.exitCode();
        }

        return await project.installWithNewReport({
          json: this.json,
          stdout: this.context.stdout
        }, {
          cache
        });
      }
    }

    return {
      commands: [
        NightlyCommand
      ]
    };
  }
};

function applyReleases(project, newVersions, {report}, {Manifest, miscUtils, workspace, structUtils, MessageName, npath, WorkspaceResolver, semver}) {
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
        if (workspace === null) {
          continue;
        }

        // We only care about workspaces that depend on a workspace that will
        // receive a fresh update
        if (!newVersions.has(workspace)) {
          continue;
        }

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

    if (semver.prerelease(newVersion) === null) {
      delete workspace.manifest.raw.stableVersion;
    } else if (!workspace.manifest.raw.stableVersion) {
      workspace.manifest.raw.stableVersion = oldVersion;
    }

    const identString = workspace.manifest.name !== null
      ? structUtils.stringifyIdent(workspace.manifest.name)
      : null;

    report.reportInfo(MessageName.UNNAMED, `${structUtils.prettyLocator(project.configuration, workspace.anchoredLocator)}: Bumped to ${newVersion}`);
    report.reportJson({cwd: npath.fromPortablePath(workspace.cwd), ident: identString, oldVersion, newVersion});

    const dependents = allDependents.get(workspace);
    if (typeof dependents === `undefined`) {
      continue;
    }

    for (const [dependent, set, identHash] of dependents) {
      const descriptor = dependent.manifest[set].get(identHash);
      if (typeof descriptor === `undefined`) {
        throw new Error(`Assertion failed: The dependency should have existed`);
      }

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

      // We can only auto-upgrade the basic semver ranges (we can't auto-upgrade ">=1.0.0 <2.0.0", for example)
      // const parsed = range.match(SUPPORTED_UPGRADE_REGEXP);
      // if (!parsed) {
      //   report.reportWarning(MessageName.UNNAMED, `Couldn't auto-upgrade range ${range} (in ${structUtils.prettyLocator(project.configuration, dependent.anchoredLocator)})`);
      //   continue;
      // }

      let newRange = `${newVersion}`;
      if (useWorkspaceProtocol) {
        newRange = `${newRange}`;
      }

      const newDescriptor = structUtils.makeDescriptor(descriptor, newRange);
      dependent.manifest[set].set(identHash, newDescriptor);
    }
  }
}

async function resolveVersionFiles(project, {prerelease = null} = {}, {xfs, parseSyml, ppath, structUtils, semver, Decision}) {
  let candidateReleases = new Map();

  const deferredVersionFolder = project.configuration.get(`deferredVersionFolder`);
  if (!xfs.existsSync(deferredVersionFolder))
    return candidateReleases;

  const deferredVersionFiles = await xfs.readdirPromise(deferredVersionFolder);

  for (const entry of deferredVersionFiles) {
    if (!entry.endsWith('.yml'))
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

      const candidateRelease = candidateReleases.get(workspace);
      const suggestedRelease = `3.0.0-nightly-${gitHash}-${today}`;

      if (suggestedRelease === null) {
        throw new Error(`Assertion failed: Expected ${baseVersion} to support being bumped via strategy ${decision}`);
      }

      const bestRelease = typeof candidateRelease !== 'undefined'
        ? semver.gt(suggestedRelease, candidateRelease) ? suggestedRelease : candidateRelease
        : suggestedRelease;

      candidateReleases.set(workspace, bestRelease);
    }
  }

  if (prerelease) {
    candidateReleases = new Map([...candidateReleases].map(([workspace, release]) => {
      return [workspace, `3.0.0-nightly-${gitHash}-${today}`];
    }));
  }

  return candidateReleases;
}

async function updateVersionFiles(project, workspaces, {xfs, ppath, parseSyml, structUtils, stringifySyml}) {
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

async function clearVersionFiles(project, {xfs}) {
  const deferredVersionFolder = project.configuration.get(`deferredVersionFolder`);
  if (!xfs.existsSync(deferredVersionFolder))
    return;

  await xfs.removePromise(deferredVersionFolder);
}
