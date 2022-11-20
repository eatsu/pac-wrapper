# Maintainer: eatsu <mkrmdk@gmail.com>

pkgname='pac-wrapper'
pkgver='1.0.0'
pkgrel='1'
pkgdesc='A simple pacman wrapper that provides intuitive syntax similar to dnf, apt, zypper, etc.'
arch=('any')
url='https://github.com/eatsu/pac-wrapper'
license=('MIT')
depends=(
  'bash'
  'pacman'
  'sudo'
)
source=(
  'pac'
  'LICENSE'
  'README.md'
)
sha256sums=(
  'SKIP'
  'SKIP'
  'SKIP'
)

package() {
  cd "$srcdir"

  # binary
  install -vDm755 -t "$pkgdir/usr/bin" pac

  # completions
  # install -vDm644 completions/pac.bash "$pkgdir/usr/share/bash-completion/completions/$pkgname"
  # install -vDm644 completions/pac.zsh "$pkgdir/usr/share/zsh/site-functions/_$pkgname"

  # license
  install -vDm644 -t "$pkgdir/usr/share/licenses/$pkgname" LICENSE

  # doc
  install -vDm644 -t "$pkgdir/usr/share/doc/$pkgname" README.md
}
