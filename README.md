# MV-Nordic Grammateket Frontend
Requires at least PHP 7.0, but at most 7.1. Crashes with Azure's 7.2 for some reason.

The frontend is stateless and can be killed or launched at will. Because of the sensitive information stored in the environment, there is no phpinfo() debug file.

The frontend includes a health check in the form of selfcheck.php, which will send a random sentence to the backend and report back with a non-error status code if it's working as expected.

## Environment Variables / App Settings
* `DEBUG_KEY`	URL-safe string that can be passed to selftest.php?key= to get around DDoS protection; defaults to nothing, which means selftest is disabled
* `DANPROOF_HOST`	Hostname for the backend; defaults to *localhost*
* `DANPROOF_PORT`	TCP port that the backend is listening on; defaults to *13400*
* `COMMA_URL`	Full URL to the Kommaforslag frontend. If defined, this enables users sending their text to the Kommaforslag service.
* `MVID_SERVICE`	MV-ID service name; defaults to *grammateket*
* `MVID_SECRET`	MV-ID secret
* `MVID_ACCESS_IDS`	Comma-separated list of AIs that grant access to this service; defaults to *product.web.da.grammarsuggestions.release*
* `GOOGLE_AID`	Google Analytics Property ID

## Embedded Dependencies
This repo includes copies of:
* `jquery-scrollintoview`: https://github.com/litera/jquery-scrollintoview - MIT license

## External Dependencies
The code pulls in these external dependencies:
* `TinyMCE`: Version 4.3 via [TinyMCE CDN](https://www.tinymce.com/download/)
* `jQuery`: Version 1.12.4 via [Google Hosted Libraries](https://developers.google.com/speed/libraries/)
* `Bootstrap`: Version 3.3.7 via [MaxCDN](http://getbootstrap.com/getting-started/#download-cdn)
