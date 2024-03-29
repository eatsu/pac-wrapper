#!/usr/bin/env bash
set -ueo pipefail

VERSION="4.0.0"
PACMAN="${PAC_PACMAN:-"pacman"}"

if [[ "$PACMAN" == "pacman" ]] && (( EUID != 0 )); then
  SUDO_PACMAN=("sudo" "$PACMAN")
else
  SUDO_PACMAN=("$PACMAN")
fi

help() {
  cat << EOF
A pacman wrapper that provides intuitive syntax

Usage:
  pac <command> [option(s)] [target(s)]
  pac [option]

Commands:
  install, in           Install packages and their dependencies
  remove, rm            Remove packages and their dependencies
  autoremove, arm       Remove dependencies that are no longer needed
  clean                 Remove old packages from cache
  upgrade, up           Sync databases and upgrade installed packages
  search, se            Search package names and descriptions
  info, if              Show information about packages or groups
  files                 List files owned by the specified packages
  owner                 Query packages that own the specified files
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
  --overwrite <glob>    Overwrite conflicting files (can be used more than once)
  -y, --yes             Do not ask for confirmation

General option:
  -h, --help            Print help information
EOF
}

install() {
  local cmdname shortopts longopts args opts
  cmdname="pac install"
  shortopts="yh"
  longopts="asdeps,asexplicit,needed,overwrite:,yes,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      --asdeps|--asexplicit|--needed)
        opts+=("$1")
        shift
        ;;
      --overwrite)
        opts+=("$1" "$2")
        shift 2
        ;;
      -y|--yes)
        opts+=("--noconfirm")
        shift
        ;;
      -h|--help)
        install::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -S "${opts[@]}" "$@"
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
  -y, --yes             Do not ask for confirmation

General option:
  -h, --help            Print help information
EOF
}

remove() {
  local cmdname shortopts longopts args opts
  cmdname="pac remove"
  shortopts="cunyh"
  longopts="cascade,unneeded,nosave,yes,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -c|--cascade|-u|--unneeded|-n|--nosave)
        opts+=("$1")
        shift
        ;;
      -y|--yes)
        opts+=("--noconfirm")
        shift
        ;;
      -h|--help)
        remove::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -Rs "${opts[@]}" "$@"
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
  -y, --yes             Do not ask for confirmation

General option:
  -h, --help            Print help information
EOF
}

autoremove() {
  local cmdname shortopts longopts args opts pkgs
  cmdname="pac autoremove"
  shortopts="nyh"
  longopts="nosave,yes,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -n|--nosave)
        opts+=("$1")
        shift
        ;;
      -y|--yes)
        opts+=("--noconfirm")
        shift
        ;;
      -h|--help)
        autoremove::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  readarray -t pkgs < <("$PACMAN" -Qdtq "$@")
  if [[ -n "${pkgs[*]}" ]]; then
    "${SUDO_PACMAN[@]}" -Rs "${opts[@]}" "${pkgs[@]}"
  else
    echo "$cmdname: no orphan packages were found" >&2
    exit 1
  fi
}

clean::help() {
  cat << EOF
Remove old packages from cache

Usage:
  pac clean [option(s)]

Options:
  -a, --all             Remove all packages from cache
  -y, --yes             Do not ask for confirmation

General option:
  -h, --help            Print help information
EOF
}

clean() {
  local cmdname shortopts longopts args opts
  cmdname="pac clean"
  shortopts="ayh"
  longopts="all,yes,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -a|--all)
        opts+=("--clean")
        shift
        ;;
      -y|--yes)
        opts+=("--noconfirm")
        shift
        ;;
      -h|--help)
        clean::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -Sc "${opts[@]}"
}

upgrade::help() {
  cat << EOF
Sync databases and upgrade installed packages

Usage:
  pac upgrade [option(s)]

Alias:
  up

Options:
  --ignore <package>    Ignore a package upgrade (can be used more than once)
  --ignoregroup <group> Ignore a group upgrade (can be used more than once)
  --overwrite <glob>    Overwrite conflicting files (can be used more than once)
  -y, --yes             Do not ask for confirmation

General option:
  -h, --help            Print help information
EOF
}

upgrade() {
  local cmdname shortopts longopts args opts
  cmdname="pac upgrade"
  shortopts="yh"
  longopts="ignore:,ignoregroup:,overwrite:,yes,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      --ignore|--ignoregroup|--overwrite)
        opts+=("$1" "$2")
        shift 2
        ;;
      -y|--yes)
        opts+=("--noconfirm")
        shift
        ;;
      -h|--help)
        upgrade::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -Syu "${opts[@]}"
}

search::help() {
  cat << EOF
Search package names and descriptions

Usage:
  pac search [option(s)] <keyword(s)>

Alias:
  se

Options:
  -i, --installed       Search only installed packages
  -q, --quiet           Show less information

General option:
  -h, --help            Print help information
EOF
}

search() {
  local cmdname shortopts longopts args operation
  cmdname="pac search"
  shortopts="iqh"
  longopts="installed,quiet,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -i|--installed)
        operation="-Qs"
        shift
        ;;
      -q|--quiet)
        opts+=("$1")
        shift
        ;;
      -h|--help)
        search::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  "$PACMAN" "${operation:-"-Ss"}" "${opts[@]}" "$@"
}

info::help() {
  cat << EOF
Show information about packages or groups

Usage:
  pac info [option(s)] <package(s)>

Alias:
  if

Options:
  -e, --extended        Show extended information for packages
  -q, --quiet           Show less information for groups

General option:
  -h, --help            Print help information
EOF
}

info() {
  local cmdname shortopts longopts args pkg_opts grp_opts arg output ist_pkgs ist_pkg sed_opts ret
  cmdname="pac info"
  shortopts="eqh"
  longopts="extended,quiet,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -e|--extended)
        pkg_opts+=("--info")
        shift
        ;;
      -q|--quiet)
        grp_opts+=("$1")
        shift
        ;;
      -h|--help)
        info::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  for arg; do
    # Allow files as arguments
    if [[ -f "$arg" ]]; then
      opt_file=("--file")
    fi

    # Try querying the local database first, then the remote one
    if "$PACMAN" -Qi "${pkg_opts[@]}" "${opt_file[@]}" "$arg" 2> /dev/null; then
      :
    # Support for groups
    elif output="$("$PACMAN" -Sg "${grp_opts[@]}" "$arg" 2> /dev/null)"; then
      # Add [installed] label to each line of installed packages
      readarray -t ist_pkgs < <("$PACMAN" -Qg "$arg" 2> /dev/null)
      for ist_pkg in "${ist_pkgs[@]}"; do
        sed_opts+=(-e "s/^$ist_pkg$/$ist_pkg \x1b[1;36m[installed]\x1b[0m/")
      done

      # Make the group name bold
      echo "$output" | sed "${sed_opts[@]}" -e "s/$arg /\x1b[1m$arg\x1b[0m /"

      # Add newline to match -i
      echo
    # Keep -Si at the end to print its error message on failure
    else
      "$PACMAN" -Si "${pkg_opts[@]}" "$arg" || {
        ret=1
        echo
      }
    fi

    # Unset opt_file for next arg
    if [[ -f "$arg" ]]; then
      unset opt_file
    fi
  done

  return "${ret:-0}"
}

owner::help() {
  cat << EOF
Query packages that own the specified files

Usage:
  pac owner [option(s)] <file(s)>

Options:
  -q, --quiet           Show less information

General option:
  -h, --help            Print help information
EOF
}

owner() {
  local cmdname shortopts longopts args
  cmdname="pac owner"
  shortopts="qh"
  longopts="quiet,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -q|--quiet)
        opts+=("$1")
        shift
        ;;
      -h|--help)
        owner::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  "$PACMAN" -Qo "${opts[@]}" "$@"
}

files::help() {
  cat << EOF
List files owned by the specified packages

Usage:
  pac files [option(s)] <package(s)>

Options:
  -q, --quiet           Show less information

General option:
  -h, --help            Print help information
EOF
}

files() {
  local cmdname shortopts longopts args opts arg ret
  cmdname="pac files"
  shortopts="qh"
  longopts="quiet,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -q|--quiet)
        opts+=("$1")
        shift
        ;;
      -h|--help)
        files::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  for arg; do
    # Allow files as arguments
    if [[ -f "$arg" ]]; then
      opt_file=("--file")
    fi

    # Try querying the local database first, then the remote one
    "$PACMAN" -Ql "${opts[@]}" "${opt_file[@]}" "$arg" 2> /dev/null ||
    "$PACMAN" -Fl "${opts[@]}" "$arg" || ret=1

    # Unset opt_file for next arg
    if [[ -f "$arg" ]]; then
      unset opt_file
    fi
  done

  return "${ret:-0}"
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
  local cmdname shortopts longopts args opts
  cmdname="pac mark"
  shortopts="dh"
  longopts="asdeps,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -d|--asdeps)
        opts+=("--asdeps")
        shift
        ;;
      -h|--help)
        mark::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  "${SUDO_PACMAN[@]}" -D "${opts[@]:-"--asexplicit"}" "$@"
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
  -q, --quiet           Show less information

General option:
  -h, --help            Print help information
EOF
}

list() {
  local cmdname shortopts longopts args opts
  cmdname="pac list"
  shortopts="ednfqh"
  longopts="explicit,deps,native,foreign,quiet,help"
  args="$(getopt -n "$cmdname" -o "$shortopts" -l "$longopts" -- "$@")" || exit

  eval set -- "$args"

  while true; do
    case "$1" in
      -e|--explicit|-d|--deps|-n|--native|-q|--quiet)
        opts+=("$1")
        shift
        ;;
      # We use -f instead of -m
      -f|--foreign)
        opts+=("--foreign")
        shift
        ;;
      -h|--help)
        list::help
        exit
        ;;
      --)
        shift
        break
        ;;
    esac
  done

  "$PACMAN" -Q "${opts[@]}" "$@"
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
