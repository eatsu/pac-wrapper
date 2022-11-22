#compdef pac

_pac() {
  typeset -A opt_args
  local context state line
  local curcontext="$curcontext"
  local ret=1

  _arguments -C \
    '(- *)'{-h,--help}'[Print help information]' \
    '(- *)'{-V,--version}'[Print version information]' \
    '(- *)'{-s,--status}'[Print what pac is wrapping]' \
    '1: :_pac_commands' \
    '*:: :->cmds' \
    && ret=0

  case "$state" in
    (cmds)
      case "${words[1]}" in
        (install|in)
          _arguments \
            '--asdeps[Install packages as dependencies]' \
            '--needed[Do not reinstall up to date packages]' \
            '--overwrite[Overwrite conflicting files]:file' \
            && ret=0
          ;;
        (search|se)
          _arguments \
            '(-i --installed)'{-i,--installed}'[Search only installed package names and descriptions]' \
            && ret=0
          ;;
        (owner)
          _arguments \
            '*: :_files' \
            && ret=0
          ;;
        (mark)
          _arguments \
            '(-d --asdeps)'{-d,--asdeps}'[Mark packages as dependencies]' \
            && ret=0
          ;;
        (list|ls)
          _arguments \
            '(-e --explicit)'{-e,--explicit}'[List packages explicitly installed]' \
            '(-d --deps)'{-d,--deps}'[List packages installed as dependencies]' \
            '(-n --native)'{-n,--native}'[List installed packages found in sync db(s)]' \
            '(-f --foreign)'{-f,--foreign}'[List installed packages not found in sync db(s)]' \
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
    'install:Install packages and their dependencies'
    'in:Install packages and their dependencies'
    'remove:Remove packages and their dependencies'
    'rm:Remove packages and their dependencies'
    'autoremove:Remove dependencies that are no longer needed (orphans)'
    'arm:Remove dependencies that are no longer needed (orphans)'
    'clean:Remove old packages from cache directory'
    'upgrade:Sync databases and upgrade installed packages'
    'up:Sync databases and upgrade installed packages'
    'search:Search package names and descriptions'
    'se:Search package names and descriptions'
    'info:Show package information'
    'if:Show package information'
    'files:Show package file list'
    'owner:Query packages that own the files'
    'mark:Mark packages as explicitly installed'
    'list:List installed packages'
    'ls:List installed packages'
  )

  _describe -t commands 'command' commands "$@"
}

_pac "$@"
