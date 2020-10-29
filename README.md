# Vitec MV Grammateket Frontend
Requires at least PHP 7.0, but at most 7.1. Crashes with Azure's 7.2 for some reason.

The frontend is stateless and can be killed or launched at will. Because of the sensitive information stored in the environment, there is no phpinfo() debug file.

The frontend includes a health check in the form of selfcheck.php, which will send a random sentence to the backend and report back with a non-error status code if it's working as expected.

## Environment Variables / App Settings
* `DEBUG_KEY`	URL-safe string that can be passed to selftest.php?key= to get around DDoS protection; defaults to nothing, which means selftest is disabled
* `GRAMMAR_DA_HOST`	Hostname for the Danish grammar backend; defaults to *localhost*
* `GRAMMAR_DA_PORT`	TCP port that the Danish grammar backend is listening on; defaults to *13400*
* `GRAMMAR_NB_HOST`	Hostname for the Norwegian Bokmål grammar backend; defaults to *localhost*
* `GRAMMAR_NB_PORT`	TCP port that the Norwegian Bokmål grammar backend is listening on; defaults to *13500*
* `GRAMMAR_SV_HOST`	Hostname for the Swedish grammar backend; defaults to *localhost*
* `GRAMMAR_SV_PORT`	TCP port that the Swedish grammar backend is listening on; defaults to *13600*
* `COMMA_HOST`	Hostname for the comma backend; defaults to *localhost*
* `COMMA_PORT`	TCP port that the comma backend is listening on; defaults to *13300*
* `COMMA_URL`	*NOT IN USE* Full URL to the Kommaforslag frontend. If defined, this enables users sending their text to the Kommaforslag service.
* `MVID_SERVICE`	MV-ID service name; defaults to *grammateket*
* `MVID_SECRET`	MV-ID secret
* `MVID_ACCESS_IDS`	Comma-separated list of AIs that grant access to this service; defaults to *product.web.da.grammarsuggestions.release,product.web.sv.grammarsuggestions.release,product.web.nb.grammarsuggestions.release*
* `CADUCEUS_URL`	WebSocket URL to the Caduceus message broker; defaults to *`ws://localhost:3000/`*
* `CADUCEUS_SECRET`	Caduceus secret; defaults to the server's hostname
* `GOOGLE_AID`	Google Analytics Property ID
* `HMAC_SERVICE`	HMAC field to distinguish which service it pertains to; defaults to *grammar*
* `MV_SIGNON_HOST`	Defaults to *signon.vitec-mv.com*
* `MV_SIGNON_API_HOST`	Defaults to *mvidsignonapi.vitec-mv.com*
* `MV_IW_DICT_HOST`	Defaults to *online-mvid-dev.intowords.com*
* `MV_IW_ONLINE_HOST`	Defaults to *online-mvid-dev.intowords.com*
* `MV_TEST`	If set to *1*, the `MV_*_HOST` settings default to their testing equivalents instead; defaults to *0*

## Embedded Dependencies
This repo includes copies of:
* `textalk/websocket`: https://github.com/Textalk/websocket-php - MIT license
* `jquery-scrollintoview`: https://github.com/litera/jquery-scrollintoview - MIT license

## External Dependencies
The code pulls in these external dependencies:
* `TinyMCE`: Version 4.3 via [TinyMCE CDN](https://www.tinymce.com/download/)
* `jQuery`: Version 1.12.4 via [Google Hosted Libraries](https://developers.google.com/speed/libraries/)
* `Bootstrap`: Version 3.3.7 via [MaxCDN](http://getbootstrap.com/getting-started/#download-cdn)
