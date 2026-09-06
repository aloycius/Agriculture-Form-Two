#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skill_source="$(cd "${script_dir}/.." && pwd)"
default_codex_dir="${CODEX_HOME:-${HOME}/.codex}"
default_config_dir="${XDG_CONFIG_HOME:-${HOME}/.config}/adt-book-conversion"
default_bin_dir="${HOME}/.local/bin"

prompt_default() {
  local prompt="$1"
  local default_value="$2"
  local reply
  read -r -p "${prompt} [${default_value}]: " reply
  printf '%s' "${reply:-${default_value}}"
}

printf '\nADT Book Conversion setup\n\n'

repo_default="${ADT_STUDIO_DIR:-$(pwd)}"
adt_repo="$(prompt_default "ADT Studio repository" "${repo_default}")"
adt_repo="$(cd "${adt_repo}" 2>/dev/null && pwd)" || {
  printf 'Error: directory does not exist: %s\n' "${adt_repo}" >&2
  exit 1
}

if [[ ! -f "${adt_repo}/package.json" ]] || \
   [[ ! -f "${adt_repo}/packages/pipeline/src/cli.ts" ]] || \
   ! grep -q '"pipeline"' "${adt_repo}/package.json"; then
  printf 'Error: %s is not an ADT Studio checkout with the headless pipeline.\n' "${adt_repo}" >&2
  exit 1
fi

books_dir="$(prompt_default "Books output directory" "${adt_repo}/books")"
mkdir -p "${books_dir}"
books_dir="$(cd "${books_dir}" && pwd)"

bin_dir="$(prompt_default "Command installation directory" "${default_bin_dir}")"
mkdir -p "${bin_dir}" "${default_config_dir}" "${default_codex_dir}/skills"
bin_dir="$(cd "${bin_dir}" && pwd)"

skill_dest="${default_codex_dir}/skills/adt-book-conversion"
if [[ -e "${skill_dest}" ]] && [[ "${skill_source}" != "${skill_dest}" ]]; then
  backup_dest="${skill_dest}.backup-$(date +%Y%m%d-%H%M%S)"
  mv "${skill_dest}" "${backup_dest}"
  printf 'Existing skill backed up to %s\n' "${backup_dest}"
fi

if [[ "${skill_source}" != "${skill_dest}" ]]; then
  cp -R "${skill_source}" "${skill_dest}"
fi

config_file="${default_config_dir}/config"
{
  printf 'ADT_STUDIO_DIR=%q\n' "${adt_repo}"
  printf 'ADT_BOOKS_DIR=%q\n' "${books_dir}"
} > "${config_file}"
chmod 600 "${config_file}"

cp "${skill_dest}/scripts/adt-convert" "${bin_dir}/adt-convert"
chmod 755 "${bin_dir}/adt-convert"

if [[ ! -d "${adt_repo}/node_modules" ]]; then
  read -r -p "ADT Studio dependencies are not installed. Run pnpm install now? [Y/n]: " install_deps
  if [[ ! "${install_deps:-Y}" =~ ^[Nn]$ ]]; then
    (cd "${adt_repo}" && pnpm install)
  fi
fi

if [[ ":${PATH}:" != *":${bin_dir}:"* ]]; then
  shell_rc=""
  case "${SHELL:-}" in
    */zsh) shell_rc="${HOME}/.zshrc" ;;
    */bash) shell_rc="${HOME}/.bashrc" ;;
  esac
  if [[ -n "${shell_rc}" ]]; then
    read -r -p "Add ${bin_dir} to PATH in ${shell_rc}? [Y/n]: " add_path
    if [[ ! "${add_path:-Y}" =~ ^[Nn]$ ]]; then
      path_line="export PATH=\"${bin_dir}:\$PATH\" # adt-book-conversion"
      if [[ ! -f "${shell_rc}" ]] || ! grep -Fq '# adt-book-conversion' "${shell_rc}"; then
        printf '\n%s\n' "${path_line}" >> "${shell_rc}"
      fi
      export PATH="${bin_dir}:${PATH}"
    fi
  fi
fi

printf '\nSetup complete.\n'
printf 'Skill:   %s\n' "${skill_dest}"
printf 'Command: %s/adt-convert\n' "${bin_dir}"
printf 'Config:  %s\n' "${config_file}"
printf '\nStart a new Codex task to discover $adt-book-conversion.\n'
printf 'Run "%s/adt-convert" to convert a book from the terminal.\n' "${bin_dir}"
