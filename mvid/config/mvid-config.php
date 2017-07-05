<?php

  global $mvid_config;

  $mvid_config = Array(
    "mvid" => Array(

      "challenge" => Array(

        /* Type in the shared key you recieved from MV-ID after you registered your application domain. If you havn't
           registered your application domain yet there is a form you can fill in at:
             https://signon.mv-nordic.com/wiki/SignUp */
        "shared_key" => $GLOBALS['-config']['MVID_SHARED_KEY'],

        /* The domain you wish to register the user sessions with. The base domain of this value must match the
           application domain you have registered with MV-ID */
        "domain" => $GLOBALS['-config']['MVID_DOMAIN'],

        "redirect_on_success" => './login.php',
        "redirect_on_failure" => './error.php',),

      "environment" => Array(

        /* Determines what mv-id environment to use as default. Default is empty value which will use the production environment.
           Other values are dev and test, they will resolve to their designated development and test urls.
           If this is set, context should also be used, or the application might not reach a valid mv-id instance
           This config value can be overridden by defining the variable $mvidEnv before the mvid-handler is included. */
        "environment" => "",

        /* Sets the context to use on the dev or test environments. Each environment can have multiple named contexts running on them
           and to reach a specific one, this context is used.
           This config value can be overridden by defining the variable $mvidContext before the mvid-handler is included.*/
        "context" => "",

      ),

      "storage" => Array(
        /* The identifier name to store the mv_session_id with.

           Default: "mv_session_id" */
        "name" => "mv_session_id",


        /* Choose how to store the mv_session_id:
           1. "cookie"   - If you plan to develope an application that communicates with MV-ID's webservices via javascript
                           you must store the mv_session_id as a session cookie on the client's browser.

           2. "php"      - On the other hand, if yuo are going to do all communications to MV-ID's webservices from the
                           serverside, you might as well store the mv_session_ids as a PHP session variable.

           3. "memcache" - If you have more than one backend webserver and want to do communication with MV-ID's webservices
                           on the serverside you might concider using a memcache server for storing mv_session_ids. That
                           way you can share it between you backend webservers effortlessly.

           4.            - If you want to store your mv_session_id a completely different way you can extend the with a new
                           session storage class by adding it in the directory sessionstorage.

           Default: "cookie" */
        "type" => "cookie",

        /* Memcache storage type */
        "memcache" => Array(
          "server" => "<memcache-host>",
          //"port" => 11211,
          //"timeout" => 3600
        )
      )
    )
  );

  // This config tool expects the existence of a key-value array called $mvid_config. See the example config.php
  // File in config/config.php
  function read_config($path,$default_val=NULL) {
    global $mvid_config;
    $current_crumb = $mvid_config;
    foreach ($path as $k => $v) {
      if (isset($current_crumb[$v])) {
        $current_crumb = $current_crumb[$v];
      }
      else {
        if (isset($default_val)) {
          return $default_val;
        }
        return NULL;
      }
    }
    return $current_crumb;
  }
