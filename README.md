# MV-Nordic Grammatikforslag Frontend
Requires at least PHP 7.0.

The frontend is stateless and can be killed or launched at will. Because of the sensitive information stored in the environment, there is no phpinfo() debug file.

The frontend includes a health check in the form of selfcheck.php, which will send a random sentence to the backend and report back with a non-error status code if it’s working as expected.

## Environment Variables / App Settings
* `DEBUG_KEY`	URL-safe string that can be passed to selftest.php?key= to get around DDoS protection; defaults to nothing, which means selftest is disabled
* `DANPROOF_HOST`	Hostname for the backend; defaults to *localhost*
* `DANPROOF_PORT`	TCP port that the backend is listening on; defaults to *13400*
* `MVID_SHARED_KEY`	MV-ID shared key config entry
* `MVID_DOMAIN`	MV-ID domain config entry
* `MVID_ACCESS_IDS`	Comma-separated list of AIs that grant access to this service; defaults to *product.web.da.grammarsuggestions.release*
* `GOOGLE_AID`	Google Analytics Property ID

## Embedded Dependencies
This repo includes copies of:
* `mvid-php`: https://github.com/TinoDidriksen/mvid-php (a fork of https://github.com/mikrov/mvid-php)
* `jquery-scrollintoview`: https://github.com/litera/jquery-scrollintoview - MIT license
* `js-cookie`: https://github.com/js-cookie/js-cookie - MIT license

## External Dependencies
The code pulls in these external dependencies:
* `TinyMCE`: Version 4.3 via [TinyMCE CDN](https://www.tinymce.com/download/)
* `jQuery`: Version 1.12.4 via [Google Hosted Libraries](https://developers.google.com/speed/libraries/)
* `Bootstrap`: Version 3.3.7 via [MaxCDN](http://getbootstrap.com/getting-started/#download-cdn)
