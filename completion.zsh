#compdef pac

_pac() {
  typeset -A opt_args
  local context state line
  local curcontext="$curcontext"
  local ret=1

  _arguments -C \
    "$_pac_options[@]" \
    '1: :_pac_commands' \
    '*:: :->cmds' \
    && ret=0

  case "$state" in
    (cmds)
      case "${words[1]}" in
        (install|in)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_install_options[@]" \
            && ret=0
          ;;
        (remove|rm)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_remove_options[@]" \
            && ret=0
          ;;
        (autoremove|arm)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_autoremove_options[@]" \
            && ret=0
          ;;
        (clean)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_clean_options[@]" \
            && ret=0
          ;;
        (upgrade|up)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_upgrade_options[@]" \
            && ret=0
          ;;
        (search|se)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_search_options[@]" \
            && ret=0
          ;;
        (owner)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_owner_options[@]" \
            && ret=0
          ;;
        (mark)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_mark_options[@]" \
            && ret=0
          ;;
        (list|ls)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_list_options[@]" \
            && ret=0
          ;;
        (info|if)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_info_options[@]" \
            && ret=0
          ;;
        (files)
          _arguments \
            "$_pac_common_options[@]" \
            "$_pac_files_options[@]" \
            && ret=0
          ;;
      esac
      ;;
  esac

  return ret
}

(( $+functions[_pac_commands] )) ||
_pac_commands() {
  local -a commands=(
    {install,in}':Install packages and their dependencies'
    {remove,rm}':Remove packages and their dependencies'
    {autoremove,arm}':Remove dependencies that are no longer needed'
    'clean:Remove old packages from cache'
    {upgrade,up}':Sync databases and upgrade installed packages'
    {search,se}':Search package names and descriptions'
    {info,if}':Show package information'
    'files:Show package file list'
    'owner:Query packages that own the files'
    'mark:Mark packages as explicitly installed'
    {list,ls}':List installed packages'
  )

  _describe -t commands 'command' commands "$@"
}

_pac_options=(
  '(- *)'{-h,--help}'[Print help information]'
  '(- *)'{-V,--version}'[Print version information]'
  '(- *)'{-s,--status}'[Print what pac is wrapping]'
)

_pac_common_options=(
  '(- *)'{-h,--help}'[Print help information]'
)

_pac_install_options=(
  '(--asexplicit)--asdeps[Install packages as dependencies]'
  '(--asdeps)--asexplicit[Install packages as explicitly installed]'
  '--needed[Do not reinstall up-to-date packages]'
  '--noconfirm[Do not ask for confirmation]'
  '*--overwrite[Overwrite conflicting files]: :_files'
  '*: :_pac_all_packages_and_groups'
)

_pac_upgrade_options=(
  '*--ignore[Ignore a package upgrade]: :_pac_installed_packages'
  '*--ignoregroup[Ignore a group upgrade]: :_pac_installed_groups'
  '--noconfirm[Do not ask for confirmation]'
  '*--overwrite[Overwrite conflicting files]: :_files'
  '*:'
)

_pac_remove_options=(
  '(-c --cascade -u --unneeded)'{-c,--cascade}'[Remove also dependent packages]'
  '(-c --cascade -u --unneeded)'{-u,--unneeded}'[Remove only non-dependent packages]'
  '(-n --nosave)'{-n,--nosave}'[Remove also configuration files]'
  '--noconfirm[Do not ask for confirmation]'
  '*: :_pac_installed_packages_and_groups'
)

_pac_autoremove_options=(
  '(-n --nosave)'{-n,--nosave}'[Remove also configuration files]'
  '--noconfirm[Do not ask for confirmation]'
  '*: :_pac_orphan_packages'
)

_pac_clean_options=(
  '(-a --all)'{-a,--all}'[Remove all packages from cache]'
  '--noconfirm[Do not ask for confirmation]'
  '*:'
)

_pac_search_options=(
  '(-i --installed)'{-i,--installed}'[Search only installed packages]'
  '*:search keyword'
)

_pac_info_options=(
  '*: :_pac_all_packages_and_groups'
)

_pac_owner_options=(
  '*: :_files'
)

_pac_files_options=(
  '*: :_pac_all_packages'
)

_pac_mark_options=(
  '(-d --asdeps)'{-d,--asdeps}'[Mark packages as dependencies]'
  '*: :_pac_installed_packages'
)

_pac_list_options=(
  '(-d --deps -e --explicit)'{-d,--deps}'[List packages installed as dependencies]'
  '(-d --deps -e --explicit)'{-e,--explicit}'[List packages explicitly installed]'
  '(-f --foreign -n --native)'{-f,--foreign}'[List installed packages not found in sync db(s)]'
  '(-f --foreign -n --native)'{-n,--native}'[List installed packages found in sync db(s)]'
  '*: :_pac_installed_packages'
)

(( $+functions[_pac_all_packages] )) ||
_pac_all_packages() {
  local -a packages
  packages=($(pac -Slq))
  typeset -U packages
  _describe -t packages 'package' packages "$@"
}

(( $+functions[_pac_all_groups] )) ||
_pac_all_groups() {
  local -a groups
  groups=($(pac -Sg))
  typeset -U groups
  _describe -t groups 'group' groups "$@"
}

(( $+functions[_pac_all_packages_and_groups] )) ||
_pac_all_packages_and_groups() {
  _alternative \
    'packages: :_pac_all_packages' \
    'groups: :_pac_all_groups'
}

(( $+functions[_pac_installed_packages] )) ||
_pac_installed_packages() {
  local -a packages
  packages=($(pac -Qq))
  typeset -U packages
  _describe -t packages 'installed package' packages "$@"
}

(( $+functions[_pac_installed_groups] )) ||
_pac_installed_groups() {
  local -a groups
  groups=($(pac -Qg | cut -d ' ' -f 1 | uniq))
  typeset -U groups
  _describe -t groups 'installed group' groups "$@"
}

(( $+functions[_pac_installed_packages_and_groups] )) ||
_pac_installed_packages_and_groups() {
  _alternative \
    'packages: :_pac_installed_packages' \
    'groups: :_pac_installed_groups'
}

(( $+functions[_pac_orphan_packages] )) ||
_pac_orphan_packages() {
  local -a packages
  packages=($(pac -Qdtq))
  typeset -U packages
  _describe -t packages 'orphan package' packages "$@"
}

_pac "$@"
