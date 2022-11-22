install:
	@install -Dm755 "pac" "$(DESTDIR)/usr/bin/pac"

uninstall:
	@rm "$(DESTDIR)/usr/bin/pac"
