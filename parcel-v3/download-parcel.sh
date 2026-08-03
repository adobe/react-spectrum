#!/usr/bin/env bash

set -euo pipefail

repo="parcel-bundler/parcel"
branch="core-rs3"
workflow="core-rs3.yml"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
output_path="${script_dir}/parcel"

die() {
  echo "error: $*" >&2
  exit 1
}

for command_name in gh unzip; do
  command -v "${command_name}" >/dev/null 2>&1 ||
    die "${command_name} is required but was not found"
done

case "$(uname -s)" in
  Darwin)
    artifact_name="parcel-macOS"
    ;;
  Linux)
    artifact_name="parcel-Linux"
    ;;
  *)
    die "unsupported operating system: $(uname -s) (expected macOS or Linux)"
    ;;
esac

echo "Finding the latest passing ${workflow} run on ${repo}:${branch}..."
run_info="$({
  gh api --method GET \
    "repos/${repo}/actions/workflows/${workflow}/runs" \
    -f branch="${branch}" \
    -f status=success \
    -f event=push \
    -f per_page=1 \
    --jq '.workflow_runs[0] | [.id, .head_sha, .created_at, .html_url] | join("|")'
} || die "could not query GitHub Actions (run 'gh auth login' and try again)")"

[[ -n "${run_info}" ]] || die "no passing workflow run found"
IFS='|' read -r run_id head_sha created_at run_url <<<"${run_info}"
[[ -n "${run_id}" && -n "${head_sha}" ]] || die "GitHub returned incomplete workflow run metadata"

artifact_info="$(
  gh api --method GET \
    "repos/${repo}/actions/runs/${run_id}/artifacts" \
    -f per_page=100 \
    --jq ".artifacts[] | select(.name == \"${artifact_name}\" and .expired == false) | [.id, .digest] | join(\"|\")" \
    | head -n 1
)"

[[ -n "${artifact_info}" ]] ||
  die "run ${run_id} has no unexpired ${artifact_name} artifact"
IFS='|' read -r artifact_id artifact_digest <<<"${artifact_info}"
[[ -n "${artifact_id}" ]] || die "GitHub returned incomplete artifact metadata"

temp_dir="$(mktemp -d "${TMPDIR:-/tmp}/parcel-download.XXXXXX")"
archive_path="${temp_dir}/${artifact_name}.zip"
extract_dir="${temp_dir}/extracted"
staged_output="${script_dir}/.parcel.$$"

cleanup() {
  rm -rf "${temp_dir}"
  rm -f "${staged_output}"
}
trap cleanup EXIT INT TERM

mkdir "${extract_dir}"
echo "Downloading ${artifact_name} from ${run_url}..."
gh api \
  -H 'Accept: application/vnd.github+json' \
  "repos/${repo}/actions/artifacts/${artifact_id}/zip" \
  >"${archive_path}"

if [[ "${artifact_digest}" == sha256:* ]]; then
  expected_digest="${artifact_digest#sha256:}"
  if command -v sha256sum >/dev/null 2>&1; then
    actual_digest="$(sha256sum "${archive_path}" | awk '{print $1}')"
  elif command -v shasum >/dev/null 2>&1; then
    actual_digest="$(shasum -a 256 "${archive_path}" | awk '{print $1}')"
  else
    die "sha256sum or shasum is required to verify the artifact"
  fi

  [[ "${actual_digest}" == "${expected_digest}" ]] ||
    die "artifact checksum mismatch"
fi

unzip -q "${archive_path}" -d "${extract_dir}"
[[ -f "${extract_dir}/parcel" ]] ||
  die "${artifact_name} did not contain the expected parcel executable"

cp "${extract_dir}/parcel" "${staged_output}"
chmod 755 "${staged_output}"
mv -f "${staged_output}" "${output_path}"

echo "Installed ${output_path}"
echo "Source: ${head_sha} (${created_at})"
