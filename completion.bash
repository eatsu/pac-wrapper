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
      COMPREPLY=($(compgen -W '--asdeps --needed --overwrite' -- "$cur"))
      return
      ;;
    search|se)
      COMPREPLY=($(compgen -W '-i --installed' -- "$cur"))
      return
      ;;
    owner)
      _filedir
      return
      ;;
    mark)
      COMPREPLY=($(compgen -W '-d --asdeps' -- "$cur"))
      return
      ;;
    list|ls)
      COMPREPLY=($(compgen -W '-e --explicit -d --deps -n --native
      -f --foreign' -- "$cur"))
      return
      ;;
  esac
}

complete -F _pac pac