//! Repo-agnostic configuration.
//!
//! Everything that used to be hard-coded for the react-spectrum monorepo —
//! the `packages/` root, the `packages/dev/**` exclusion, `yarn` as the
//! package manager, the `dist/types/…` declarations convention, and the React
//! peer pins — lives here instead, derived from the target repo and
//! overridable with a JSON config file at its root.
//!
//! Zero config is the happy path: workspace globs come from the repo's own
//! `package.json#workspaces` (or `pnpm-workspace.yaml`) and the package
//! manager from its lockfile. A repo only needs a config file when it wants
//! to *narrow* that (exclusions) or pin extra packages into the published-API
//! install.

use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

/// Config file names probed at the target repo root, in order.
pub const CONFIG_FILE_NAMES: &[&str] = &["tsdiff.json", ".tsdiff.json"];

/// Templates used to guess a declarations entry for packages that ship one
/// without advertising it in `types`/`typings`/`exports`. `{stem}` is the
/// package's `source` entry with its extension removed (e.g. `src/index`).
const DEFAULT_TYPES_FROM_SOURCE: &[&str] =
    &["dist/types/{stem}.d.ts", "dist/{stem}.d.ts", "{stem}.d.ts"];

/// Globs, relative to a package directory, of the sources whose mtimes decide
/// whether a local build is stale.
const DEFAULT_SOURCE_GLOBS: &[&str] = &["src/**/*.ts", "src/**/*.tsx"];

pub fn default_types_from_source() -> Vec<String> {
    DEFAULT_TYPES_FROM_SOURCE.iter().map(|s| s.to_string()).collect()
}

pub fn default_source_globs() -> Vec<String> {
    DEFAULT_SOURCE_GLOBS.iter().map(|s| s.to_string()).collect()
}

/// Substitute `{stem}` in a declarations-entry template.
pub fn render_template(template: &str, stem: &str) -> String {
    template.replace("{stem}", stem)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PackageManager {
    Yarn,
    Npm,
    Pnpm,
    Bun,
}

impl PackageManager {
    pub fn bin(self) -> &'static str {
        match self {
            PackageManager::Yarn => "yarn",
            PackageManager::Npm => "npm",
            PackageManager::Pnpm => "pnpm",
            PackageManager::Bun => "bun",
        }
    }

    /// Install argv used when building a snapshot of a git ref. Each variant
    /// deliberately relaxes lockfile immutability: a snapshot is built in a
    /// throwaway directory and the point is to get it to build at all.
    fn default_install(self) -> Vec<String> {
        let argv: &[&str] = match self {
            PackageManager::Yarn => &["yarn", "install", "--no-immutable"],
            PackageManager::Npm => &["npm", "install", "--no-audit", "--no-fund"],
            PackageManager::Pnpm => &["pnpm", "install", "--no-frozen-lockfile"],
            PackageManager::Bun => &["bun", "install"],
        };
        argv.iter().map(|s| s.to_string()).collect()
    }

    fn default_build(self) -> Vec<String> {
        vec![self.bin().to_string(), "run".to_string(), "build".to_string()]
    }

    /// Detect from the lockfile at `repo_root`, falling back to the
    /// `packageManager` field, then npm.
    pub fn detect(repo_root: &Path) -> PackageManager {
        for (file, pm) in [
            ("yarn.lock", PackageManager::Yarn),
            ("pnpm-lock.yaml", PackageManager::Pnpm),
            ("bun.lockb", PackageManager::Bun),
            ("bun.lock", PackageManager::Bun),
            ("package-lock.json", PackageManager::Npm),
        ] {
            if repo_root.join(file).exists() {
                return pm;
            }
        }
        let declared = std::fs::read_to_string(repo_root.join("package.json"))
            .ok()
            .and_then(|txt| serde_json::from_str::<serde_json::Value>(&txt).ok())
            .and_then(|v| {
                v.get("packageManager")
                    .and_then(|p| p.as_str())
                    .map(|s| s.to_string())
            });
        match declared.as_deref().map(|s| s.split('@').next().unwrap_or(s)) {
            Some("yarn") => PackageManager::Yarn,
            Some("pnpm") => PackageManager::Pnpm,
            Some("bun") => PackageManager::Bun,
            _ => PackageManager::Npm,
        }
    }
}

/// On-disk shape of the optional `tsdiff.json`. Every field is optional; a
/// missing one falls back to a value derived from the repo.
#[derive(Debug, Default, Deserialize)]
#[serde(default, deny_unknown_fields, rename_all = "camelCase")]
struct ConfigFile {
    /// Globs (relative to the repo root) matching workspace package
    /// directories. A `!`-prefixed entry is treated as an exclusion.
    workspaces: Option<Vec<String>>,
    /// Globs of workspace locations to leave out of the API surface.
    exclude: Option<Vec<String>>,
    package_manager: Option<PackageManager>,
    /// argv used to install a snapshot's dependencies in `get-ref-api`.
    install: Option<Vec<String>>,
    /// argv used to build a snapshot in `get-ref-api`.
    build: Option<Vec<String>>,
    types_from_source: Option<Vec<String>>,
    source_globs: Option<Vec<String>>,
    /// Extra packages installed alongside the published tarballs in
    /// `get-published-api`, pinned to the versions in the local
    /// `node_modules` so external type churn can't masquerade as an API
    /// change (e.g. `react`, `@types/react`).
    pinned_peers: Option<Vec<String>>,
    /// Continue past a package that fails to extract instead of aborting the
    /// whole run. Repos with a package that reliably defeats the doc
    /// transformer set this so the remainder still diffs.
    allow_failures: Option<bool>,
}

/// Fully resolved configuration for one target repo.
#[derive(Debug, Clone, Serialize)]
pub struct RepoConfig {
    pub repo_root: PathBuf,
    /// The config file this was read from, if any.
    pub config_path: Option<PathBuf>,
    pub workspaces: Vec<String>,
    pub exclude: Vec<String>,
    pub package_manager: PackageManager,
    pub install: Vec<String>,
    pub build: Vec<String>,
    pub types_from_source: Vec<String>,
    pub source_globs: Vec<String>,
    pub pinned_peers: Vec<String>,
    pub allow_failures: bool,
}

impl RepoConfig {
    /// Resolve the config for `repo_root`. `explicit` overrides the root
    /// probe, so a caller can point at a config that doesn't live in the repo
    /// being inspected (e.g. when snapshotting a git ref).
    pub fn load(repo_root: &Path, explicit: Option<&Path>) -> Result<RepoConfig> {
        let (file, config_path): (ConfigFile, Option<PathBuf>) = match explicit {
            Some(path) => (read_config(path)?, Some(path.to_path_buf())),
            None => {
                let mut found: (ConfigFile, Option<PathBuf>) = (ConfigFile::default(), None);
                for name in CONFIG_FILE_NAMES {
                    let candidate = repo_root.join(name);
                    if candidate.is_file() {
                        found = (read_config(&candidate)?, Some(candidate));
                        break;
                    }
                }
                found
            }
        };

        let package_manager = file
            .package_manager
            .unwrap_or_else(|| PackageManager::detect(repo_root));

        let declared = file
            .workspaces
            .unwrap_or_else(|| default_workspaces(repo_root));
        let (mut workspaces, mut exclude) = split_negations(declared);
        if let Some(extra) = file.exclude {
            exclude.extend(extra);
        }
        if workspaces.is_empty() {
            workspaces.push(".".to_string());
        }

        Ok(RepoConfig {
            repo_root: repo_root.to_path_buf(),
            config_path,
            workspaces,
            exclude,
            package_manager,
            install: file
                .install
                .unwrap_or_else(|| package_manager.default_install()),
            build: file.build.unwrap_or_else(|| package_manager.default_build()),
            types_from_source: file
                .types_from_source
                .unwrap_or_else(default_types_from_source),
            source_globs: file.source_globs.unwrap_or_else(default_source_globs),
            pinned_peers: file.pinned_peers.unwrap_or_default(),
            allow_failures: file.allow_failures.unwrap_or(false),
        })
    }

    /// Compiled form of [`RepoConfig::exclude`]. Invalid patterns are dropped
    /// rather than fatal — an unusable exclusion should not stop a diff.
    ///
    /// A trailing `/**` is expanded into two patterns, because `glob` treats
    /// `packages/dev/**` as matching only the *contents* of `packages/dev` and
    /// not the directory itself. Exclusions are meant to drop whole subtrees,
    /// so the bare prefix is compiled alongside it.
    pub fn exclude_patterns(&self) -> Vec<glob::Pattern> {
        let mut out = Vec::with_capacity(self.exclude.len());
        for p in &self.exclude {
            match glob::Pattern::new(p) {
                Ok(pattern) => out.push(pattern),
                Err(e) => {
                    eprintln!("  warn: ignoring invalid exclude glob `{p}`: {e}");
                    continue;
                }
            }
            if let Some(prefix) = p.strip_suffix("/**") {
                if !prefix.is_empty() {
                    if let Ok(pattern) = glob::Pattern::new(prefix) {
                        out.push(pattern);
                    }
                }
            }
        }
        out
    }

    /// One-line provenance banner, printed by every command so a run against
    /// an unfamiliar repo shows what it actually resolved.
    pub fn describe(&self) -> String {
        format!(
            "Config: {} | package manager: {} | workspaces: [{}]{}",
            self.config_path
                .as_ref()
                .map(|p| p.display().to_string())
                .unwrap_or_else(|| "defaults (no tsdiff.json)".to_string()),
            self.package_manager.bin(),
            self.workspaces.join(", "),
            if self.exclude.is_empty() {
                String::new()
            } else {
                format!(" | excluding: [{}]", self.exclude.join(", "))
            }
        )
    }
}

fn read_config(path: &Path) -> Result<ConfigFile> {
    let txt = std::fs::read_to_string(path)
        .with_context(|| format!("reading config {}", path.display()))?;
    serde_json::from_str(&txt).with_context(|| format!("parsing config {}", path.display()))
}

/// Split yarn/pnpm-style `!negated` entries out of a workspace glob list.
fn split_negations(patterns: Vec<String>) -> (Vec<String>, Vec<String>) {
    let mut include = Vec::new();
    let mut exclude = Vec::new();
    for pattern in patterns {
        match pattern.strip_prefix('!') {
            Some(rest) => exclude.push(rest.to_string()),
            None => include.push(pattern),
        }
    }
    (include, exclude)
}

/// Workspace globs for a repo with no config file: the repo's own workspace
/// declaration if it has one, then a conventional `packages/` layout, then
/// the repo root itself (a single-package repo).
fn default_workspaces(repo_root: &Path) -> Vec<String> {
    if let Some(ws) = workspaces_from_package_json(repo_root) {
        if !ws.is_empty() {
            return ws;
        }
    }
    if let Some(ws) = workspaces_from_pnpm(repo_root) {
        if !ws.is_empty() {
            return ws;
        }
    }
    if repo_root.join("packages").is_dir() {
        return vec!["packages/*".to_string(), "packages/*/*".to_string()];
    }
    vec![".".to_string()]
}

/// `workspaces: [...]` or `workspaces: {packages: [...]}`.
fn workspaces_from_package_json(repo_root: &Path) -> Option<Vec<String>> {
    let txt = std::fs::read_to_string(repo_root.join("package.json")).ok()?;
    let v: serde_json::Value = serde_json::from_str(&txt).ok()?;
    let ws = v.get("workspaces")?;
    let arr = ws
        .as_array()
        .or_else(|| ws.get("packages").and_then(|p| p.as_array()))?;
    Some(
        arr.iter()
            .filter_map(|s| s.as_str().map(|s| s.to_string()))
            .collect(),
    )
}

/// Minimal `pnpm-workspace.yaml` reader: the `packages:` sequence only. Avoids
/// taking on a YAML dependency for the one key we care about.
fn workspaces_from_pnpm(repo_root: &Path) -> Option<Vec<String>> {
    let txt = std::fs::read_to_string(repo_root.join("pnpm-workspace.yaml")).ok()?;
    let mut out = Vec::new();
    let mut in_packages = false;
    for line in txt.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        // A non-indented, non-list line starts a new top-level key.
        if !line.starts_with(' ') && !line.starts_with('\t') && !trimmed.starts_with('-') {
            in_packages = trimmed.starts_with("packages:");
            continue;
        }
        if in_packages {
            if let Some(item) = trimmed.strip_prefix('-') {
                let item = item.trim().trim_matches(|c| c == '"' || c == '\'');
                if !item.is_empty() {
                    out.push(item.to_string());
                }
            }
        }
    }
    Some(out)
}

/// True when `rel` (a repo-root-relative workspace location) or any of its
/// ancestors matches an exclusion glob. Checking ancestors means a plain
/// `packages/dev` entry excludes everything beneath it, exactly as
/// `packages/dev/**` does.
pub fn is_excluded(rel: &Path, patterns: &[glob::Pattern]) -> bool {
    if patterns.is_empty() {
        return false;
    }
    let mut cur = Some(rel);
    while let Some(path) = cur {
        if path.as_os_str().is_empty() {
            break;
        }
        if patterns.iter().any(|p| p.matches_path(path)) {
            return true;
        }
        cur = path.parent();
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    /// Compile exclusions the way production does, so these tests exercise the
    /// real `/**` expansion rather than a parallel implementation.
    fn patterns(globs: &[&str]) -> Vec<glob::Pattern> {
        let cfg = RepoConfig {
            exclude: globs.iter().map(|g| g.to_string()).collect(),
            ..RepoConfig::load(Path::new("/nonexistent"), None).unwrap()
        };
        cfg.exclude_patterns()
    }

    #[test]
    fn excludes_match_the_directory_and_everything_under_it() {
        let p = patterns(&["packages/dev/**"]);
        assert!(is_excluded(Path::new("packages/dev"), &p));
        assert!(is_excluded(Path::new("packages/dev/mcp"), &p));
        assert!(is_excluded(Path::new("packages/dev/mcp/s2"), &p));
        assert!(!is_excluded(Path::new("packages/@react-aria/button"), &p));
        assert!(!is_excluded(Path::new("packages/react-aria-components"), &p));
    }

    #[test]
    fn a_bare_prefix_excludes_its_subtree_too() {
        let p = patterns(&["tools"]);
        assert!(is_excluded(Path::new("tools"), &p));
        assert!(is_excluded(Path::new("tools/codegen"), &p));
        assert!(!is_excluded(Path::new("toolsmith"), &p));
    }

    #[test]
    fn no_patterns_excludes_nothing() {
        assert!(!is_excluded(Path::new("packages/dev/mcp"), &[]));
    }

    #[test]
    fn negated_workspace_globs_become_exclusions() {
        let (include, exclude) =
            split_negations(vec!["packages/*".to_string(), "!packages/dev/**".to_string()]);
        assert_eq!(include, vec!["packages/*".to_string()]);
        assert_eq!(exclude, vec!["packages/dev/**".to_string()]);
    }

    #[test]
    fn workspaces_default_to_the_repos_own_declaration() {
        let dir = TempDir::new().unwrap();
        std::fs::write(
            dir.path().join("package.json"),
            r#"{"name":"root","workspaces":["packages/*","packages/@*/*"]}"#,
        )
        .unwrap();
        assert_eq!(
            default_workspaces(dir.path()),
            vec!["packages/*".to_string(), "packages/@*/*".to_string()]
        );
    }

    #[test]
    fn workspaces_support_the_object_form() {
        let dir = TempDir::new().unwrap();
        std::fs::write(
            dir.path().join("package.json"),
            r#"{"name":"root","workspaces":{"packages":["libs/*"],"nohoist":[]}}"#,
        )
        .unwrap();
        assert_eq!(default_workspaces(dir.path()), vec!["libs/*".to_string()]);
    }

    #[test]
    fn workspaces_fall_back_to_pnpm_workspace_yaml() {
        let dir = TempDir::new().unwrap();
        std::fs::write(dir.path().join("package.json"), r#"{"name":"root"}"#).unwrap();
        std::fs::write(
            dir.path().join("pnpm-workspace.yaml"),
            "packages:\n  - 'libs/*'\n  - \"apps/*\"\n\ncatalog:\n  react: ^19\n",
        )
        .unwrap();
        assert_eq!(
            default_workspaces(dir.path()),
            vec!["libs/*".to_string(), "apps/*".to_string()]
        );
    }

    #[test]
    fn workspaces_fall_back_to_packages_dir_then_repo_root() {
        let dir = TempDir::new().unwrap();
        std::fs::write(dir.path().join("package.json"), r#"{"name":"solo"}"#).unwrap();
        assert_eq!(default_workspaces(dir.path()), vec![".".to_string()]);

        std::fs::create_dir(dir.path().join("packages")).unwrap();
        assert_eq!(
            default_workspaces(dir.path()),
            vec!["packages/*".to_string(), "packages/*/*".to_string()]
        );
    }

    #[test]
    fn package_manager_detected_from_lockfile() {
        let dir = TempDir::new().unwrap();
        std::fs::write(dir.path().join("package.json"), r#"{"name":"x"}"#).unwrap();
        assert_eq!(PackageManager::detect(dir.path()), PackageManager::Npm);

        std::fs::write(dir.path().join("pnpm-lock.yaml"), "").unwrap();
        assert_eq!(PackageManager::detect(dir.path()), PackageManager::Pnpm);

        std::fs::write(dir.path().join("yarn.lock"), "").unwrap();
        assert_eq!(PackageManager::detect(dir.path()), PackageManager::Yarn);
    }

    #[test]
    fn package_manager_falls_back_to_the_package_manager_field() {
        let dir = TempDir::new().unwrap();
        std::fs::write(
            dir.path().join("package.json"),
            r#"{"name":"x","packageManager":"pnpm@9.1.0"}"#,
        )
        .unwrap();
        assert_eq!(PackageManager::detect(dir.path()), PackageManager::Pnpm);
    }

    #[test]
    fn load_without_a_config_file_derives_everything() {
        let dir = TempDir::new().unwrap();
        std::fs::write(
            dir.path().join("package.json"),
            r#"{"name":"root","workspaces":["packages/*"]}"#,
        )
        .unwrap();
        std::fs::write(dir.path().join("yarn.lock"), "").unwrap();

        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        assert!(cfg.config_path.is_none());
        assert_eq!(cfg.workspaces, vec!["packages/*".to_string()]);
        assert!(cfg.exclude.is_empty());
        assert_eq!(cfg.package_manager, PackageManager::Yarn);
        assert_eq!(cfg.install, vec!["yarn", "install", "--no-immutable"]);
        assert_eq!(cfg.build, vec!["yarn", "run", "build"]);
        assert!(cfg.pinned_peers.is_empty());
    }

    #[test]
    fn load_reads_tsdiff_json_from_the_repo_root() {
        let dir = TempDir::new().unwrap();
        std::fs::write(
            dir.path().join("package.json"),
            r#"{"name":"root","workspaces":["packages/*"]}"#,
        )
        .unwrap();
        std::fs::write(
            dir.path().join("tsdiff.json"),
            r#"{"exclude":["packages/dev/**"],"pinnedPeers":["react"],"build":["make","build"]}"#,
        )
        .unwrap();

        let cfg = RepoConfig::load(dir.path(), None).unwrap();
        assert_eq!(cfg.config_path, Some(dir.path().join("tsdiff.json")));
        assert_eq!(cfg.exclude, vec!["packages/dev/**".to_string()]);
        assert_eq!(cfg.pinned_peers, vec!["react".to_string()]);
        assert_eq!(cfg.build, vec!["make".to_string(), "build".to_string()]);
    }

    #[test]
    fn allow_failures_defaults_off_and_is_readable_from_config() {
        let dir = TempDir::new().unwrap();
        std::fs::write(dir.path().join("package.json"), r#"{"name":"root"}"#).unwrap();
        assert!(!RepoConfig::load(dir.path(), None).unwrap().allow_failures);

        std::fs::write(dir.path().join("tsdiff.json"), r#"{"allowFailures":true}"#).unwrap();
        assert!(RepoConfig::load(dir.path(), None).unwrap().allow_failures);
    }

    #[test]
    fn load_rejects_an_unknown_config_key() {
        let dir = TempDir::new().unwrap();
        std::fs::write(dir.path().join("package.json"), r#"{"name":"root"}"#).unwrap();
        std::fs::write(dir.path().join("tsdiff.json"), r#"{"excludes":["x"]}"#).unwrap();
        assert!(RepoConfig::load(dir.path(), None).is_err());
    }

    #[test]
    fn render_template_substitutes_the_stem() {
        assert_eq!(
            render_template("dist/types/{stem}.d.ts", "src/index"),
            "dist/types/src/index.d.ts"
        );
    }
}
