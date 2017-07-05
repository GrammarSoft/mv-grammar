<?php

  require_once __DIR__."/_base.php";

  class phpSessionStorage extends MVID_SessionStorage {
    public function save($storage_name,$mv_session_id) {
      session_start();
      $_SESSION[$storage_name] = $mv_session_id;
      return true;
    }
    public function load($storage_name) {
      session_start();
      if (isset($_SESSION[$storage_name])) {
        return $_SESSION[$storage_name];
      }
      return NULL;
    }
  }
