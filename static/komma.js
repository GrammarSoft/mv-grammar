/*!
 * jQuery scrollintoview() plugin and :scrollable selector filter
 * https://github.com/litera/jquery-scrollintoview
 *
 * Version 1.8 (14 Jul 2011)
 * Requires jQuery 1.4 or newer
 *
 * Copyright (c) 2011 Robert Koritnik
 * Licensed under the terms of the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */

'use strict';

(function ($) {
	let converter = {
		vertical: { x: false, y: true },
		horizontal: { x: true, y: false },
		both: { x: true, y: true },
		x: { x: true, y: false },
		y: { x: false, y: true }
	};

	let settings = {
		duration: "fast",
		direction: "both"
	};

	let rootrx = /^(?:html)$/i;

	// gets border dimensions
	let borders = function (domElement, styles) {
		styles = styles || (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(domElement, null) : domElement.currentStyle);
		let px = document.defaultView && document.defaultView.getComputedStyle ? true : false;
		let b = {
			top: (parseFloat(px ? styles.borderTopWidth : $.css(domElement, "borderTopWidth")) || 0),
			left: (parseFloat(px ? styles.borderLeftWidth : $.css(domElement, "borderLeftWidth")) || 0),
			bottom: (parseFloat(px ? styles.borderBottomWidth : $.css(domElement, "borderBottomWidth")) || 0),
			right: (parseFloat(px ? styles.borderRightWidth : $.css(domElement, "borderRightWidth")) || 0)
		};
		return {
			top: b.top,
			left: b.left,
			bottom: b.bottom,
			right: b.right,
			vertical: b.top + b.bottom,
			horizontal: b.left + b.right
		};
	};

	let dimensions = function ($element) {
		let win = $element.closest('html');
		let isRoot = rootrx.test($element[0].nodeName);
		return {
			border: isRoot ? { top: 0, left: 0, bottom: 0, right: 0} : borders($element[0]),
			scroll: {
				top: (isRoot ? win : $element).scrollTop(),
				left: (isRoot ? win : $element).scrollLeft()
			},
			scrollbar: {
				right: isRoot ? 0 : $element.innerWidth() - $element[0].clientWidth,
				bottom: isRoot ? 0 : $element.innerHeight() - $element[0].clientHeight
			},
			rect: (function () {
				let r = $element[0].getBoundingClientRect();
				return {
					top: isRoot ? 0 : r.top,
					left: isRoot ? 0 : r.left,
					bottom: isRoot ? $element[0].clientHeight : r.bottom,
					right: isRoot ? $element[0].clientWidth : r.right
				};
			})()
		};
	};

	$.fn.extend({
		scrollintoview: function (options) {
			/// <summary>Scrolls the first element in the set into view by scrolling its closest scrollable parent.</summary>
			/// <param name="options" type="Object">Additional options that can configure scrolling:
			///        duration (default: "fast") - jQuery animation speed (can be a duration string or number of milliseconds)
			///        direction (default: "both") - select possible scrollings ("vertical" or "y", "horizontal" or "x", "both")
			///        complete (default: none) - a function to call when scrolling completes (called in context of the DOM element being scrolled)
			/// </param>
			/// <return type="jQuery">Returns the same jQuery set that this function was run on.</return>

			options = $.extend({}, settings, options);
			options.direction = converter[typeof (options.direction) === "string" && options.direction.toLowerCase()] || converter.both;

			let dirStr = "";
			if (options.direction.x === true) dirStr = "horizontal";
			if (options.direction.y === true) dirStr = dirStr ? "both" : "vertical";

			let el = this.eq(0);
			let scroller = el.closest(":scrollable(" + dirStr + ")");

			// check if there's anything to scroll in the first place
			if (scroller.length > 0)
			{
				scroller = scroller.eq(0);

				let dim = {
					e: dimensions(el),
					s: dimensions(scroller)
				};

				let rel = {
					top: dim.e.rect.top - (dim.s.rect.top + dim.s.border.top),
					bottom: dim.s.rect.bottom - dim.s.border.bottom - dim.s.scrollbar.bottom - dim.e.rect.bottom,
					left: dim.e.rect.left - (dim.s.rect.left + dim.s.border.left),
					right: dim.s.rect.right - dim.s.border.right - dim.s.scrollbar.right - dim.e.rect.right
				};

				let animOptions = {};

				// vertical scroll
				if (options.direction.y === true)
				{
					if (rel.top < 0)
					{
						animOptions.scrollTop = dim.s.scroll.top + rel.top - 25;
					}
					else if (rel.top > 0 && rel.bottom < 0)
					{
						animOptions.scrollTop = dim.s.scroll.top + Math.min(rel.top, -rel.bottom) + 25;
					}
				}

				// horizontal scroll
				if (options.direction.x === true)
				{
					if (rel.left < 0)
					{
						animOptions.scrollLeft = dim.s.scroll.left + rel.left - 25;
					}
					else if (rel.left > 0 && rel.right < 0)
					{
						animOptions.scrollLeft = dim.s.scroll.left + Math.min(rel.left, -rel.right) + 25;
					}
				}

				// scroll if needed
				if (!$.isEmptyObject(animOptions))
				{
					if (rootrx.test(scroller[0].nodeName))
					{
						scroller = el.closest('html');
						scroller.add('body', scroller);
					}
					scroller
						.animate(animOptions, options.duration)
						.eq(0) // we want function to be called just once (ref. "html,body")
						.queue(function (next) {
							$.isFunction(options.complete) && options.complete.call(scroller[0]);
							next();
						});
				}
				else
				{
					// when there's nothing to scroll, just call the "complete" function
					$.isFunction(options.complete) && options.complete.call(scroller[0]);
				}
			}

			// return set back
			return this;
		}
	});

	let scrollValue = {
		auto: true,
		scroll: true,
		visible: false,
		hidden: false
	};

	$.extend($.expr[":"], {
		scrollable: function (element, index, meta, stack) {
			let direction = converter[typeof (meta[3]) === "string" && meta[3].toLowerCase()] || converter.both;
			let styles = (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(element, null) : element.currentStyle);
			let overflow = {
				x: scrollValue[styles.overflowX.toLowerCase()] || false,
				y: scrollValue[styles.overflowY.toLowerCase()] || false,
				isRoot: rootrx.test(element.nodeName)
			};

			// check if completely unscrollable (exclude HTML element because it's special)
			if (!overflow.x && !overflow.y && !overflow.isRoot)
			{
				return false;
			}

			let size = {
				height: {
					scroll: element.scrollHeight,
					client: element.clientHeight
				},
				width: {
					scroll: element.scrollWidth,
					client: element.clientWidth
				},
				// check overflow.x/y because iPad (and possibly other tablets) don't dislay scrollbars
				scrollableX: function () {
					return (overflow.x || overflow.isRoot) && this.width.scroll > this.width.client;
				},
				scrollableY: function () {
					return (overflow.y || overflow.isRoot) && this.height.scroll > this.height.client;
				}
			};
			return direction.y && size.scrollableY() || direction.x && size.scrollableX();
		}
	});
})(jQuery);
'use strict';

var types_red = {
	"@error": "@error",
	"@comp-": "@comp-",
	"@-comp": "@-comp",
	"@comp-:-": "@comp-:-",
	"@comp": "@comp",
	"@x-etype-apostrophe": "@x-etype-apostrophe",
	"@apostrophe": "@apostrophe",
	"@no-apostrophe": "@no-apostrophe",
	"@x-etype-hyphen": "@x-etype-hyphen",
	"@hyphen-prefix": "@hyphen-prefix",
	"@hyphen-suffix": "@hyphen-suffix",
	};

var types_yellow = {
	"@proper": "@proper",
	"@new": "@new",
	"@abbreviation": "@abbreviation",
	"@check!": "@check!",
	};

var types_only = {
	"@vfin": "@vfin",
	"@inf": "@inf",
	"@ene": "@ene",
	"@ende": "@ende",
	"@comp-": "@comp-",
	"@comp-:-": "@comp-:-",
	"@-comp": "@-comp",
	"@comp": "@comp",
	"@error": "@error",
	"@apostrophe": "@apostrophe",
	"@no-apostrophe": "@no-apostrophe",
	"@check": "@check",
	"@new": "@new",
	"@green": "@green",
	"@proper": "@proper",
	"@abbreviation": "@abbreviation",
	"@upper": "@upper",
	"@lower": "@lower",
	};

var ctypes = {
    "@x-etype-list": [
        "@x-etype-list",
        "Forkert skrevet ord",
        "Du har skrevet et ord forkert, måske fordi det engang blev stavet sådan.<br>\n<br>\nDet kan fx være, at du skrev <i>vanilie</i> i stedet for <i>vanilje</i>, som er den eneste rigtige stavemåde."
    ],
    "@x-etype-joined": [
        "@x-etype-joined",
        "Manglende mellemrum",
        "Du mangler et mellemrum mellem to ord, måske fordi du har lavet en slåfejl, så to ord er skrevet forkert sammen. Det kunne fx være <i>undret mig</i>, der er skrevet ud i et <i>undretmig,</i> men også samskrivning af præposition og styrelse som fx <i>i går</i> og <i>i dag</i>, der skal skrives hver for sig."
    ],
    "@x-etype-sær": [
        "@x-etype-sær",
        "Manglende sammenskrivning",
        "Du har undladt at skrive to ord sammen, som i denne sammenhæng skal være skrevet sammen. Grammatisk kan ordene stå hver for sig, men betydningen ændres, når de skrives sammen. Der er fx stor forskel på en <i>engelsk</i> <i>lærer</i> (som altså ikke er hverken dansker eller tysker) og en<i> engelsklærer</i>, som underviser i engelsk."
    ],
    "@x-etype-flex": [
        "@x-etype-flex",
        "Bøjningsfejl",
        "Du har brugt en forkert bøjning af ordet.<br>\n<br>\nDet kunne være <i>sandet</i>, hvor der skulle stå <i>sanden,</i> eller <i>huserne</i> i stedet for <i>husene.</i><br>\n<br>\nDet kan også være, hvis du har forvekslet flertalsendelserne <i>-erne</i> og <i>-ene,</i> eller datidsendelserne <i>-ede</i> og <i>-te</i>."
    ],
    "@x-etype-ellision": [
        "@x-etype-ellision",
        "Bøjningsfejl ved ord der ender i -el/-en/-er",
        "Du har skrevet et -<i>e</i>- for meget i ord, der ender på -<i>el,-en og -er</i>. Disse ord mister -e i sidste stavelse, når de bøjes. Det kan fx være <i>en cykel, flere cykler</i> (altså ikke cykeler), en <i>moden</i> mand → to <i>modne</i> mænd."
    ],
    "@x-etype-um": [
        "@x-etype-um",
        "Bøjningsfejl ved ord der ender i -um",
        "Du har brugt forkert bøjning af ord, der ender på -um.<br>\n<br>\nDet kunne fx være <i>gymnasium,</i> der bøjes <i>gymnasiet/gymnasier</i> (ikke <i>gymnasiummet/gymnasiummer</i>)."
    ],
    "@x-etype-gemination": [
        "@x-etype-gemination",
        "Bøjningsfejl ved bogstavsfordobling",
        "Du har bøjet ord ved at bruge dobbeltkonsonant, fx <i>en dal</i> <i>→</i><i> to daller,</i> hvor brugen af et -<i>l</i> bevarer en lang vokal. Eller du har undladt dobbeltvokal, når en kort vokal skal bevares, som fx <i>en hal → to haller.</i>"
    ],
    "@x-etype-hyphen": [
        "@x-etype-hyphen",
        "Overflødig eller manglende bindestreg inde i ordet",
        "Du har tilføjet en overflødig bindestreg inde i ord, som fx<i> binde-streg.</i><br>\n<br>\nEller du mangler en bindestreg, som fx <i>is- og slikfabrik</i> (fælles orddel), <i>1800-tallet</i> (tal + andet ord) og <i>wc-papir</i> (forkortelse + andet ord)."
    ],
    "@error": [
        "@error",
        "Stavefejl",
        "Du har lavet en almindelig stavefejl, som programmet har rettet.<br>\n<br>\nFx <i>intereseret → interesseret</i>"
    ],
    "@check!": [
        "@check!",
        "Muligt forkert ord uden ændringsforslag",
        "Du har skrevet et specielt ord, som kan være forkert.<br>\n<br>\nFx <i>døgntlf.-tid.</i>"
    ],
    "@:...": [
        "@:...",
        "Forslag til rettelse ud fra sammenhæng",
        "Du har skrevet ord med stavefejl eller forkert ordvalg.<br>\n<br>\nFx <i>esdragon</i> → <i>estragon, ud og se</i> → <i>ud at se</i>"
    ],
    "@comp-": [
        "@comp-",
        "Særskrivningsfejl – bør sammenskrives med næste ord",
        "Du har skrevet et ord, som skal skrives sammen, i to ord.<br>\n<br>\nFx <i>banegårds center</i> → <i>banegårdscenter</i>"
    ],
    "@comp-:-": [
        "@comp-:-",
        "Særskrivningsfejl – bør sammenskrives med næste ord, med bindestreg",
        "Du har skrevet et sammensat ord uden bindestreg, selvom der i denne sammensætning skal være en bindestreg.<br>\n<br>\nFx <i>FN resolution</i> → <i>FN-resolution</i>"
    ],
    "@-comp": [
        "@-comp",
        "Særskrivningsfejl – bør sammenskrives med forudgående ord",
        "Du har skrevet sammensat ord i to ord.<br>\n<br>\nFx <i>De havde spist for inden → De havde spist forinden</i>"
    ],
    "@comp": [
        "@comp",
        "Særskrivningsfejl – de to dele skal skrives sammen",
        "Du har skrevet et sammensat ord i to ord.<br>\n<br>\nFx <i>De havde spist for inden → De havde spist forinden</i>"
    ],
    "@new": [
        "@new",
        "Nyt ord, der sandsynligvis er ok",
        "Du har skrevet et ord, der ikke findes i ordbogen, men som ser ud til at være rigtigt. Kig på det en ekstra gang for at være sikker på, at du har skrevet det rigtigt<span style=\"color: #ff0000\">.</span>"
    ],
    "@green": [
        "@green",
        "Ord, der er forkert i sammenhængen",
        "Du har skrevet et korrekt ord, der dog i denne sammenhæng er forkert.<br>\n<br>\nFx <i>I her travlt → I har travlt</i>"
    ],
    "@proper": [
        "@proper",
        "Ukendt egennavn",
        "Dette ord er et egennavn og er sandsynligvis korrekt. Det findes bare ikke i programmets ordbog. Så du afgør selv, om det er korrekt stavet."
    ],
    "@abbreviation": [
        "@abbreviation",
        "Ukendt forkortelse",
        "Du har skrevet en forkortelse, som ikke er almindelig kendt. Kig på den igen for at være sikker på, at du har skrevet forkortelsen rigtigt.<br>\n<br>\nFx <i>se</i> <i>kap.</i><i> 5</i>"
    ],
    "@hyphen-prefix": [
        "@hyphen-prefix",
        "Manglende bindestreg efter forreste orddel i sideordning",
        "Du har undladt at skrive en bindestreg i en sideordning, hvor to ord deler en del af det sidste ord.<br>\n<br>\nFx <i>sommer og vintertøj → sommer- og vintertøj</i>"
    ],
    "@hyphen-suffix": [
        "@hyphen-suffix",
        "Manglende bindestreg før sidste orddel i sideordning",
        "Du har undladt at skrive en bindestreg i en sideordning, hvor to ord deler en del af det første ord.<br>\n<br>\nFx <i>papkrus og tallerkener → papkrus og -tallerkener</i>"
    ],
    "@apostrophe": [
        "@apostrophe",
        "Manglende apostrof",
        "Du har undladt at bruge apostrof i forbindelse med bøjning af forkortelser.<br>\n<br>\nFx <i>pc’en,</i> tal som <i>1960’erne</i><br>\n<br>\nEller du mangler apostrof til at markere genitiv efter s, z eller x.<br>\n<br>\nFx <i>Jens</i> → <i>Jens’</i><br>\n<br>\nHusk, at du på dansk ikke må bruge apostrof som genitiv-s. Altså nej til <i>Jensen’</i>. Det hedder <i>Jensens</i>."
    ],
    "@no-apostrophe": [
        "@no-apostrophe",
        "Overflødig apostrof",
        "Du har brugt apostrof forkert, som fx <i>Jensen’s</i>. Det hedder <i>Jensens.</i>"
    ],
    "@upper": [
        "@upper",
        "Første bogstav bør være med stort",
        "Du har begyndt din sætning med lille begyndelsesbogstav. Sætninger begynder altid med stort.<br>\n<br>\nFx <i>han er i alaska → Han er i Alaska</i>"
    ],
    "@lower": [
        "@lower",
        "Første bogstav bør være med småt",
        "Du har skrevet ord med stort begyndelsesbogstav, hvor første bogstav bør skrives med småt.<br>\n<br>\n<i>Fx Hun blev bidt af en Løve → Hun blev bidt af en løve</i>.<br>\n<br>\nMåske er det din mening, at ordet skal fremhæves ved at skrives med stort begyndelsesbogstav?"
    ],
    "@question": [
        "@question",
        "Manglende spørgsmålstegn",
        "Du har glemt at sætte spørgsmålstegn efter en spørgende sætning.<br>\n<br>\nFx <i>Hvad har du set. → Hvad har du set?</i>"
    ],
    "@neu": [
        "@neu",
        "Bøjningsfejl - intetkøn",
        "Du har skrevet en forkert bøjningsform af ordet. Ordet burde være bøjet i intetkøn i stedet for fælleskøn.<br>\n<br>\nFx <i>Den</i><i></i> <i>røde hus ved</i> <i>vanden</i><i> →</i><i></i> <i>Det</i><i> røde ved</i> <i>vandet</i>"
    ],
    "@neu-sc": [
        "@neu-sc",
        "Bøjningsfejl - intetkøn",
        "Du har skrevet en forkert bøjningsform af ordet. Ordet burde være bøjet i intetkøn i stedet for fælleskøn.<br>\n<br>\nFx <i>Huset er</i> <i>rød</i><i> → Huset er</i><i> rødt</i>"
    ],
    "@utr": [
        "@utr",
        "Bøjningsfejl - fælleskøn",
        "Du har skrevet en forkert bøjningsform af ordet. Ordet burde være bøjet i fælleskøn i stedet for intetkøn.<br>\n<br>\nFx <i>Det</i><i></i> <i>gamle hest i</i> <i>staldet</i><i> →</i> <i>Den</i><i></i> <i>gamle hest i</i> <i>stalden</i>"
    ],
    "@utr-sc": [
        "@utr-sc",
        "Bøjningsfejl – fælleskøn",
        "Du har skrevet en forkert bøjningsform af ordet. Ordet burde være bøjet i fælleskøn i stedet for intetkøn.<br>\n<br>\nFx <i>Hesten er</i> <i>gammelt</i><i> → Hesten er</i> <i>gammel</i>"
    ],
    "@pl": [
        "@pl",
        "Bøjningsfejl – ental/flertal",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt ental i stedet for flertal.<br>\n<br>\nFx <i>mange</i> <i>hest</i><i> →</i><i> mange</i> <i>heste</i>"
    ],
    "@pl-sc": [
        "@pl-sc",
        "Bøjningsfejl – ental/flertal",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt flertal i stedet for ental.<br>\n<br>\nFx <i>hestene er</i> <i>gammel</i><i> →</i><i> hestene er</i> <i>gamle</i>"
    ],
    "@sg": [
        "@sg",
        "Bøjningsfejl – ental/flertal",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt flertal i stedet for ental.<br>\n<br>\nFx <i>en ung</i> <i>lærere</i><i> →</i><i> en ung</i> <i>lærer</i>"
    ],
    "@sg-sc": [
        "@sg-sc",
        "Bøjningsfejl – ental/flertal",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt flertal i stedet for ental.<br>\n<br>\nFx <i>huset er</i> <i>store</i><i> → huset er</i> <i>stort</i>"
    ],
    "@idf": [
        "@idf",
        "Bøjningsfejl – bestemt/ubestemt",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt ubestemt form i stedet for bestemt form.<br>\n<br>\nFx <i>et</i> <i>røde</i><i> æble → et</i><i></i> <i>rødt</i><i> æble</i>"
    ],
    "@idf-sc": [
        "@idf-sc",
        "Bøjningsfejl – bestemt/ubestemt",
        "Du har skrevet en forkert bøjningsform af ordet. Du har Du har brugt ubestemt form i stedet for bestemt form.<br>\n<br>\nFx <i>huset er</i> <i>gamle</i><i> → huset er</i> <i>gammelt</i>"
    ],
    "@idf-pl": [
        "@idf-pl",
        "Bøjningsfejl – bestemt/ubestemt",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt bestemt form i stedet for ubestemt form.<br>\n<br>\nFx <i>mange</i> <i>helten</i><i></i> <i>i film → mange</i> <i>helte</i><i> i film</i>"
    ],
    "@def": [
        "@def",
        "Bøjningsfejl – bestemt/ubestemt",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt ubestemt form i stedet for bestemt form.<br>\n<br>\nFx <i>hele</i> <i>skole</i><i> → hele</i> <i>skolen</i>"
    ],
    "@vfin": [
        "@vfin",
        "Bøjningsfejl – navneform/nutidsform",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt navneform (uden -r) i stedet for nutidsform ( med -r).<br>\n<br>\nFx <i>han</i> <i>høre</i><i> aldrig efter → han</i> <i>hører</i><i> aldrig efter</i>"
    ],
    "@inf": [
        "@inf",
        "Bøjningsfejl – navneform/nutidsform",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt nutidsform (med -r) i stedet for navneform (uden -r).<br>\n<br>\nFx <i>Han begyndte at</i> <i>hører</i><i></i> <i>efter → Han begyndte at</i> <i>høre</i><i></i> <i>efter</i>"
    ],
    "@impf": [
        "@impf",
        "Bøjningsfejl - datidsform",
        "Du har skrevet en forkert bøjningsform af ordet. Du har brugt en forkert datidsform.<br>\n<br>\nFx <i>vi sad og</i> <i>snakket</i><i> →</i><i> vi sad og</i> <i>snakkede</i>"
    ],
    "@pcp2-akt": [
        "@pcp2-akt",
        "Bøjningsfejl - tillægsform",
        "Du har skrevet en forkert bøjningsform af ordet. Måske har du glemt et –t.<br>\n<br>\nFx <i>Han har også</i> <i>spille</i><i> på holdet. → Han har også</i> <i>spillet</i><i></i> <i>på holdet.</i>"
    ],
    "@pas": [
        "@pas",
        "Bøjningsfejl – passiv",
        "Du har skrevet en forkert bøjningsform af ordet. Verbet skal være i passiv.<br>\n<br>\nFx <i>Hammeren</i> <i>bruger</i><i> til mange ting → Hammeren</i> <i>bruges</i><i> til mange ting</i>"
    ],
    "@ene": [
        "@ene",
        "Forveksling af -ene/-ende",
        "Du har forvekslet to ord, der lyder ens, men som betyder noget meget forskelligt.<br>\n<br>\nFx <i>Husende</i><i> var smukke →</i> <i>Husene</i><i> var smukke</i><br>\n<br>\n’Husene’ er den mest almindelige bestemte flertalsform for navneord, mens ’Husende’ er en tillægsform, der udtrykker processer og egenskaber."
    ],
    "@ende": [
        "@ende",
        "Forveksling af -ene/-ende",
        "Du har forvekslet to ord, der lyder ens, men som betyder noget meget forskelligt.<br>\n<br>\nFx <i>Han kom</i> <i>løbene</i><i></i> <i>ned ad gaden. → Han kom</i> <i>løbende</i><i> ned ad gaden.</i><br>\n<br>\n’løbene’ er den mest almindelige bestemte flertalsform for navneord, mens ’løbende’ er en tillægsform, der udtrykker processer og egenskaber."
    ],
    "@nom": [
        "@nom",
        "Bøjningsfejl – stedord og kasus",
        "Du har brugt et stedord med forkert kasus (fald).<br>\n<br>\nFx <i>Dem</i><i></i> <i>kommer i morgen →</i> <i>De</i><i> kommer i morgen</i>"
    ],
    "@acc": [
        "@acc",
        "Bøjningsfejl – stedord og kasus",
        "Du har brugt et stedord med forkert kasus (fald).<br>\n<br>\nFx <i>Jeg har talt med</i> <i>hun</i><i> →</i><i> Jeg har talt med</i> <i>hende</i>"
    ],
    "@gen": [
        "@gen",
        "Manglende markering af ejefald.",
        "Du har glemt at markere ejefald (genitiv) med et -s.<br>\n<br>\nFx <i>bogen</i><i> titel →</i> <i>bogens</i><i> titel</i>"
    ],
    "@adv": [
        "@adv",
        "Manglende -t i biord",
        "Du har undladt et -t i biord<i>.</i><br>\n<br>\nFx <i>han er</i> <i>enorm</i><i> træt → han er</i> <i>enorm</i><i>t træt</i>"
    ],
    "@nil": [
        "@nil",
        "Overflødigt ord",
        "Du har anvendt et overflødigt ord.<br>\n<br>\nFx <i>Han gad ikke</i> <i>at</i><i> lege. → Han gad ikke lege.</i>"
    ],
    "@insert": [
        "@insert",
        "Manglende ord",
        "Du mangler at skrive et ord. Indsæt selv det manglende ord.<br>\n<br>\nFx <i>Han begyndte råbe. → Han begyndte</i> <i>at</i><i></i> <i>råbe.</i>"
    ],
    "@sentsplit": [
        "@sentsplit",
        "Manglende punktum eller andet tegn",
        "Du mangler at sætte punktum eller evt. komma.<br>\n<br>\nFx <i>Han kommer ikke han er syg. → Han kommer ikke</i><i>. Han</i><i> er syg</i>."
    ]
};
/*!
 * Copyright 2016-2020 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';

// TinyMCE Placeholder plugin from https://github.com/mohan999/tinymce-placeholder
// Licensed under MIT 2-clause
if (tinymce)
tinymce.PluginManager.add('placeholder', function(editor) {
	editor.on('init', function() {
		let label = new Label;

		onBlur();

		tinymce.DOM.bind(label.el, 'click', onFocus);
		editor.on('focus', onFocus);
		editor.on('blur', onBlur);
		editor.on('change', onBlur);

		function onFocus() {
			label.hide();
			tinyMCE.execCommand('mceFocus', false, editor);
		}

		function onBlur() {
			if (editor.getContent() == '') {
				label.show();
			}
			else {
				label.hide();
			}
		}
	});

	let Label = function() {
		// Create label el
		this.text = editor.getElement().getAttribute("placeholder");
		this.contentAreaContainer = editor.getContentAreaContainer();

		tinymce.DOM.setStyle(this.contentAreaContainer, 'position', 'relative');

		let attrs = {id: 'placeholder', style: {position: 'absolute', top:'10px', left:'10px', color: '#777', padding: '1%', width:'98%', overflow: 'hidden', 'text-align': 'center', 'font-size': '200%'} };
		this.el = tinymce.DOM.add(this.contentAreaContainer, 'label', attrs, this.text);
	}

	Label.prototype.hide = function() {
		tinymce.DOM.setStyle(this.el, 'display', 'none');
	}

	Label.prototype.show = function() {
		tinymce.DOM.setStyle(this.el, 'display', '');
	}
});
// End of TinyMCE Placeholder plugin

function select_text(element) {
	element.focus();

	if (document.body.createTextRange) {
		let body = element.offsetParent;
		while (body.offsetParent) {
			body = body.offsetParent;
		}
		let range = body.createTextRange();
		range.moveToElementText(element);
		range.select();
	}
	else if (window.getSelection) {
		let doc = element.ownerDocument;
		let win = doc.defaultView;
		let selection = win.getSelection();
		let range = doc.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}
}

jQuery.fn.selectText = function() {
	select_text(this[0]);
	return this;
};

Array.prototype.unique = function() {
	let unique = [];
	for (let i=0; i<this.length; ++i) {
		if (unique.indexOf(this[i]) == -1) {
			unique.push(this[i]);
		}
	}
	return unique;
};

let Defs = {
	CAP_ADMIN:    (1 <<  0),
	CAP_COMMA:    (1 <<  1),
	CAP_DANPROOF: (1 <<  2),
	CAP_AKUTUTOR: (1 <<  3),
	CAP_COMMA_TRIAL:     (1 <<  4),
	CAP_DANPROOF_TRIAL:  (1 <<  5),
	CAP_AKUTUTOR_TRIAL:  (1 <<  6),
	CAP_COMMA_ENG:       (1 <<  7),
	CAP_COMMA_ENG_TRIAL: (1 <<  8),
	OPT_COMMA_LEVEL_1:	   (1 <<  0),
	OPT_COMMA_LEVEL_2:	   (1 <<  1),
	OPT_COMMA_LEVEL_3:	   (1 <<  2),
	OPT_COMMA_GREEN:	   (1 <<  3),
	OPT_COMMA_MAYBE:	   (1 <<  4),
	OPT_COMMA_COLOR:	   (1 <<  5),
	OPT_DP_ONLY_CONFIDENT: (1 <<  0),
	OPT_DP_IGNORE_NAMES:   (1 <<  1),
	OPT_DP_IGNORE_COMP:	   (1 <<  2),
	OPT_DP_IGNORE_ABBR:	   (1 <<  3),
	OPT_DP_IGNORE_OTHER:   (1 <<  4),
	OPT_DP_IGNORE_MAJ:	   (1 <<  5),
	OPT_DP_COLOR:		   (1 <<  6),
	OPT_DP_USE_DICT:	   (1 <<  7),
	MAX_SESSIONS: 5,
	MAX_RQ_SIZE: 4096,
	'comma-commercial': 'Kommaforslag Erhverv',
	'comma-private': 'Kommaforslag Privat',
	'comma-student': 'Kommaforslag Studerende',
	'danproof-commercial': 'RetMig Erhverv',
	'danproof-private': 'RetMig Privat',
	'danproof-student': 'RetMig Studerende',
	'akututor-clinic': 'Akututor Klinik',
	'akututor-student': 'Akututor Studerende',
	};
Defs.OPT_DP_IGNORE_UNKNOWN = Defs.OPT_DP_IGNORE_NAMES|Defs.OPT_DP_IGNORE_COMP|Defs.OPT_DP_IGNORE_ABBR|Defs.OPT_DP_IGNORE_OTHER;

let last_result = '';
let to_send = [];
let to_send_i = 0;
let ts_xhr = null;
let ts_slow = null;
let ts_fail = 0;
let eht_timer = null;
let eht_prevent = false;
let cookie_hmac = null;
// Upper-case because we compare them to DOM nodeName
let text_nodes = ['ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'CANVAS', 'DD', 'DIV', 'DL', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HGROUP', 'HR', 'LI', 'MAIN', 'NAV', 'NOSCRIPT', 'OL', 'OUTPUT', 'P', 'PRE', 'SECTION', 'TABLE', 'TD', 'TH', 'UL', 'VIDEO'];
let tnjq = null;
// While inline, skip these: BR,IMG,MAP,OBJECT,SCRIPT,BUTTON,INPUT,SELECT,TEXTAREA
let inline_nodes = ['B', 'BIG', 'I', 'SMALL', 'TT', 'ABBR', 'ACRONYM', 'CITE', 'CODE', 'DFN', 'EM', 'KBD', 'STRONG', 'SAMP', 'TIME', 'VAR', 'A', 'BDO', 'Q', 'SPAN', 'SUB', 'SUP', 'LABEL'];
let itjq = inline_nodes.join(',');
let ccomma = null;
let android = false;
let iOS = false;

function ga_log(cat, act, lbl) {
	if (!ga || typeof ga === 'undefined') {
		return;
	}
	ga('send', 'event', cat, act, lbl);
}

function send_post(url, data) {
	if (typeof data === 'undefined' || !data) {
		data = {};
	}
	return $.ajax({
		url: url,
		type: 'POST',
		dataType: 'json',
		headers: {HMAC: cookie_hmac['sess_id']},
		data: data,
	});
}

function log_click(data) {
	$.post('./callback.php?a=click', {'data': JSON.stringify(data)});
}

function log_error(data) {
	$.post('./callback.php?a=error', {'data': JSON.stringify(data)});
}

function log_warning(data) {
	$.post('./callback.php?a=warning', {'data': JSON.stringify(data)});
}

function is_upper(ch) {
	return (ch === ch.toUpperCase() && ch !== ch.toLowerCase());
}

function uc_first(str) {
	return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function escHTML(t) {
	let nt = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
	return nt;
}

function decHTML(t) {
	let nt = t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
	return nt;
}

function sortByLocale(a, b) {
   return a.toUpperCase().localeCompare(b.toUpperCase());
}

function haveLocalStorage() {
	try {
		let storage = window.localStorage;
		let x = 'LocalStorageTest';
		storage.setItem(x, x);
		storage.removeItem(x);
	}
	catch(e) {
		return false;
	}
	return true;
}

function skipNonText(ml, i) {
	let did = true;
	while (did) {
		did = false;
		while (/^\s$/.test(ml.charAt(i))) {
			++i;
		}

		// Skip tags
		while (i<ml.length && ml.charAt(i) === '<') {
			while (i<ml.length && ml.charAt(i) !== '>') {
				// Skip attribute values
				while (i<ml.length && ml.charAt(i) === '"') {
					++i;
					while (i<ml.length && ml.charAt(i) !== '"') {
						++i;
					}
					++i;
				}
				while (i<ml.length && ml.charAt(i) === "'") {
					++i;
					while (i<ml.length && ml.charAt(i) !== "'") {
						++i;
					}
					++i;
				}
				if (i<ml.length && ml.charAt(i) !== '>') {
					++i;
				}
			}
			did = true;
			++i;
		}

		// Skip entities
		// ToDo: Test other entities, if any
		while (i<ml.length && ml.charAt(i) === '&') {
			while (i<ml.length && ml.charAt(i) !== ';') {
				++i;
			}
			did = true;
			++i;
		}

		while (/^\s$/.test(ml.charAt(i))) {
			++i;
		}
	}
	return i;
}

function check_slow() {
	$('#working').find('span').text('arbejder stadig, vent lidt');
	ts_slow = setTimeout(check_slow_2, 5000);
}

function check_slow_2() {
	$('#working').find('span').text('er du sikker på at du har forbindelse?');
	ts_slow = setTimeout(check_slow_3, 5000);
}

function check_slow_3() {
	$('#working').find('span').text('opgiver om 5 sekunder');
	ts_slow = setTimeout(check_slow_4, 5000);
}

function check_slow_4() {
	last_result = '';
	to_send = [];
	to_send_i = 0;
	ccomma = null;
	ts_slow = null;
	checkDone();
	if (ts_xhr) {
		ts_xhr.abort();
	}
	ts_xhr = null;
}

function cleanEditorContent() {
	let wl = {
		'A': /^(href)$/i,
		'IMG': /^(src|width|height|hspace|vspace)$/i
	};

	let editor = $(tinyMCE.activeEditor.getBody());
	editor.find('*').removeClass().each(function() {
		let attrs = this.attributes;
		let i = attrs.length;
		while (i--) {
			if (wl.hasOwnProperty(this.nodeName) && wl[this.nodeName].test(attrs[i].name)) {
				continue;
			}
			this.removeAttributeNode(attrs[i]);
		}
	});

	let html = editor.html();
	html = html.replace(/<\/?span>/ig, '');
	html = html.replace(/<a><\/a>/ig, '');
	html = html.replace(/&nbsp;/ig, '\u00A0');
	for (let i=0; i<inline_nodes.length ; ++i) {
		let n = inline_nodes[i];
		if (n === 'A') {
			continue;
		}
		html = html.replace(new RegExp('</'+n+'>([\u00A0 \t]*)<'+n+'>', 'ig'), '$1');
	}
	editor.html(html);
}

function prepEditorContent(editor) {
	editor.find('[class*="mce-"]').each(function() {
		if ($.trim($(this).text()).length === 0) {
			$(this).remove();
		}
	});
	editor.find('br').each(function() {
		if (this.parentNode && this.parentNode.lastChild == this) {
			this.parentNode.removeChild(this);
		}
	});

	let html = editor.html();
	if (html.indexOf('&nbsp;') != -1 || html.indexOf('  ') != -1) {
		editor.html(html.replace(/&nbsp;/g, ' ').replace(/ +/g, ' '));
	}
	editor.removeAttr('contenteditable');
	editor.css('overflow-y', 'scroll');
	editor.find('div.unwrap').each(function () {
		$(this).children().unwrap();
	});
}

function findTextNodes(nodes) {
	let tns = [], wsx = /\S/;

	if (!$.isArray(nodes)) {
		nodes = [nodes];
	}

	function _findTextNodes(node) {
		if (node.nodeType == 3) {
			if (wsx.test(node.nodeValue)) {
				tns.push(node);
			}
		}
		else {
			for (let i=0 ; i < node.childNodes.length ; ++i) {
				_findTextNodes(node.childNodes[i]);
			}
		}
	}

	for (let i=0 ; i<nodes.length ; ++i) {
		_findTextNodes(nodes[i]);
	}
	return tns;
}

function checkAll() {
	check(this);
}

function danproof_login(u) {
	// Don't use send_post because this happens before cookie exists.
	$.post('./callback.php?a=login', {'u': u}).success(function() {
		window.location = './';
	}).fail(function() {
		alert('Kunne ikke logge ind - er du sikker på at du har adgang til dette værktøj?');
	});
}

function danproof_login_popup(u) {
	// Don't use send_post because this happens before cookie exists.
	$.post('./callback.php?a=login', {'u': u}).success(function() {
		window.location = window.location.href.replace('popup=2', 'popup=3');
	}).fail(function() {
		alert('Kunne ikke logge ind - er du sikker på at du har adgang til dette værktøj?');
	});
}

function danproof_logout() {
	send_post('./callback.php?a=logout').success(function() {
		window.location = './';
		window.location.reload(true);
	}).fail(function() {
		alert('Kunne ikke logge ud - er du sikker på at du har adgang til dette værktøj?');
	});
}

function logout_other(e) {
	let tr = $(e).closest('tr');
	send_post('./callback.php?a=logout-other', {s: tr.attr('data-id')}).success(function(data) {
		tr.fadeOut();
		let cap = cookie_hmac.sess_caps;
		cookie_hmac = Cookies.getJSON('comma-hmac');
		if (cap != cookie_hmac.sess_caps) {
			$('#profile').on('hide.bs.modal', function() {
				window.location = './';
				window.location.reload(true);
			});
		}
	}).fail(function() {
		alert('Kunne ikke logge ud - er du sikker på at du har adgang til dette værktøj?');
	});
}

function profile_open() {
	send_post('./callback.php?a=get-profile').success(function(data) {
		if (!data.hasOwnProperty('a') || data.a !== 'get-profile') {
			return;
		}
		if (!data.hasOwnProperty('profile')) {
			alert('Kunne ikke åbne din profil - er du sikker på at du har adgang til dette værktøj?');
			return;
		}

		let p = $('#profile');

		let html = '';
		html += '<h3>Konto</h3>';
		html += '<b>Brugernavn</b>: '+escHTML(data.profile.u)+'<br>';
		html += '<b>Password</b>: <a href="https://gramtrans.com/wp-admin/profile.php" target="_blank">Skift password</a>';

		if (data.profile.a.length) {
			html += '<h3>PayPal Abonnementer</h3>';
			html += '<div class="table-responsive"><table class="table table-striped">';
			for (let i=0 ; i<data.profile.a.length ; ++i) {
				let a = data.profile.a[i];
				html += '<tr><td class="small">';
				html += '<b>Type</b>: '+escHTML(Defs[a['acl_which']])+'<br>';
				html += '<b>ID</b>: '+escHTML(a['subscr_id'])+'<br>';
				html += '<b>Løbetid</b>: '+(new Date(a['acl_start']*1000).toLocaleDateString('da-DK'))+' → '+(new Date(a['acl_stop']*1000).toLocaleDateString('da-DK'))+'<br>';
				html += '<b>Faktura</b>: <a href="./receipt?id='+escHTML(a['txn_id'])+'">HTML</a>, <a href="./receipt?id='+escHTML(a['txn_id'])+'&amp;fmt=pdf">PDF</a>';
				html += '</td><td>';
				html += '<a class="btn btn-warning" href="https://www.paypal.com/myaccount/autopay" target="_blank">Administrer</a>';
				html += '</td></tr>';
			}
			html += '</table></div>';
		}

		if (data.profile.s.length) {
			html += '<h3>Forbundne Enheder</h3>';
			html += '<div class="table-responsive"><table class="table table-striped">';
			for (let i=0 ; i<data.profile.s.length ; ++i) {
				let s = data.profile.s[i];
				html += '<tr data-id="'+escHTML(s['sess_id'])+'"><td class="small">';
				html += '<b>Enhed</b>: '+escHTML(s['sess_ua'])+'<br>';
				html += '<b>IP</b>: '+s['sess_ip']+'<br>';
				html += '<b>Sidst aktiv</b>: '+(new Date(s['sess_seen']*1000).toLocaleString('da-DK'));
				html += '</td><td>';
				if (s['sess_id'] !== cookie_hmac.sess_id) {
					html += '<button class="btn btn-warning" onclick="logout_other(this);">Fjern enhed</button>';
				}
				html += '</td></tr>';
			}
			html += '</table></div>';
		}

		p.find('h4.modal-title').text('Profil for '+data.profile.u);
		p.find('div.modal-body').html(html);
		p.modal('show');
	}).fail(function() {
		alert('Kunne ikke åbne din profil - er du sikker på at du har adgang til dette værktøj?');
	});
}

function profile_close() {
	$('#profile').modal('hide');
}

function redeem_handler(rv) {
	if (!rv.hasOwnProperty('g') && !rv.hasOwnProperty('r')) {
		alert('Svaret fra serveren var tomt');
		return;
	}

	if (rv.hasOwnProperty('r')) {
		alert(rv['r']);
		return;
	}

	if (rv.hasOwnProperty('g')) {
		redeem_close();
		alert(rv['g']);
		return;
	}
}

function redeem_do() {
	let consent = $('#redeem_consent').prop('checked');
	let email = $.trim($('#redeem_email').val());
	let email2 = $.trim($('#redeem_email2').val());
	let code = $.trim($('#redeem_code').val().replace(/[^a-zA-Z0-9]+/g, ''));

	if (!consent) {
		alert('Du skal acceptere vilkårene før du kan gå videre.');
		return;
	}
	if (email.length == 0) {
		alert('Mangler en gyldig email-addresse!');
		return;
	}
	if (! /^.+@.+?\..+$/.test(email)) {
		alert(email + ' er ikke en gyldig email-addresse!');
		return;
	}
	if (email !== email2) {
		alert('Email-addresserne skal være ens!');
		return;
	}
	if (code.length == 0) {
		alert('Mangler en gyldig kode!');
		return;
	}
	if (code.length != 15) {
		alert(code + ' er ikke en gyldig kode!');
		return;
	}

	$.post('./callback.php?a=redeem', {'email': email, 'code': code}).success(redeem_handler).fail(function() {
		alert('Kunne ikke indløse værdikoden. Er du sikker på den er gyldig?');
	});
}

function redeem_open() {
	if (window.location.hash && /redeem=[-A-Za-z0-9]+/.test(window.location.hash)) {
		let code = window.location.hash.replace(/^.*redeem=([-A-Za-z0-9]+).*$/g, '$1');
		$('#redeem_code').val(code);
	}
	$('#redeem').modal('show');
}

function redeem_close() {
	$('#redeem').modal('hide');
}

function paypal_close(e) {
	$(e).closest('form').find('.popover').remove();
}

function paypal_submit(e) {
	if (!$(e).closest('form').find('#consent').first().prop('checked')) {
		alert('Du skal acceptere vilkårene før du kan gå videre.');
		return false;
	}

	let school = $(e).closest('form').find('#school');
	if (school.length == 0) {
		return true;
	}

	let val = $.trim(school.val());
	if (val.length >= 2) {
		return true;
	}
	alert('Feltet skal udfyldes med en navnet på en eksisterende institution.');
	return false;
}

function shared_init() {
	cookie_hmac = Cookies.getJSON('comma-hmac');
	if (typeof cookie_hmac === 'undefined') {
		cookie_hmac = {
			sess_id: '',
			sess_caps: 0,
			cnt: 0
			};
	}

	$('input[name="item_number"]').each(function() {
		let content = '';

		if ($(this).val().indexOf('-student-') !== -1) {
			content += '<div class="form-group"><label class="control-label" for="school">Hvilken uddannelsesinstitution / skole går du på?</label><input name="on1" type="hidden" value="Institution"><input name="os1" id="school" class="form-control"></div>';
		}

		content += '<div class="checkbox"><label><input name="on0" type="hidden" value="Consent"><input name="os0" id="consent" type="checkbox"> Marker at du har læst, forstået og accepteret vores <a href="./terms" target="_blank">anvendelsesvilkår</a></label></div><div class="form-group"><button class="btn btn-default" onclick="paypal_close(this); return false;">Luk</button> <button type="submit" class="btn btn-primary" onclick="return paypal_submit(this);">Videre</button></div>';

		$(this).closest('form').find('button').off().click(function() {
			$(this).popover({
				html: true,
				content: content,
				placement: 'top',
				});
			$(this).popover('show');
			return false;
		});
	});
}

function shared_hook() {
	if (window.location.hash) {
		if (window.location.hash.indexOf('redeem') != -1) {
			setTimeout(redeem_open, 500);
		}
	}
}

function sanitize_result(txt) {
	// Swap markers that the backend has mangled due to sentence-ending parentheticals
	for (let i=0 ; i<Defs.MAX_RQ_SIZE ; ++i) {
		let t1 = '</s'+i+'>';
		let t2 = '<s'+(i+1)+'>';
		let s1 = txt.indexOf(t1);
		let s2 = txt.indexOf(t2);
		if (s1 !== -1 && s2 !== -1 && s2 < s1) {
			txt = txt.replace(new RegExp('('+t2+')((.|\\s)*?'+t1+')', 'g'), '$2\n\n$1\n');
		}
	}

	// Remove empty sentences
	txt = txt.replace(/<s\d+>[\s\n]*<\/s\d+>/g, '');

	// Remove noise before sentences
	txt = txt.replace(/^[^]*?(<s\d+>)/, '$1');

	// Remove noise between sentences
	txt = txt.replace(/(\n<\/s\d+>)[^]*?(<s\d+>\n)/g, '$1\n\n$2');

	// Remove noise after sentences
	txt = txt.replace(/(<\/s\d+>)[^<]*?$/, '$1');

	return txt;
}

function renumerate_editor() {
	let editor = $(tinyMCE.activeEditor.getBody());
	let ps = $(findTextNodes(editor.get(0))).closest(tnjq).get();

	for (let i=0 ; i<ps.length ; ++i) {
		let p = $(ps[i]);
		let ptxt = $.trim(p.html().replace(/<br\/?\s*>/g, '\n').replace(/<[^>]+>/g, ''));
		if (!ptxt) {
			continue;
		}
		let id = i+1;
		p.attr('id', 's'+id);
	}
}

function transfer_document() {
	commaIgnoreAll();
	$(tinyMCE.activeEditor.getBody()).focus();
	tinyMCE.activeEditor.execCommand('selectAll');
	if (!iOS) {
		tinyMCE.activeEditor.execCommand('copy');
	}

	ga_log('ui', 'transfer');
	let f = $('#transfer');
	f.find('input').val($(tinyMCE.activeEditor.getBody()).html());
	f.get(0).submit();
}

function pprest_check_event() {
	let html = $('#pprest-reply').html();
	$('#pprest-reply').html('… checker …');

	$.post('./callback.php?a=pprest-check-event', {'aid': pprest_aid, 'pid': pprest_pid}).success(function(rv) {
		if (rv.hasOwnProperty('receipt')) {
			$('#pprest-reply').html('<h2>PayPal Betaling Gennemført</h2><p>Du skulle gerne have modtaget en email med nedenstående indhold.</p><blockquote class="email">'+rv.receipt+'</blockquote>');
			clearInterval(pprest_int);
		}
		else {
			$('#pprest-reply').html(html);
		}
	}).fail(function() {
		$('#pprest-reply').html(html);
		alert('Kunne ikke checke PayPals status!');
	});
}
/*!
 * Copyright 2016 GrammarSoft ApS <info@grammarsoft.com> at https://grammarsoft.com/
 * All Rights Reserved
 * Linguistic backend by Eckhard Bick <eckhard.bick@gmail.com>
 * Frontend by Tino Didriksen <mail@tinodidriksen.com>
 */
'use strict';

var opt_seen = false;
var opt_onlyConfident = false;
var opt_ignUnknown = false;
var opt_ignUNames = false;
var opt_ignUComp = false;
var opt_ignUAbbr = false;
var opt_ignUOther = false;
var opt_ignMaj = false;
var opt_color = false;
var opt_useDictionary = true;
var opt_storage = false;
var opt_dictionary = [];
var live_dictionary = {};
var g_access = {hmac: '', sessionid: ''};

function onResizeHandler() {
	var iframe = $('.mce-edit-area').find('iframe').first();

	$('.mce-tinymce').css('border', '0');
	$('.mce-edit-area').height(100);
	iframe.height(100);

	var height = $('#container').innerHeight();
	height -= $('#headbar').outerHeight();
	height -= $('#footbar').outerHeight();
	height -= $('#ed-head').outerHeight();
	height -= $('#ed-foot').outerHeight();
	height -= 40;
	height -= $('.mce-menubar.mce-toolbar').outerHeight();
	if ($('.mce-toolbar-grp:visible').length) {
		height -= $('.mce-toolbar-grp').outerHeight();
	}
	height -= $('.mce-statusbar').outerHeight();
	height -= 1;
	$('.mce-edit-area').height(height);

	iframe.height(height);
	// iOS cannot resize iframes, so handle this case by making the container bigger instead
	if (iframe.height() != height) {
		var height = iframe.height();
		$('.mce-edit-area').height(height);
		iframe.parent().height(height);
	}

	if (tinyMCE && tinyMCE.activeEditor) {
		$(tinyMCE.activeEditor.getBody()).css('min-height', height-20);
	}

	editorHasText();
}

function onResize() {
	setTimeout(onResizeHandler, 500);
	setTimeout(onResizeHandler, 1000);
}

function showTypes() {
	$('#dg_types').modal();
}

function showInput() {
	$('#do_input_text').val(ccomma.text());
	$('#dg_input').modal();
}

$(function() {
	opt_storage = haveLocalStorage();
	if (opt_storage && localStorage.getItem('opt_seen')) {
		opt_seen = parseInt(localStorage.getItem('opt_seen')) == 1;
		opt_onlyConfident = parseInt(localStorage.getItem('opt_onlyConfident')) == 1;
		opt_ignUnknown = parseInt(localStorage.getItem('opt_ignUnknown')) == 1;
		opt_ignUNames = opt_ignUnknown || parseInt(localStorage.getItem('opt_ignUNames')) == 1;
		opt_ignUComp = opt_ignUnknown || parseInt(localStorage.getItem('opt_ignUComp')) == 1;
		opt_ignUAbbr = opt_ignUnknown || parseInt(localStorage.getItem('opt_ignUAbbr')) == 1;
		opt_ignUOther = opt_ignUnknown || parseInt(localStorage.getItem('opt_ignUOther')) == 1;
		opt_ignMaj = parseInt(localStorage.getItem('opt_ignMaj')) == 1;
		opt_color = parseInt(localStorage.getItem('opt_color')) == 1;
		opt_useDictionary = parseInt(localStorage.getItem('opt_useDictionary')) == 1;
		opt_dictionary = (localStorage.getItem('opt_dictionary') || '').split('\t');
		for (var i=0 ; i<opt_dictionary.length ; ++i) {
			if (!opt_dictionary[i]) {
				continue;
			}
			addToDictionary_helper(opt_dictionary[i]);
		}
	}
	tnjq = text_nodes.join(',');

	tinymce.init({
		selector: 'textarea',
		menubar: false,
		statusbar: false,
		plugins: ['searchreplace', 'paste', 'placeholder'],
		browser_spellcheck: false,
		language: 'da',
		entity_encoding: 'raw',
		language_url: './static/da.js',
		content_css: './static/inline.css?v=80688fdc',
		setup: function(editor) {
				editor.on('keyup paste change', function() {
					if (eht_prevent) {
						return;
					}
					if ($('#dg_input').hasClass('in')) {
						return;
					}
					if (eht_timer) {
						clearTimeout(eht_timer);
					}
					eht_timer = setTimeout(editorHasText, 250);
				});
				editor.on('paste', function() { commaIgnoreAll(); setTimeout(cleanEditorContent, 500); ga_log('ui', 'paste'); });
				editor.on('undo', function() { commaIgnoreAll(); setTimeout(cleanEditorContent, 500); /* ga_log('ui', 'undo'); */ });
				editor.on('postRender', function() {
					var iframe = $('iframe');
					$('#working').show().offset(iframe.offset()).width(iframe.width()).height(iframe.height()).hide();
					$('.mce-toolbar-grp').hide();
					onResize();

					// Selective translations
					if (tinymce && tinymce.i18n && tinymce.i18n.data && tinymce.i18n.data.da) {
						tinymce.i18n.data.da['Blocks'] = 'Afsnit';
						tinymce.i18n.data.da['Inline'] = 'Skrifttype';
					}
				});
			}
		});

	var tlist = $('#dg_types').find('.modal-body');
	for (var type in ctypes) {
		if (!ctypes.hasOwnProperty(type)) {
			continue;
		}
		var headers = ctypes[type][0];
		headers = headers.replace(/<\/h3>.*?<h3>/g, '</h3><h3>');
		headers = headers.replace(/^(<h3>.+<\/h3>).*?$/, '$1');
		headers = headers.replace(/h3/g, 'h4');
		var row = '<div class="row"><div class="col-md-4" title="'+type+'">'+headers+'Niveau '+ctypes[type][1]+'</div><div class="col-md-8">'+ctypes[type][0]+'<br><br></div></div>';
		tlist.append(row);
	}

	checkDone();

	$('#btn-check,#btn-correct-all,#btn-wrong-all,#btn-copy,#btn-erase,#btn-close').addClass('disabled');
	$('#btn-check').click(function() {
		checkAll();
		ga_log('ui', 'check');
	});
	$('#btn-correct-all').click(function () {
		if ($(this).hasClass('disabled')) {
			return;
		}
		ga_log('ui', 'correct-all-yellow');
		log_click('correct-all-yellow');
		$(tinyMCE.activeEditor.getBody()).find('span.comma-yellow').each(function() {
			ccomma = $(this);
			commaYellow();
		});
	});

	$('#btn-erase').click(function() {
		$(tinyMCE.activeEditor.getBody()).text('');
		editorHasText();
		ga_log('ui', 'erase');
	});
	$('#btn-close').click(function() {
		commaIgnoreAll();
		ga_log('ui', 'close');
	});
	$('#btn-copy').click(function() {
		commaIgnoreAll();
		$(tinyMCE.activeEditor.getBody()).focus();
		tinyMCE.activeEditor.execCommand('selectAll');
		tinyMCE.activeEditor.execCommand('copy');
		ga_log('ui', 'copy');
	});
	$('#btn-transfer').click(transfer_document);

	$('[data-toggle="popover"]').popover();

	$('#btn-options').on('shown.bs.popover', optionsOpen).on('hide.bs.popover', optionsClose).click(function() {
		$(this).popover('toggle');
	});
	if (!opt_seen) {
		$('#btn-options').popover('show');
	}

	$('#dg_input').on('shown.bs.modal', function() {
		$('#do_input_text').focus();
	});
	$('#do_input_one').click(function() {
		var txt = $('#do_input_text').val();
		ga_log('comma', 'input', txt);
		log_click({'input': ccomma.attr('data-types'), 'w': ccomma.text(), 'r': txt});
		commaDo(txt);
	});

	$(window).on('resize', onResize);
	$(window).on('beforeunload', function(e) {
		if (tinyMCE && tinyMCE.activeEditor && $(tinyMCE.activeEditor.getBody()).find('span.comma').length) {
			var msg = 'Er du sikker på at du vil lukke siden?';
			e.returnValue = msg;
			return msg;
		}
	});

	$('#warning').hide();

	var rxaosp = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
	if (rxaosp && parseInt(rxaosp[1]) < 537) {
		var warn = 'Din browser er for gammel. Du bør opgraderer til en nyere <a href="https://play.google.com/store/apps/details?id=com.android.chrome">Chrome</a> eller <a href="https://play.google.com/store/apps/details?id=org.mozilla.firefox">Firefox</a>.';
		$('#warning').html(warn).show();
		alert(warn.replace(/<[^>]+>/g, ''));
	}

	iOS = window.navigator.userAgent.indexOf('Apple') !== -1
			&& (window.navigator.userAgent.indexOf('iPad') !== -1
				|| window.navigator.userAgent.indexOf('iPhone') !== -1
				|| window.navigator.userAgent.indexOf('iPod') !== -1)
			;
	if (iOS) {
		$('#btn-copy').find('.text').text('Vælg alt tekst i dokumentet');
	}
});

function toggleGUIs() {
	if (!tinyMCE || !tinyMCE.activeEditor) {
		return;
	}
	var ed = tinyMCE.activeEditor.getBody();
	var editor = $(ed);

	if (editor.find('span.comma-yellow').length) {
		$('#btn-correct-all').removeClass('disabled');
	}
	else {
		$('#btn-correct-all').addClass('disabled');
	}

	if (editor.find('span.comma').length) {
		editor.removeAttr('contenteditable');
	}
	else {
		$('#btn-close').addClass('disabled');
		editor.attr('contenteditable', true);
		editor.css('overflow-y', '');
		last_result = null;
	}

	if (ed.childNodes.length && ed.textContent.length) {
		$('#btn-check,#btn-copy,#btn-erase').removeClass('disabled');
		$('#placeholder').hide();
	}
	else {
		$('#btn-check,#btn-copy,#btn-erase').addClass('disabled');
		$('#placeholder').show();
	}
}

function editorHasText() {
	eht_timer = null;
	if (!tinyMCE || !tinyMCE.activeEditor || eht_prevent) {
		return;
	}
	var ed = tinyMCE.activeEditor.getBody();

	toggleGUIs();

	$(ed).find('span.comma').popover('destroy');
	ccomma = null;
}

function optionsOpen() {
	$('#opt_onlyConfident').prop('checked', opt_onlyConfident);
	$('#opt_ignUnknown').prop('checked', opt_ignUnknown);
	$('#opt_ignUNames').prop('checked', opt_ignUNames);
	$('#opt_ignUComp').prop('checked', opt_ignUComp);
	$('#opt_ignUAbbr').prop('checked', opt_ignUAbbr);
	$('#opt_ignUOther').prop('checked', opt_ignUOther);
	$('#opt_ignMaj').prop('checked', opt_ignMaj);
	$('#opt_color').prop('checked', opt_color);
	$('#opt_useDictionary').prop('checked', opt_useDictionary);

	$('#opt_ignUNames,#opt_ignUComp,#opt_ignUAbbr,#opt_ignUOther').off().click(function() {
		$('#opt_ignUnknown').prop('checked', $('#opt_ignUNames').prop('checked') && $('#opt_ignUComp').prop('checked') && $('#opt_ignUAbbr').prop('checked') && $('#opt_ignUOther').prop('checked'));
	});
	$('#opt_ignUnknown').off().click(function() {
		$('#opt_ignUNames,#opt_ignUComp,#opt_ignUAbbr,#opt_ignUOther').prop('checked', $(this).prop('checked'));
	});

	$('#btn-options-close').off().click(function() {
		$('#btn-options').popover('hide');
	});
	//ga_log('options', 'open');
}

function optionsClose() {
	if ($('#btn-options').hasClass('disabled')) {
		return;
	}

	opt_onlyConfident = $('#opt_onlyConfident').prop('checked');
	opt_ignUnknown = $('#opt_ignUnknown').prop('checked');
	opt_ignUNames = opt_ignUnknown || $('#opt_ignUNames').prop('checked');
	opt_ignUComp = opt_ignUnknown || $('#opt_ignUComp').prop('checked');
	opt_ignUAbbr = opt_ignUnknown || $('#opt_ignUAbbr').prop('checked');
	opt_ignUOther = opt_ignUnknown || $('#opt_ignUOther').prop('checked');
	opt_ignMaj = $('#opt_ignMaj').prop('checked');
	opt_color = $('#opt_color').prop('checked');
	opt_useDictionary = $('#opt_useDictionary').prop('checked');
	if (opt_storage) {
		localStorage.setItem('opt_seen', 1);
		localStorage.setItem('opt_onlyConfident', opt_onlyConfident ? 1 : 0);
		localStorage.setItem('opt_ignUnknown', opt_ignUnknown ? 1 : 0);
		localStorage.setItem('opt_ignUNames', opt_ignUNames ? 1 : 0);
		localStorage.setItem('opt_ignUComp', opt_ignUComp ? 1 : 0);
		localStorage.setItem('opt_ignUAbbr', opt_ignUAbbr ? 1 : 0);
		localStorage.setItem('opt_ignUOther', opt_ignUOther ? 1 : 0);
		localStorage.setItem('opt_ignMaj', opt_ignMaj ? 1 : 0);
		localStorage.setItem('opt_color', opt_color ? 1 : 0);
		localStorage.setItem('opt_useDictionary', opt_useDictionary ? 1 : 0);
	}
	if (last_result) {
		$('#btn-options').addClass('disabled');
		commaIgnoreAll();
		var lr = last_result;
		parseCommas({'c': last_result});
		last_result = lr;
	}
	else {
		editorHasText();
	}
	ga_log('options', 'close', '['+opt_onlyConfident+','+opt_ignUnknown+','+opt_ignUNames+','+opt_ignUComp+','+opt_ignUAbbr+','+opt_ignUOther+','+opt_ignMaj+','+opt_color+','+opt_useDictionary+']');
}

// ToDo: GUI for editing, importing, exporting user dictionary
var ude_template = '<div class="ud-entry col-sm-6"><div class="input-group input-group-sm"><input type="text" value="{ENTRY}" class="form-control" placeholder="Tilføj nyt ord …"><span class="input-group-btn"><button type="button" class="btn btn-warning btn-sm"><span class="glyphicon glyphicon-pencil"></span></button><button type="button" class="btn btn-danger btn-sm"><span class="glyphicon glyphicon-remove"></span></button></span></div></div>';
var ude_focus = null;

function UDE_Save() {
	live_dictionary = {};
	opt_dictionary = [];
	$('#do_userdict_entries').find('input').each(function() {
		var word = $.trim($(this).val());
		$(this).attr('data-entry', word);
		if (word && !isInDictionary(word)) {
			addToDictionary_helper(word);
			opt_dictionary.push(word);
		}
	});
	var dict = opt_dictionary.join('\t').replace(/^\s+/g, '').replace(/\s+$/g, '');
	localStorage.setItem('opt_dictionary', dict);
}

function UDE_Change() {
	var nv = $.trim($(this).val());
	if (nv != $(this).attr('data-entry')) {
		if (!$(this).attr('data-entry')) {
			$('#do_userdict_entries').append(ude_template.replace('{ENTRY}', ''));
			UDE_Reflow();
		}
		UDE_Save();
	}
}

function UDE_Focus() {
	ude_focus = this;
	$(this).parent().find('.glyphicon-pencil').removeClass('glyphicon-pencil').addClass('glyphicon-ok');
}

function UDE_Blur() {
	$('#do_userdict_entries').find('.glyphicon-ok').removeClass('glyphicon-ok').addClass('glyphicon-pencil');
}

function UDE_Edit() {
	var e = $(this).closest('div').find('input');
	if (ude_focus == e.get(0)) {
		ude_focus = null;
	}
	else {
		e.focus();
	}
}

function UDE_Delete() {
	var e = $(this).closest('.ud-entry');
	if ($.trim(e.find('input').val())) {
		ude_focus = null;
		e.remove();
		UDE_Save();
		UDE_Reflow();
	}
}

function UDE_Reflow() {
	ude_focus = null;
	var c = $('#do_userdict_entries');
	var es = c.find('.ud-entry').detach();
	c.html('');

	var ml = null;
	for (var i=0 ; i<es.length ; ++i) {
		if (!ml || ml.find('.ud-entry').length >= 2) {
			ml = c.append('<div class="row"></div>').find('.row').last();
		}
		$(es[i]).appendTo(ml);
	}

	c.find('input').off().focus(UDE_Focus).blur(UDE_Blur).change(UDE_Change).each(function() {
		var v = $.trim($(this).val());
		$(this).attr('data-entry', v);
	});
	c.find('.btn-warning').off().click(UDE_Edit);
	c.find('.btn-danger').off().click(UDE_Delete);
	UDE_Blur();
}

function showUserdictEditor() {
	$('[data-toggle="popover"]').popover('hide');
	commaIgnoreAll();

	var ude = $('#dg_userdict');
	var c = ude.find('#do_userdict_entries');
	c.html('');

	opt_dictionary.sort(sortByLocale);
	for (var i=0 ; i<opt_dictionary.length ; ++i) {
		if (!opt_dictionary[i]) {
			continue;
		}
		c.append(ude_template.replace('{ENTRY}', escHTML(opt_dictionary[i])));
	}
	c.append(ude_template.replace('{ENTRY}', ''));

	UDE_Reflow();
	ude.modal();
}

function isInDictionary(word) {
	var f = word.charAt(0);
	if (!live_dictionary.hasOwnProperty(f)) {
		return false;
	}
	if (!live_dictionary[f].hasOwnProperty(word)) {
		return false;
	}
	return true;
}

function addToDictionary_helper(word) {
	// Add literal version to dictionary
	var f = word.charAt(0);
	if (!live_dictionary.hasOwnProperty(f)) {
		live_dictionary[f] = {};
	}
	live_dictionary[f][word] = true;

	// Add first-upper and all-upper versions
	f = f.toUpperCase();
	if (!live_dictionary.hasOwnProperty(f)) {
		live_dictionary[f] = {};
	}
	live_dictionary[f][uc_first(word)] = true;
	live_dictionary[f][word.toUpperCase()] = true;
}

function addToDictionary() {
	var word = ccomma.text();
	if (!isInDictionary(word)) {
		addToDictionary_helper(word);
		if (opt_storage) {
			opt_dictionary.push(word);
			var dict = opt_dictionary.join('\t').replace(/^\s+/g, '').replace(/\s+$/g, '');
			localStorage.setItem('opt_dictionary', dict);
		}
	}

	var p = $(tinyMCE.activeEditor.getBody());
	var cs = p.find('span.comma-yellow').each(function() {
		ccomma = $(this);
		if (ccomma.text() !== word && ccomma.text().toUpperCase() !== word.toUpperCase()) {
			return;
		}
		commaYellow();
	});
	ga_log('ui', 'dict-add', word);
	log_click({'dict-add': word});
}

function commaPopup(c, exp) {
	var b = tinyMCE.activeEditor.getBody();
	var p = $(b);
	p.find('.popover').remove();
	p.find('span.comma').popover('destroy').removeClass('comma-selected');

	// If this comma's popup is the open one, just close it
	if (!exp && ccomma && ccomma.get(0) === c) {
		ccomma = null;
		return;
	}
	ccomma = $(c);
	ccomma.focus().addClass('comma-selected');

	var all_upper = is_upper(ccomma.text());
	var first_upper = all_upper || is_upper(ccomma.text().charAt(0));

	var types = ccomma.attr('data-types');
	if (types.indexOf('@lower') !== -1) {
		all_upper = first_upper = false;
	}

	var html = '<div id="popup">';
	var crs = ccomma.attr('data-sugs').split('\t');
	for (var c=0 ; c<crs.length ; ++c) {
		if (crs[c].length === 0) {
			continue;
		}
		var txt = crs[c];
		if (all_upper) {
			txt = txt.toUpperCase();
		}
		else if (first_upper) {
			txt = uc_first(txt);
		}
		html += '<div class="action"><a onclick="window.parent.commaAccept(this);"><span class="icon icon-accept"></span><span>'+escHTML(txt)+'</span></a></div>';
	}
	if (types.indexOf('@nil') !== -1) {
		html += '<div class="action"><a onclick="window.parent.commaAccept();"><span class="icon icon-discard"></span><span>Fjern ordet</span></a></div>';
	}
	if (types.indexOf('@insert') !== -1) {
		html += '<div class="action"><a onclick="window.parent.commaAccept();"><span class="icon icon-accept"></span><span>Indsæt ordet</span></a></div>';
	}
	if (ccomma.hasClass('comma-yellow')) {
		html += '<div class="action"><a onclick="window.parent.addToDictionary();"><span class="icon icon-accept"></span><span>Tilføj til ordbogen</span></a></div>';
	}
	if (types.indexOf('@question') !== -1) {
		html += '<div class="action"><a onclick="window.parent.commaDiscard();"><span class="icon icon-accept"></span><span>Ok</span></a></div>';
	}
	else {
		html += '<div class="action"><a onclick="window.parent.showInput();"><span class="icon icon-accept"></span><span>Ret selv…</span></a></div>';
		html += '<div class="action"><a onclick="window.parent.commaDiscard();"><span class="icon icon-discard"></span><span>Ignorer</span></a></div>';
	}
	html += '</div>';
	html += '<div id="explanation">';
	var ts = ccomma.attr('data-types').split(/ /g);
	var exps = {};
	var en = exp ? 2 : 1;
	for (var i=0 ; i<ts.length ; ++i) {
		// Only show @error text if we have nothing better to say
		if (ts.length > 1 && ts[i] === '@error') {
			continue;
		}
		var et = ctypes[ts[i]] ? ctypes[ts[i]][en] : (ts[i] + ' ');
		et = '<p>'+et.replace(/(<\/h\d>)/g, '$1<br><br>').replace(/(<br>\s*)+<br>\s*/g, '</p><p>')+'</p>';
		exps[et] = et.replace(/<p>\s*<\/p>/g, '');
	}
	html += $.map(exps, function(v) { return v; }).join('<hr>');
	if (!exp) {
		html += '<hr><div class="action"><a onclick="window.parent.commaExplain();"><span class="icon icon-explain"></span><span>Udvid forklaringen</span></a></div>';
	}
	html += '</div>';

	// If the comma is too close to the right edge, don't set the viewport as it messes up alignment
	var vp = null;
	if (ccomma.offset().left + ccomma.width() < p.width() - 100) {
		vp = b;
	}

	// If the comma is too close to the top, force it to open below
	var pl = 'auto bottom';
	if (ccomma.offset().top < 300) {
		pl = 'bottom';
	}

	ccomma.popover({
		animation: false,
		content: html,
		html: true,
		placement: pl,
		trigger: 'manual',
		viewport: vp,
	}).on('shown.bs.popover', function() {
		var pop = p.find('div.popover');
		pop.scrollintoview();
		pop.find('a[target="_blank"]').off().on('click', function() {
			window.open($(this).attr('href'));
		});
	});
	ccomma.popover('show');
}

function commaInlineClick() {
	commaPopup(this, false);
	ga_log('comma', 'click');
}

function commaExplain() {
	commaPopup(ccomma.get(0), true);
	ga_log('comma', 'explain', ccomma.attr('data-types'));
	log_click({'explain': ccomma.attr('data-types')});
}

function commaCreateInline(id, txt, comma) {
	var p = $(tinyMCE.activeEditor.getBody()).find('#s'+id);
	if (p.length == 0) {
		renumerate_editor();
		p = $(tinyMCE.activeEditor.getBody()).find('#s'+id);
	}
	var ml = p.html();
	var nonl = /[^\d\wa-zA-ZéÉöÖæÆøØåÅ.,]/ig;
	var lg = /[<>]/;

	var col = 'green';
	var types = comma[1].split(/ /g);
	for (var i=0 ; i<types.length ; ++i) {
		if (types_yellow.hasOwnProperty(types[i])) {
			col = 'yellow';
		}
		if (types_red.hasOwnProperty(types[i])) {
			col = 'red';
			break;
		}
	}
	for (var i=0 ; i<types.length ; ++i) {
		if (types[i] === '@green') {
			col = 'green';
		}
	}

	if (opt_useDictionary && col === 'yellow' && isInDictionary(comma[0])) {
		if (comma[2].length == 0) {
			return;
		}

		col = 'green';
	}

	if (opt_onlyConfident && col !== 'red') {
		return;
	}

	if (!comma[2] && /@-?comp(-|\t|$)/.test(comma[1])) {
		comma[2] = comma[0];
	}
	if ($.inArray('@comp-', types) !== -1) {
		comma[0] += ' ';
	}
	else if ($.inArray('@-comp', types) !== -1) {
		comma[0] = ' ' + comma[0];
	}
	else if ($.inArray('@comp-:-', types) !== -1) {
		comma[0] += ' ';
		comma[2] = comma[2].replace(/(\t|$)/g, '‐$1'); // -$1 puts after words because matching \t|$
	}

	txt = $.trim(txt.replace(/\s+/g, '').replace(nonl, '\ue000'));

	// Find the spot in the editor where the comma is to be changed
	var ti = 0;
	var i = 0;
	for ( ; i<ml.length ; ++i) {
		i = skipNonText(ml, i);
		for (var tn=ti ; tn<txt.length && tn<ti+10 ; ++tn) {
			if (txt.charAt(tn) === ml.charAt(i) || (txt.charAt(tn) === '\ue000' && !lg.test(ml.charAt(i)) && nonl.test(ml.charAt(i)))) {
				ti = tn;
				// Find identical sequential letters, e.g. 1977
				while (ti < txt.length-1 && txt.charAt(ti) === ml.charAt(i)) {
					++ti;
					i = skipNonText(ml, i+1);
				}
				break;
			}
		}
		if (ti >= txt.length-1) {
			// Check after text as well to find correct insert position
			var nc = comma[0];
			if (types[0] !== '@insert' && nc && nc.length) {
				var ni = skipNonText(ml, i+1);
				if (ml.charAt(ni) === nc.charAt(0)) {
					// Skip tags backwards as well
					if (ml.charAt(ni-1) === '>') {
						while (ni > 0 && ml.charAt(ni) !== '<') {
							--ni;
						}
					}
					i = ni - 2;
				}
			}
			break;
		}
	}

	var ins = comma[0];
	if (ml.indexOf(comma[0], i) === -1 && ml.indexOf(escHTML(comma[0]), i) !== -1) {
		comma[0] = escHTML(comma[0]);
	}

	if (types[0] !== '@insert') {
		var ni = ml.indexOf(comma[0], i);
		var ot = ml.lastIndexOf('<', ni);
		var et = ml.indexOf('>', ot);
		while (ni !== -1 && ni > ot && ni < et) {
			ni = ml.indexOf(comma[0], et+1);
			ot = ml.lastIndexOf('<', ni);
			et = ml.indexOf('>', ot);
		}
		if (ni !== -1) {
			i = ni;
		}
	}
	if (ml.length >= i+2 && ml.charAt(i+1) == '<' && ml.charAt(i+2) == '/') {
		i = skipNonText(ml, i+1);
	}

	if ($.inArray('@-comp', types) === -1 && $.inArray('@insert', types) === -1 && /\S/.test(ml.charAt(i + comma[0].length - 1))) {
		comma[0] = $.trim(comma[0]);
	}

	var alt = '';
	if (opt_color) {
		alt = ' alt';
	}

	var rpl = '<span class="comma comma-'+col+alt+'" data-types="'+escHTML(comma[1])+'" data-sugs="'+escHTML(comma[2])+'">'+escHTML(ins)+'</span>';

	if (types[0] === '@insert') {
		ml = ml.substr(0, i) + rpl + ' ' + ml.substr(i);
	}
	else {
		ml = ml.substr(0, i) + rpl + ml.substr(i+comma[0].length);
	}
	ml = ml.replace('&nbsp;', ' ').replace(/  +/g, ' ');
	p.html(ml);
	$(p).find('span.comma').off().click(commaInlineClick);
}

function commaDo(rpl) {
	var p = $(tinyMCE.activeEditor.getBody());
	p.find('.popover').remove();
	var commas = p.find('span.comma');
	commas.popover('destroy');
	$('#dg_input').modal('hide');
	if (!ccomma) {
		return;
	}

	var c = 0;
	for (var i=0 ; i<commas.length ; ++i) {
		if (commas[i] === ccomma.get(0)) {
			c = i;
		}
	}

	ccomma.replaceWith(rpl);
	ccomma = null;

	if (p.find('span.comma').length == 0) {
		$('#btn-correct-all,#btn-wrong-all,#btn-close').addClass('disabled');
		p.attr('contenteditable', true);
	}
	else {
		commas = p.find('span.comma');
		if (c >= commas.length) {
			--c;
		}
		commas.eq(c).click();
	}
}

function commaAccept(e) {
	if (!ccomma) {
		return;
	}

	var rpl = '';
	var types = ccomma.attr('data-types');
	var click = {'accept': types, 'w': ccomma.text()};
	if (types.indexOf('@nil') !== -1) {
		rpl = '';
	}
	else if (types.indexOf('@insert') !== -1) {
		rpl = ccomma.text();
	}
	else {
		rpl = $(e).text();
		click.r = rpl;
	}

	ga_log('comma', 'accept', ccomma.attr('data-types'));
	log_click(click);
	commaDo(rpl);
}

function commaDiscard() {
	ga_log('comma', 'discard', ccomma.attr('data-types'));
	log_click({'discard': ccomma.attr('data-types'), 'w': ccomma.text()});

	var types = ccomma.attr('data-types');
	if (types.indexOf('@insert') !== -1) {
		commaDo('');
	}
	else {
		commaDo(ccomma.text());
	}
}

function commaYellow() {
	var click = {'yellow': ccomma.attr('data-types'), 'w': ccomma.text()};
	if (ccomma.attr('data-sugs')) {
		var s = ccomma.attr('data-sugs').split('\t')[0];
		if (s === ccomma.text() || s.toUpperCase() === ccomma.text().toUpperCase()) {
			click.r = s;
			commaDo(s);
		}
	}
	else {
		commaDo(ccomma.text());
	}
	ga_log('comma', 'yellow', ccomma.attr('data-types'));
	log_click(click);
}

function parseCommas(txt) {
	if (!txt.hasOwnProperty('c')) {
		var html = $(tinyMCE.activeEditor.getBody()).html();
		if (ts_fail < 2) {
			++ts_fail;
			--to_send_i;
			log_warning({'e': 'empty', 'd': txt, 'l': html.length, 'b': html.substr(0, Defs.MAX_RQ_SIZE)});
			send_text();
			return 0;
		}
		log_error({'e': 'empty', 'd': txt, 'l': html.length, 'b': html.substr(0, Defs.MAX_RQ_SIZE)});
		alert('Svaret fra serveren var tomt - prøv evt. igen.');
		return -1;
	}
	ts_fail = 0;
	txt = txt['c'];

	txt = sanitize_result(txt);

	last_result += txt + '\n\n';

	var ps = $.trim(txt.replace(/\n+<\/s>\n+/g, "\n\n")).split(/<\/s\d+>/);
	for (var i=0 ; i<ps.length ; ++i) {
		var cp = $.trim(ps[i]);
		if (!cp) {
			continue;
		}

		var lines = cp.split(/\n/);
		var id = lines[0].replace(/^<s(.+)>$/, '$1');
		var txt = '';

		for (var j=1 ; j<lines.length ; ++j) {
			// Ignore duplicate opening tags
			if (/^<s\d+>$/.test(lines[j])) {
				continue;
			}

			var w = lines[j].split(/\t/);
			w[0] = $.trim(w[0].replace(/(\S)=/g, '$1 '));

			if (w[0] === '') {
				continue;
			}

			if (w.length > 1) {
				// Strip comma types belonging to higher than current critique level
				var ws = w[1].split(/ /g);
				var nws = [];
				var crs = [];
				var had_r = false;
				var had_whitelisted = false;
				for (var k=0 ; k<ws.length ; ++k) {
					if (ws[k].indexOf('<R:') === 0) {
						var n = ws[k].substr(3);
						n = n.substr(0, n.length-1).replace(/(\S)=/g, '$1 ');
						if (n === w[0]) {
							continue;
						}
						crs.unshift(n);
						had_r = true;
						continue;
					}
					if (ws[k].indexOf('<AFR:') === 0) {
						var n = ws[k].substr(5);
						n = n.substr(0, n.length-1).replace(/(\S)=/g, '$1 ');
						if (n === w[0]) {
							continue;
						}
						crs.push(n);
						continue;
					}
					if (types_only && Object.keys(types_only).length && types_only.hasOwnProperty(ws[k])) {
						had_whitelisted = true;
					}
					if (ctypes.hasOwnProperty(ws[k])) {
						nws.push(ws[k]);
					}
					else {
						nws.push('@unknown-error');
					}
				}
				// Remove @sentsplit from last token
				if (j == lines.length-1 && nws.length == 1 && nws[0] === '@sentsplit') {
					crs = [];
					nws = [];
				}
				// Only show addfejl suggestions if there were real suggestions
				if (!had_r) {
					crs = [];
				}
				// If none of the error types were on the whitelist, remove all markings
				if (!had_whitelisted) {
					crs = [];
					nws = [];
				}

				var ws = [];
				for (var k=0 ; k<nws.length ; ++k) {
					if (nws[k] === '@green') {
						ws.push(nws[k]);
						continue;
					}
					if (opt_onlyConfident && !types_red.hasOwnProperty(nws[k])) {
						continue;
					}
					if (opt_ignUNames && nws[k] === '@proper') {
						continue;
					}
					if (opt_ignUComp && nws[k] === '@new') {
						continue;
					}
					if (opt_ignUAbbr && nws[k] === '@abbreviation') {
						continue;
					}
					if (opt_ignUOther && nws[k] === '@check!') {
						continue;
					}
					if (opt_ignMaj && (nws[k] === '@upper' || nws[k] === '@lower')) {
						continue;
					}
					ws.push(nws[k]);
				}
				nws = ws;
				if (nws.length == 0) {
					crs = [];
				}

				if (crs.length) {
					// Only show addfejl suggestions if the real suggestion icase-matches one of them
					var use_adf = false;
					for (var c=1 ; c<crs.length ; ++c) {
						if (crs[0].toUpperCase() == crs[c].toUpperCase()) {
							use_adf = true;
							break;
						}
					}
					if (!use_adf) {
						crs = [crs[0]];
					}
					crs = crs.unique();
					w[2] = crs.join('\t');
				}
				if (nws.length) {
					w[1] = nws.join(' ');
					if (!w[2] || w[2].length === 0) {
						w[2] = '';
					}
				}
				else {
					w.pop();
				}
			}

			if (w.length > 1) {
				commaCreateInline(id, txt, w);
			}
			if (w[0] !== ',' || w.length === 1) {
				if (w[0].search(/^[-,.:;?!$*½§£$%&()={}+]$/) === -1) {
					txt += ' ';
				}
				txt += w[0];
			}
		}
	}

	$('#btn-check,#btn-correct-all,#btn-wrong-all,#btn-options,#btn-close').removeClass('disabled');
	$('#working').hide();
	var editor = $(tinyMCE.activeEditor.getBody());
	if (!ccomma) {
		var first = editor.find('span.comma').first();
		if (first.length) {
			first.focus().click();
		}
	}
	setTimeout(toggleGUIs, 1);
	send_text();
}

function parseCommas_safe(txt) {
	try {
		var rv = parseCommas(txt);
		if (rv && rv === -1) {
			commaIgnoreAll();
		}
	}
	catch(e) {
		var html = $(tinyMCE.activeEditor.getBody()).html();
		log_error({'e': 'parse', 'd': txt, 'l': html.length, 'b': html.substr(0, Defs.MAX_RQ_SIZE)});
		$('#warning').html('Der opstod en kritisk fejl under håndteringen af svaret fra serveren. Prøv evt. igen. Hvis du kan reproducere fejlen, kontakt venligst support med et eksempel på input der forårsager fejlen.');
		$('#warning').show();
		commaIgnoreAll();
	}
}

function send_text() {
	if (to_send_i < to_send.length) {
		var text = to_send[to_send_i];
		++to_send_i;
		if ($.trim(text).length === 0) {
			return send_text();
		}
		var data = {
			't': text,
			'r': ts_fail,
			};
		ts_xhr = $.ajax({
			url: './callback.php?a=grammar',
			type: 'POST',
			dataType: 'json',
			headers: {HMAC: g_access.hmac},
			data: data,
		}).done(parseCommas_safe).fail(function() {
			checkDone();
			alert('Kunne ikke gennemføre checkning af grammatik - er du sikker på at du har adgang til dette værktøj?');
			mvid_keepalive_at(100);
		});
	}
	// ToDo: Show popup if no errors were found
}

function commaIgnoreAll() {
	var ed = $(tinyMCE.activeEditor.getBody());
	ed.find('.popover').remove();
	ed.find('span.comma').popover('destroy');
	ed.find('span.comma').each(function() {
		var c = $(this);
		if (c.attr('data-types').indexOf('@insert') !== -1) {
			c.replaceWith('');
		}
		else {
			c.replaceWith(c.text());
		}
	});
	$('#btn-correct-all,#btn-wrong-all,#btn-close').addClass('disabled');
	ccomma = null;
	ed.attr('contenteditable', true).focus();
}

function checkDone() {
	if (tinyMCE && tinyMCE.activeEditor) {
		var ed = $(tinyMCE.activeEditor.getBody());
		commaIgnoreAll();
		ed.find(tnjq).removeAttr('id');
	}
}

function check(which, sel) {
	if ($('#btn-check').hasClass('disabled')) {
		return;
	}

	$('#warning').hide();
	checkDone();
	$('#btn-check').addClass('disabled');
	var iframe = $('iframe');
	$('#working').show().offset(iframe.offset()).width(iframe.width()).height(iframe.height()).focus();

	var editor = $(tinyMCE.activeEditor.getBody());
	prepEditorContent(editor);

	last_result = '';
	to_send = [];
	to_send_i = 0;
	ts_fail = 0;
	ccomma = null;

	var nodes = $(findTextNodes(editor.get(0))).closest(tnjq).get();
	for (var i=0 ; i<nodes.length ; ++i) {
		var need = false;
		var run = [];
		var wrap = false;
		for (var j=0 ; j<nodes[i].childNodes.length ; ++j) {
			if ($.inArray(nodes[i].childNodes[j].nodeName, text_nodes) !== -1) {
				if (run.length && wrap) {
					$(run).wrapAll('<div class="unwrap"></div>');
				}
				need = true;
				run = [];
				wrap = false;
				continue;
			}
			if (nodes[i].childNodes[j].nodeType === 1 || (nodes[i].childNodes[j].nodeType === 3 && /\S/.test(nodes[i].childNodes[j].nodeValue))) {
				wrap = true;
			}
			run.push(nodes[i].childNodes[j]);
		}
		if (run.length && need && wrap) {
			$(run).wrapAll('<div class="unwrap"></div>');
		}
	}

	var ps = [];
	if (sel) {
		var tns = findTextNodes(editor.get(0));
		var s = findTextNodes(sel.getStart())[0];
		var e = findTextNodes(sel.getEnd())[0];
		var in_s = false;
		for (var i=0 ; i<tns.length ; ++i) {
			if (tns[i] == s) {
				in_s = true;
			}
			if (in_s) {
				ps.push(tns[i]);
			}
			if (tns[i] == e) {
				break;
			}
		}
		ps = $(ps).closest(tnjq).get();
	}
	else {
		ps = $(findTextNodes(editor.get(0))).closest(tnjq).get();
	}

	var text = '';
	for (var i=0 ; i<ps.length ; ++i) {
		var p = $(ps[i]);
		var ptxt = p.clone();
		var nt = 0;
		var did = true;
		for (var j=0 ; j<100 && did ; ++j) {
			did = false;
			ptxt.find(itjq).each(function() {
				var t = $(this);
				var nn = this.nodeName.toLowerCase();
				if ($.trim(t.text())) {
					++nt;
					t.replaceWith('[STYLE:'+nn+':'+nt+']'+t.html()+'[/STYLE:'+nn+':'+nt+']');
				}
				else {
					t.remove();
				}
				did = true;
			});
		}
		ptxt = $.trim(ptxt.html().replace(/<br\/?\s*>/g, '\n').replace(/<[^>]+>/g, '').replace(/\[(STYLE:\w+:\w+)\]/g, '<$1>').replace(/\[(\/STYLE:\w+:\w+)\]/g, '<$1>'));
		if (!ptxt) {
			continue;
		}
		var id = i+1;
		p.attr('id', 's'+id);
		text += "<s" + id + ">\n" + decHTML(ptxt) + "\n</s" + id + ">\n\n";

		if (text.length >= 4096) {
			to_send.push(text);
			text = '';
		}
	}
	to_send.push(text);

	if (!text && !to_send.length) {
		return;
	}
	send_text();
}
