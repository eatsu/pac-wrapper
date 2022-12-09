_pac() {
  local cur prev words cword
  _init_completion || return

  if (( cword == 1 )) && [[ "$cur" == -* ]]; then
    COMPREPLY=($(compgen -W '-h --help -V --version -s --status' -- "$cur"))
    return
  elif (( cword == 1 )); then
    COMPREPLY=($(compgen -W 'in install rm remove arm autoremove clean
      up upgrade se search if info files owner mark ls list' -- "$cur"))
    return
  fi

  case "${words[1]}" in
    install|in)
      COMPREPLY=($(compgen -W '-h --help --asdeps --asexplicit --needed
        -y --yes --overwrite' -- "$cur"))
      return
      ;;
    remove|rm)
      COMPREPLY=($(compgen -W '-h --help -c --cascade -u --unneeded -n --nosave
        -y --yes' -- "$cur"))
      return
      ;;
    autoremove|arm)
      COMPREPLY=($(compgen -W '-h --help -n --nosave -y --yes' -- "$cur"))
      return
      ;;
    clean)
      COMPREPLY=($(compgen -W '-h --help -a --all -y --yes' -- "$cur"))
      return
      ;;
    upgrade|up)
      COMPREPLY=($(compgen -W '-h --help --ignore --ignoregroup -y --yes
        --overwrite' -- "$cur"))
      return
      ;;
    search|se)
      COMPREPLY=($(compgen -W '-h --help -i --installed' -- "$cur"))
      return
      ;;
    owner)
      COMPREPLY=($(compgen -W '-h --help' -- "$cur"))
      _filedir
      return
      ;;
    mark)
      COMPREPLY=($(compgen -W '-h --help -d --asdeps' -- "$cur"))
      return
      ;;
    list|ls)
      COMPREPLY=($(compgen -W '-h --help -e --explicit -d --deps -n --native
        -f --foreign' -- "$cur"))
      return
      ;;
    *)
      COMPREPLY=($(compgen -W '-h --help' -- "$cur"))
      return
      ;;
  esac
}

complete -F _pac pac
