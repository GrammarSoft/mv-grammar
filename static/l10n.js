/*!
 * Copyright 2016-2020 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 *
 * This project is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This project is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this project.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var session = {locale: 'da'};
var l10n = {};

l10n.s = {
	da: {
		TITLE_INDEX: 'Grammateket',
		ALT_GRAMMAR_LOGO: 'Grammateket\'s logo',
		TXT_INDEX_WHATIS: 'Grammateket er en tilføjelse til Microsoft Word og Google Docs, som støtter dig i din\nskriveproces ved at tjekke din tekst for stavning, grammatik og kommatering.',
		ALT_LINK_GAS: 'Link til Grammateket\'s Google Docs udvidelse',
		LBL_LINK_GAS: 'Installer Grammateket som udvidelse til Google Docs &raquo;',
		ALT_LINK_GDOCS: 'Link til Google Docs',
		LBL_LINK_GDOCS: 'Gå direkte til Google Docs for at åbne Grammateket &raquo;',
		ALT_LINK_MSO: 'Link til Grammateket\'s Microsoft Word udvidelse',
		LBL_LINK_MSO: 'Installer Grammateket som udvidelse til Microsoft Word &raquo;',
		TXT_PITCH_MVNORDIC: '<span>Kontakt Vitec MV</span> for at prøve programmet gratis eller for information om abonnement.\n(<em>gælder skoler, institutioner og virksomheder</em>)',
		TXT_PITCH_GRAMMARSOFT: 'For privatlicenser, kontakt GrammarSoft på <span>retmig.dk</span>',
		ALT_LINK_MVNORDIC: 'Link til Vitec MV',
		TITLE_LOGIN_ERROR: 'Grammateket Login Error',
		HREF_MV_PRIVACY: 'https://vitec-mv.com/dk/privatlivspolitik',
		LBL_PRIVACY: 'Privatlivspolitik',
		LBL_COPYRIGHT: '© 2017-2020 GrammarSoft ApS',
		LBL_DISTRIBUTED: 'Distribueret af Vitec MV',
		TITLE_LOGIN: 'Grammateket Login',
		TXT_LOGIN_SUCCESS: 'Du er nu logget ind og kan lukke dette vindue.',
		ERR_LOGIN_NOACCESS: 'Din brugerkonto har ikke adgang til Grammateket - kontakt https://vitec-mv.com/',
	},
	nb: {
		TITLE_INDEX: 'Grammateket',
		ALT_GRAMMAR_LOGO: 'Grammatektes logo',
		TXT_INDEX_WHATIS: 'Grammateket er en utvidelse til Microsoft Word og Google Docs som støtter deg i\nskriveeprosessen ved å sjekke staving i teksten din.',
		ALT_LINK_GAS: 'Link til Grammatekets Google Docs utvidelse',
		LBL_LINK_GAS: 'Installer Grammateket som en utvidelse til Google Docs &raquo;',
		ALT_LINK_GDOCS: 'Link til Google Docs',
		LBL_LINK_GDOCS: 'Gå direkte til Google Docs for å åpne Grammateket &raquo;',
		ALT_LINK_MSO: 'Link til Grammatekets Microsoft Word utvidelse',
		LBL_LINK_MSO: 'Installer Grammateket som en utvidelse til Microsoft Word &raquo;',
		TXT_PITCH_MVNORDIC: '<span>Kontakt Vitec MV</span> for å få informasjon om abonnement.',
		TXT_PITCH_GRAMMARSOFT: '',
		ALT_LINK_MVNORDIC: 'Link til Vitec MV',
		TITLE_LOGIN_ERROR: 'Grammateket Login feil',
		HREF_MV_PRIVACY: 'https://vitec-mv.com/no/personvern',
		LBL_PRIVACY: 'Personvern',
		LBL_COPYRIGHT: '2018-2020 Vitec MV',
		LBL_DISTRIBUTED: '',
		TITLE_LOGIN: 'Grammateket Login',
		TXT_LOGIN_SUCCESS: 'Du er nå logget inn og kan lukke dette vinduet.',
		ERR_LOGIN_NOACCESS: 'Din brukerkonto har ikke adgang til Grammateket - kontakt https://vitec-mv.com/',
	},
	sv: {
		TITLE_INDEX: 'Grammateket',
		ALT_GRAMMAR_LOGO: 'Grammatekets logo',
		TXT_INDEX_WHATIS: 'Grammateket är ett tillägg till Microsoft Word och Google Docs som hjälper dig med att skriva\ngenom att kontrollera din text för stavning och några frekventa grammatiska fel.',
		ALT_LINK_GAS: 'Länk till Grammatekets tillägg till Google Docs',
		LBL_LINK_GAS: 'Installera Grammateket som tillägg till Google Docs &raquo;',
		ALT_LINK_GDOCS: 'Länk till Google Docs',
		LBL_LINK_GDOCS: 'Gå direkt till Google Docs för att öppna Grammateket &raquo;',
		ALT_LINK_MSO: 'Länk till Grammatekets tillägg till Microsoft Word',
		LBL_LINK_MSO: 'Installera Grammateket som tillägg till Microsoft Word &raquo;',
		TXT_PITCH_MVNORDIC: '<span>Kontakta Vitec MV</span> för att testa programmet kostnadsfritt eller för information om en prenumeration.',
		TXT_PITCH_GRAMMARSOFT: '',
		ALT_LINK_MVNORDIC: 'Länk till Vitec MV',
		TITLE_LOGIN_ERROR: 'Grammateket Login Error',
		HREF_MV_PRIVACY: 'https://vitec-mv.com/se/om-os/#integritetspolicy',
		LBL_PRIVACY: 'Integritetspolicy',
		LBL_COPYRIGHT: '2018-2020 Vitec MV',
		LBL_DISTRIBUTED: '',
		TITLE_LOGIN: 'Grammateket Login',
		TXT_LOGIN_SUCCESS: 'Du är nu inloggad och kan stänga detta fönster.',
		ERR_LOGIN_NOACCESS: 'Ditt användarkonto har inte tillgång till Grammateket - kontakta https://vitec-mv.com/',
	},
};

l10n.s.no = l10n.s.nb;
l10n.s.nn = l10n.s.nb;

l10n.t = function(s) {
	s = '' + s; // Coerce to string

	// Special case for the version triad
	if (s === 'VERSION') {
		return VERSION;
	}

	var l = session.locale;
	var t = '';

	if (!l10n.s.hasOwnProperty(l)) {
		l = 'da';
	}

	// If the string doesn't exist in the locale, fall back
	if (!l10n.s[l].hasOwnProperty(s)) {
		// Try English
		if (l10n.s.en.hasOwnProperty(s)) {
			t = l10n.s.en[s];
		}
		// ...then Danish
		else if (l10n.s.da.hasOwnProperty(s)) {
			t = l10n.s.da[s];
		}
		// ...give up and return as-is
		else {
			t = s;
		}
	}
	else {
		t = l10n.s[l][s];
	}

	var rx = /\{([A-Z0-9_]+)\}/;
	var m = null;
	while ((m = rx.exec(t)) !== null) {
		var nt = l10n.t(m[1]);
		t = t.replace(m[0], nt);
	}

	return t;
};

function l10n_detectLanguage() {
	var l = navigator.language;
	if (!l10n.s.hasOwnProperty(l)) {
		l = l.replace(/^([^-_]+).*$/, '$1');
	}
	if (!l10n.s.hasOwnProperty(l)) {
		l = 'da';
	}
	return l;
}

function l10n_world() {
	$('[data-l10n]').each(function() {
		var e = $(this);
		var k = e.attr('data-l10n');
		var v = l10n.t(k);
		if (/^TXT_/.test(k)) {
			v = v.replace(/\n/g, '<br>');
		}
		e.html(v);
	});
	$('[data-l10n-alt]').each(function() {
		var e = $(this);
		var k = e.attr('data-l10n-alt');
		var v = l10n.t(k);
		e.attr('alt', v);
	});
	$('[data-l10n-href]').each(function() {
		var e = $(this);
		var k = e.attr('data-l10n-href');
		var v = l10n.t(k);
		e.attr('href', v);
	});
}

$(function() {
	session.locale = l10n_detectLanguage();
	l10n_world();
});
