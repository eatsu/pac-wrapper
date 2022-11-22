install:
	@install -Dm755 "pac" "$(DESTDIR)/usr/bin/pac"
	@install -Dm644 "completion.bash" "$(DESTDIR)/usr/share/bash-completion/completions/pac"
	@install -Dm644 "completion.zsh" "$(DESTDIR)/usr/share/zsh/site-functions/_pac"

uninstall:
	@rm "$(DESTDIR)/usr/bin/pac"
	@rm "$(DESTDIR)/usr/share/bash-completion/completions/pac"
	@rm "$(DESTDIR)/usr/share/zsh/site-functions/_pac"
