<?php

  require_once __DIR__."/_base.php";

  class cookieSessionStorage extends MVID_SessionStorage {
    public function save($storage_name,$mv_session_id) {
      setcookie($storage_name,$mv_session_id);
      return true;
    }

    public function load($storage_name) {
      if (isset($_COOKIE[$storage_name])) {
        return $_COOKIE[$storage_name];
      }
      return NULL;
    }
  }
