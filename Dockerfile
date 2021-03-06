FROM amd64/ubuntu:focal

LABEL vendor="Vitec MV" \
	maintainer="Tino Didriksen <mail@tinodidriksen.com>" \
	com.grammarsoft.product="Grammateket Frontend" \
	com.grammarsoft.codename="grammar-frontend"

ENV LANG=C.UTF-8 \
	LC_ALL=C.UTF-8 \
	DEBIAN_FRONTEND=noninteractive \
	DEBCONF_NONINTERACTIVE_SEEN=true

RUN apt-get update && \
	apt-get install -qfy --no-install-recommends \
		apache2 \
		libapache2-mod-php \
		php-json \
		php-curl \
		ca-certificates \
	&& \
	phpenmod json && \
	phpenmod curl && \
	a2enmod env && \
	a2enmod php7.4 && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	rm -rf /var/www/html/.git && \
	ln -sf /dev/stderr /var/log/apache2/error.log && \
	ln -sf /dev/stdout /var/log/apache2/access.log
RUN echo "PassEnv DEBUG_KEY GRAMMAR_DA_HOST GRAMMAR_DA_PORT GRAMMAR_NB_HOST GRAMMAR_NB_PORT GRAMMAR_SV_HOST GRAMMAR_SV_PORT COMMA_URL MVID_SERVICE MVID_SECRET MVID_ACCESS_IDS CADUCEUS_URL CADUCEUS_SECRET GOOGLE_AID HMAC_SERVICE MV_SERVICES_HOST MV_SIGNON_HOST MV_SIGNON_API_HOST MV_IW_DICT_HOST MV_IW_ONLINE_HOST MV_TEST" > /etc/apache2/conf-enabled/passenv.conf

COPY ./ /var/www/html/

EXPOSE 80
CMD ["apachectl", "-D", "FOREGROUND"]
