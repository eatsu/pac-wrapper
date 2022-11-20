# Pac

Pac is a simple pacman wrapper that provides intuitive syntax similar to
`dnf`, `apt`, `zypper`, etc.

With `pac` you don't need to memorize the non-intuitive options like
`-Rs`, `-Ss`, `-Si`; you can just type `remove`, `search`, `info`,
respectively.

> **Note**: Pac itself is not an AUR helper, though it can wrap an AUR helper
> that supports pacman's options. See [Configuration](#configuration).

## Installation

The `pac-wrapper` package is available
[in AUR](https://aur.archlinux.org/packages/pac-wrapper).

To install from source, run `makepkg -si`.

## Usage

- To upgrade installed packages, run `pac`.
- To install package `foo`, run `pac install foo` or `pac in foo`.
- To remove package `foo`, run `pac remove foo` or `pac rm foo`.
- To show information about package `foo` (whichever installed or not, or a
  package group or not), run `pac info foo` or `pac if foo`.
- To mark package `foo` as dependencies, run `pac mark --asdeps foo` or
  `pac mark -d foo`.
- To remove dependencies that are no longer required by any installed package,
  run `pac autoremove`.
- To list explicitly installed foreign packages (e.g. AUR packages), run
  `pac list --explicit --foreign` or `pac ls -e -f`.

Run `pac --help` for more information.

## Configuration

By default, `pac` wraps `pacman`. To wrap another pacman-compatible program,
set the environment variable `PAC_PACMAN`.

For example, to wrap `paru` instead of `pacman`, add

```sh
export PAC_PACMAN='paru'
```

to your `~/.bash_profile` (or `$ZDOTDIR/.zshenv` for Zsh) and reload your shell.

## TODO

- Support Tab completion for bash and zsh.

## License

MIT
