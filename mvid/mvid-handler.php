<?php
  require_once __DIR__."/mvid-challenge.php";
  require_once __DIR__."/config/mvid-config.php";

  $mvid_app_domain = read_config(Array("mvid","challenge","domain"));
  $mvid_shared_key = read_config(Array("mvid","challenge","shared_key"));
  $mvid_redirect_on_success = read_config(Array("mvid","challenge","redirect_on_success"));
  $mvid_redirect_on_failure = read_config(Array("mvid","challenge","redirect_on_failure"));
  $mvid_storage_type = read_config(Array("mvid","storage","type"),"cookie");
  $mvid_storage_name = read_config(Array("mvid","storage","name"),"mv_session_id");
  $mvid_default_env = read_config(Array("mvid","environment","environment"),"");
  $mvid_default_context = read_config(Array("mvid","environment","context"),"");

  $mvid_default_url = "https://signon.mv-nordic.com";
  $mvid_env_list = array(
    "dev" => "https://signon-dev.mv-nordic.com",
    "test" => "https://signon-test.mv-nordic.com"
  );

  if(isset($mvidEnv) && isset($mvid_env_list[$mvidEnv])) {
    $mvid_url = $mvid_env_list[$mvidEnv];
  }
  else if($mvid_default_env != "" && isset($mvid_env_list[$mvid_default_env])) {
    $mvid_url = $mvid_env_list[$mvid_default_env];
  }
  else {
    $mvid_url = $mvid_default_url;
  }

  $mvid_context = isset($mvidContext) ? $mvidContext : $mvid_default_context;

  if($mvid_url != $mvid_default_url && (!isset($_COOKIE["mvid-current-context"]) || $_COOKIE["mvid-current-context"] != $mvid_context || !isset($_COOKIE["mvid-current-url"]) || $_COOKIE["mvid-current-url"] != $mvid_url)) {
    setcookie("mvid-current-context",$mvid_context);
    setcookie("mvid-current-url",$mvid_url);
    if(isset($_SERVER["HTTP_X_FORWARDED_URL_ORIG"])) $full_url = $_SERVER["HTTP_X_FORWARDED_URL_ORIG"].(isset($_SERVER["QUERY_STRING"]) && $_SERVER["QUERY_STRING"] != "" ? "?".$_SERVER["QUERY_STRING"] : "");
    else $full_url = "http".((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? "s" : "") . "://". $_SERVER["HTTP_HOST"].$_SERVER["REQUEST_URI"];
    header("Location: ".$mvid_url."/web-deploy-tools/context/set/".$mvid_context."?redirect=".$full_url);
    exit();
  }

  $storage_class = NULL;

  if(@include __DIR__."/sessionstorage/$mvid_storage_type.php") {
    $storage_class = $mvid_storage_type."SessionStorage";
    $storage_class = new $storage_class;
  }
  if ($storage_class===NULL) {
    $error_message = "The storage type: $mvid_storage_type is not available.";
  }

  if (isset($_POST["mv_session_hash"])) {

    // A session hash was recieved from MV-ID either after a doLogin() or a doSSO()
    $success = false;
    if ($storage_class!==NULL) {
      // Register the session hash for application usage:

      $serviceUrl = $mvid_url."/session-security/SessionSecurity/jsonwsp/description";
      $serviceCookies = array();
      if($mvid_url != $mvid_default_url && $mvid_context != "") {
        $serviceCookies["dev-context-ssl"] = $mvid_context;
      }

      $success = registerSessionUsage($_POST["mv_session_hash"],$mvid_app_domain,$mvid_shared_key,$$mvid_storage_name,$error_message,$serviceUrl,($mvid_url != $mvid_default_url),$serviceCookies);

    }

    if ($success) {
      $storage_class->save($mvid_storage_name,$$mvid_storage_name);

      if ($mvid_redirect_on_success !== NULL) {
        header("Location: $mvid_redirect_on_success") ;
      }
    }
    else {
      if ($mvid_redirect_on_failure !== NULL) {
        header("Location: $mvid_redirect_on_failure?error_message=".urlencode($error_message)) ;
      }
      else {
        echo "Error: ".$error_message;
        exit(0);
      }
    }
  }
  else {
    if ($storage_class===NULL) {
      echo "Error: ".$error_message;
      exit(0);
    }
    else {
      $$mvid_storage_name = $storage_class->load($mvid_storage_name);
    }
  }
