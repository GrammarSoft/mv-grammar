<?php
  require_once __DIR__."/jsonwspclient.php";

  // MV-ID integration
  // -----------------
  // In order to use MV-ID's web services you must register user sessions using the SessionSecurity
  // web service method registerSessionUsage():
  //
  //   https://signon.mv-nordic.com/session-security/SessionSecurity
  //
  // This method is a challenge-response mechanism, that ensures that only a registered application
  // server can create a valid mv_session_id. It takes the following arguments:
  // 1. The mv_session_hash recieved after successful login.
  // 2. The domain name registered for the application.
  // 3. Shared key to use to make mv_session_id
  // 4. mv_session_id the variable that the session id is saved to
  // 5. A variable where the error_message is stored, if any
  // 6. A service url if another service besides the standard signon.mv-nordic.com service should be used, if empty the standard url will be used (optional)
  // 7. If ssl warnings from the webservice should be ignored by the client, set true to ignore (not recommended)
  // 8. Array of cookies to use send with the registration response
  //
  // The result of this call is a generated nonce value to salt the challenge response. Now there
  // are 3 values known by both MV-ID and the application server: mv_session_hash, nonse and the
  // key shared registed with the domain. The mv_session_id is calculated as follows:
  //
  //   $mv_session_id = md5($mv_session_hash.$nonce.$shared_key);

  function registerSessionUsage($mv_session_hash,$domain,$shared_key,&$mv_session_id,&$error_message,$serviceUrl="",$ignoreSSLWarnings=false,$cookies=null) {

    // Connect to MV-ID's session security service to register a valid application session
    $client = new JsonWspClient(trim($serviceUrl) != "" ? $serviceUrl : "https://signon.mv-nordic.com/session-security/SessionSecurity/jsonwsp/description",$ignoreSSLWarnings,$cookies);
    $client->setViaProxy(true);

    // Send registration request
    $response = $client->CallMethod("registerSessionUsage",array("mv_session_hash" => $mv_session_hash, "domain" => $domain));
    if($response->getJsonWspType() == JsonWspType::Response && $response->getCallResult() == JsonWspCallResult::Success) {
      // Get recieve a server-to-server nonse in order to respond to MV-ID's challenge
      $responseJson = $response->getJsonResponse();
      $result = $responseJson["result"];
      if ($result["method_result"]["res_code"]!=0) {
        $error_message = $result["method_result"]["res_msg"];
        return false;
      }
      $nonce = $result["nonce"];

      // Build mv_session_id and store it as a cookie
      $mv_session_id = md5($mv_session_hash.$nonce.$shared_key);
      return true;
    }
    else if($response->getJsonWspType() == JsonWspType::Fault) {
      // Handle service fault here
      $error_message = "Service fault: ".$response->getServiceFault()->getString();
      return false;
    }
  }
