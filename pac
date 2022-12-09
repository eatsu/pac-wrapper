#!/usr/bin/env bash
#
# A simple pacman wrapper that provides intuitive syntax similar to dnf, apt,
# zypper, etc.
#
set -ueo pipefail

VERSION="3.0.0"
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
  install, in           Install packages and their dependencies
  remove, rm            Remove packages and their dependencies
  autoremove, arm       Remove dependencies that are no longer needed
  clean                 Remove old packages from cache
  upgrade, up           Sync databases and upgrade installed packages
  search, se            Search package names and descriptions
  info, if              Show package information
  files                 Show package file list
  owner                 Query packages that own the files
  mark                  Mark packages as explicitly installed
  list, ls              List installed packages

General options:
  -h, --help            Print help information
  -V, --version         Print version information
  -s, --status          Print what pac is wrapping

Run 'pac <command> --help' for more information on a specific command.

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

install::help() {
  cat << EOF
Install packages and their dependencies

Usage:
  pac install [option(s)] <package(s)>

Alias:
  in

Options:
  --asdeps              Install packages as dependencies
  --asexplicit          Install packages as explicitly installed
  --needed              Do not reinstall up-to-date packages
  --noconfirm           Do not ask for confirmation
  --overwrite <glob>    Overwrite conflicting files (can be used more than once)

General option:
  -h, --help            Print help information
EOF
}

install() {
  for i in "$@"; do
    case "$i" in
      --asdeps|--asexplicit|--needed|--noconfirm|--overwrite)
        ;;
      -h|--help)
        install::help
        exit
        ;;
      -*)
        echo "pac install: unrecognized option '$i'" 1>&2
        exit 1
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -S "$@"
}

remove::help() {
  cat << EOF
Remove packages and their dependencies

Usage:
  pac remove [option(s)] <package(s)>

Alias:
  rm

Options:
  -c, --cascade         Remove also dependent packages
  -u, --unneeded        Remove only non-dependent packages
  -n, --nosave          Remove also configuration files
  --noconfirm           Do not ask for confirmation

General option:
  -h, --help            Print help information
EOF
}

remove() {
  for i in "$@"; do
    case "$i" in
      -c|--cascade|-u|--unneeded|-n|--nosave|--noconfirm)
        ;;
      -h|--help)
        remove::help
        exit
        ;;
      -*)
        echo "pac remove: unrecognized option '$i'" 1>&2
        exit 1
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -Rs "$@"
}

autoremove::help() {
  cat << EOF
Remove dependencies that are no longer needed

Usage:
  pac autoremove [option(s)] [package(s)]

Alias:
  arm

Options:
  -n, --nosave          Remove also configuration files
  --noconfirm           Do not ask for confirmation

General option:
  -h, --help            Print help information
EOF
}

autoremove() {
  for i in "$@"; do
    case "$i" in
      -n|--nosave|--noconfirm)
        local opts+=("$i")
        ;;
      -h|--help)
        autoremove::help
        exit
        ;;
      -*)
        echo "pac autoremove: unrecognized option '$i'" 1>&2
        exit 1
        ;;
      *)
        local pkgs+=("$i")
        ;;
    esac
  done

  readarray -t pkgs < <("$PACMAN" -Qdtq "${pkgs[@]}")
  if [[ -n "${pkgs[*]}" ]]; then
    "${SUDO_PACMAN[@]}" -Rs "${opts[@]}" "${pkgs[@]}"
  else
    echo "pac autoremove: no orphan packages were found" 1>&2
    exit 1
  fi
}

clean::help() {
  cat << EOF
Remove old packages from cache

Usage:
  pac clean [option]

Options:
  --noconfirm           Do not ask for confirmation

General option:
  -h, --help            Print help information
EOF
}

clean() {
  for i in "$@"; do
    case "$i" in
      --noconfirm)
        ;;
      -h|--help)
        clean::help
        exit
        ;;
      -*)
        echo "pac clean: unrecognized option '$i'" 1>&2
        exit 1
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -Sc "$@"
}

upgrade::help() {
  cat << EOF
Sync databases and upgrade installed packages

Usage:
  pac upgrade [option(s)] [package(s)]

Alias:
  up

Options:
  --ignore <package>    Ignore a package upgrade (can be used more than once)
  --ignoregroup <group> Ignore a group upgrade (can be used more than once)
  --noconfirm           Do not ask for confirmation
  --overwrite <glob>    Overwrite conflicting files (can be used more than once)

General option:
  -h, --help            Print help information
EOF
}

upgrade() {
  for i in "$@"; do
    case "$i" in
      --ignore|--ignoregroup|--noconfirm|--overwrite)
        ;;
      -h|--help)
        upgrade::help
        exit
        ;;
      -*)
        echo "pac upgrade: unrecognized option '$i'" 1>&2
        exit 1
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -Syu "$@"
}

search::help() {
  cat << EOF
Search package names and descriptions

Usage:
  pac search [option] <keyword(s)>

Alias:
  se

Options:
  -i, --installed       Search only installed packages

General option:
  -h, --help            Print help information
EOF
}

search() {
  for i in "$@"; do
    case "$i" in
      -i|--installed)
        local operation="-Q"
        ;;
      -h|--help)
        search::help
        exit
        ;;
      -*)
        echo "pac search: unrecognized option '$i'" 1>&2
        exit 1
        ;;
      *)
        local pkgs+=("$i")
        ;;
    esac
  done

  "$PACMAN" "${operation:-"-S"}" -s "${pkgs[@]}"
}

info::help() {
  cat << EOF
Show package information

Usage:
  pac info <package(s)>

Alias:
  if

General option:
  -h, --help            Print help information
EOF
}

info() {
  for i in "$@"; do
    case "$i" in
      -h|--help)
        info::help
        exit
        ;;
      -*)
        echo "pac info: unrecognized option '$i'" 1>&2
        exit 1
        ;;
    esac
  done

  for i in "$@"; do
    # Add newline to -g to match -i
    ("$PACMAN" -Qg "$i" 2> /dev/null && echo) ||
    ("$PACMAN" -Qi "$i" 2> /dev/null) ||
    ("$PACMAN" -Sg "$i" 2> /dev/null && echo) ||
    ("$PACMAN" -Si "$i")
  done
}

owner::help() {
  cat << EOF
Query packages that own the files

Usage:
  pac owner <file(s)>

General option:
  -h, --help            Print help information
EOF
}

owner() {
  for i in "$@"; do
    case "$i" in
      -h|--help)
        owner::help
        exit
        ;;
      -*)
        echo "pac owner: unrecognized option '$i'" 1>&2
        exit 1
        ;;
    esac
  done

  "$PACMAN" -Qo "$@"
}

files::help() {
  cat << EOF
Show package file list

Usage:
  pac files <package(s)>

General option:
  -h, --help            Print help information
EOF
}

files() {
  for i in "$@"; do
    case "$i" in
      -h|--help)
        files::help
        exit
        ;;
      -*)
        echo "pac files: unrecognized option '$i'" 1>&2
        exit 1
        ;;
    esac
  done

  for i in "$@"; do
    "$PACMAN" -Ql "$i" 2> /dev/null || "$PACMAN" -Fl "$i"
  done
}

mark::help() {
  cat << EOF
Mark packages as explicitly installed

Usage:
  pac mark [option] <package(s)>

Options:
  -d, --asdeps          Mark packages as dependencies

General option:
  -h, --help            Print help information
EOF
}

mark() {
  for i in "$@"; do
    case "$i" in
      -d|--asdeps)
        local opts+=("--asdeps")
        ;;
      -h|--help)
        mark::help
        exit
        ;;
      -*)
        echo "pac mark: unrecognized option '$i'" 1>&2
        exit 1
        ;;
      *)
        local pkgs+=("$i")
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -D "${opts[@]:-"--asexplicit"}" "${pkgs[@]}"
}

list::help() {
  cat << EOF
List installed packages

Usage:
  pac list [option(s)] [package(s)]

Alias:
  ls

Options:
  -e, --explicit        List packages explicitly installed
  -d, --deps            List packages installed as dependencies
  -n, --native          List installed packages found in sync db(s)
  -f, --foreign         List installed packages not found in sync db(s)

General option:
  -h, --help            Print help information
EOF
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
      -h|--help)
        list::help
        exit
        ;;
      -*)
        echo "pac list: unrecognized option '$i'" 1>&2
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
