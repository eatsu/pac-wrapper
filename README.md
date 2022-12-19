# Pac

[![AUR package](https://img.shields.io/badge/AUR-pac--wrapper-blue?logo=archlinux)](https://aur.archlinux.org/packages/pac-wrapper)

Pac is a pacman wrapper that provides intuitive syntax similar to
`dnf`, `apt`, `zypper`, etc.

With `pac` you don't need to memorize the non-intuitive options like
`-Rs`, `-Si`, `-Ss`; you can just type `remove`, `info`, `search`,
respectively.

Pac also supports <kbd>Tab</kbd> completion for Bash and Zsh.

> **Note**: Pac itself is not an AUR helper, though it can wrap an AUR helper
> that supports pacman's options. See [Configuration](#configuration).

## Installation

The `pac-wrapper` package is available
[in AUR](https://aur.archlinux.org/packages/pac-wrapper).

To install from source, run `make install`.

## Examples

Command | Description
:-- | :--
`pac` | Upgrade installed packages.
`pac in foo` <br> `pac install foo` | Install package `foo` and its dependencies.
`pac rm foo` <br> `pac remove foo` | Remove package `foo` and its dependencies.
`pac if foo` <br> `pac info foo` | Show information about package or group `foo`.
`pac se foo` <br> `pac search foo` | Search package names and descriptions with keyword `foo`.
`pac mark -d foo` <br> `pac mark --asdeps foo` | Mark package `foo` as dependencies.
`pac arm` <br> `pac autoremove` | Remove dependencies that are no longer required by any installed package.
`pac ls -ef` <br> `pac list --explicit --foreign`| List explicitly installed foreign packages (e.g. AUR packages).

Run `pac --help` for more information.

## Configuration

By default, `pac` wraps `pacman`. To wrap another pacman-compatible program,
set the environment variable `PAC_PACMAN`.

For example, to wrap [`paru`](https://github.com/Morganamilo/paru) instead of
`pacman`, add

```sh
export PAC_PACMAN='paru'
```

to your `~/.bash_profile` (or `$ZDOTDIR/.zshenv` for Zsh) and reload your shell.

## License

MIT
