FROM debian:stretch

LABEL vendor="GrammarSoft ApS" \
	maintainer="Tino Didriksen <mail@tinodidriksen.com>" \
	com.grammarsoft.product="Grammateket Frontend" \
	com.grammarsoft.codename="danproof-frontend"

ENV LANG=C.UTF-8 \
	LC_ALL=C.UTF-8 \
	DEBIAN_FRONTEND=noninteractive \
	DEBCONF_NONINTERACTIVE_SEEN=true

COPY ./ /var/www/html/

RUN apt-get update && \
	apt-get install -y --no-install-recommends \
		apache2 \
		libapache2-mod-php \
		php-json \
	&& \
	phpenmod json && \
	a2enmod php7.0 && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	rm -rf /var/www/html/.git && \
	ln -sf /dev/stderr /var/log/apache2/error.log && \
	ln -sf /dev/stdout /var/log/apache2/access.log

EXPOSE 80
CMD ["apachectl", "-D", "FOREGROUND"]
