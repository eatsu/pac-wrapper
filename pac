#!/usr/bin/env bash
#
# A simple pacman wrapper that provides intuitive syntax similar to dnf, apt,
# zypper, etc.
#
set -ueo pipefail

VERSION="1.0.0"
PACMAN="${PAC_PACMAN:-"pacman"}"

if [[ "$PACMAN" == "pacman" ]] && (( EUID != 0 )); then
  SUDO_PACMAN=("sudo" "$PACMAN")
else
  SUDO_PACMAN=("$PACMAN")
fi

help() {
  cat << EOF
Usage:
  pac <command> [option(s)] [...]
  pac [option]

Commands:
  install, in <package(s)>  Install packages and their dependencies
  remove, rm <package(s)>   Remove packages and their dependencies
  autoremove, arm           Remove dependencies that are no longer needed (orphans)
  clean                     Remove old packages from cache directory
  upgrade, up               Sync databases and upgrade installed packages
  search, se <keyword(s)>   Search package names and descriptions
  info, if <package(s)>     Show package information
  files <package(s)>        Show package file list
  owner <file(s)>           Query packages that own the files
  mark <package(s)>         Mark packages as explicitly installed
  list, ls                  List installed packages

Command 'search' specific options:
  -i, --installed           Search only installed package names and descriptions

Command 'mark' specific options:
  -d, --asdeps              Mark packages as dependencies

Command 'list' specific options:
  -e, --explicit            List packages explicitly installed
  -d, --deps                List packages installed as dependencies
  -n, --native              List installed packages found in sync db(s)
  -f, --foreign             List installed packages not found in sync db(s)

General options:
  -h, --help                Print help information
  -V, --version             Print version information
  -s, --status              Print what pac is wrapping

If no arguments are provided, 'pac upgrade' will be performed.
EOF
}

version() {
  echo "pac $VERSION"
}

status() {
  cat << EOF
pac is wrapping '$PACMAN'.

To wrap another pacman-compatible program, set the environment variable
'PAC_PACMAN'.
EOF
}

install() {
  "${SUDO_PACMAN[@]}" -S "$@"
}

remove() {
  "${SUDO_PACMAN[@]}" -Rs "$@"
}

autoremove() {
  readarray -t pkgs < <("$PACMAN" -Qdtq "$@")
  if [[ -n "${pkgs[*]}" ]]; then
    "${SUDO_PACMAN[@]}" -Rs "${pkgs[@]}"
  else
    false
  fi
}

clean() {
  "$PACMAN" -Sc "$@"
}

upgrade() {
  "${SUDO_PACMAN[@]}" -Syu "$@"
}

search() {
  for i in "$@"; do
    case "$i" in
      -i|--installed)
        local installed="true"
        ;;
      -*)
        echo "pac search: unrecognized option '$i'"
        exit 1
        ;;
      *)
        local pkgs+=("$i")
        ;;
    esac
  done

  if "${installed:-"false"}"; then
    "$PACMAN" -Qs "${pkgs[@]}"
  else
    "$PACMAN" -Ss "${pkgs[@]}"
  fi
}

info() {
  for i in "$@"; do
    # Add newline to -g to match -i
    ("$PACMAN" -Qg "$i" 2> /dev/null && echo) || \
    ("$PACMAN" -Qi "$i" 2> /dev/null) || \
    ("$PACMAN" -Sg "$i" 2> /dev/null && echo) || \
    ("$PACMAN" -Si "$i")
  done
}

owner() {
  "$PACMAN" -Qo "$@"
}

files() {
  "$PACMAN" -Ql "$@"
}

mark() {
  for i in "$@"; do
    case "$i" in
      -d|--asdeps)
        local opts+=("--asdeps")
        ;;
      -*)
        echo "pac mark: unrecognized option '$i'"
        exit 1
        ;;
      *)
        local pkgs+=("$i")
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -D "${opts[@]:-"--asexplicit"}" "${pkgs[@]}"
}

list() {
  for i in "$@"; do
    case "$i" in
      -e|--explicit)
        local opts+=("--explicit")
        ;;
      -d|--deps)
        local opts+=("--deps")
        ;;
      -n|--native)
        local opts+=("--native")
        ;;
      -f|--foreign)
        local opts+=("--foreign")
        ;;
      -*)
        echo "pac list: unrecognized option '$i'"
        exit 1
        ;;
      *)
        local pkgs+=("$i")
        ;;
    esac
  done

  "$PACMAN" -Q "${opts[@]}" "${pkgs[@]}"
}

main() {
  case "${1:-}" in
    ""|up|upgrade)
      shift || true
      upgrade "$@"
      ;;
    in|install)
      shift
      install "$@"
      ;;
    rm|remove)
      shift
      remove "$@"
      ;;
    arm|autoremove)
      shift
      autoremove "$@"
      ;;
    clean)
      shift
      clean "$@"
      ;;
    se|search)
      shift
      search "$@"
      ;;
    if|info)
      shift
      info "$@"
      ;;
    owner)
      shift
      owner "$@"
      ;;
    files)
      shift
      files "$@"
      ;;
    mark)
      shift
      mark "$@"
      ;;
    ls|list)
      shift
      list "$@"
      ;;
    -h|--help)
      help
      ;;
    -V|--version)
      version
      ;;
    -s|--status)
      status
      ;;
    *)
      "$PACMAN" "$@"
      ;;
  esac
}

main "$@"
