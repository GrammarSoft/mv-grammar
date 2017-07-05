<?php

  require_once __DIR__."/_base.php";
  require_once __DIR__."/../config/mvid-config.php";

  class memcacheSessionStorage extends MVID_SessionStorage {
    public function save($storage_name,$mv_session_id) {
      $mc_server = read_config(Array("mvid","storage","memcache","server"),"localhost");
      $mc_port = read_config(Array("mvid","storage","memcache","port"),11211);
      $mc_timeout = read_config(Array("mvid","storage","memcache","timeout"),3600);
      $memcache = new Memcache;
      if (!$memcache->connect($mc_server, $mc_port)) {
        return false;
      }
      session_start();
      return $memcache->set(session_id()."_$storage_name", $mv_session_id, false, $mc_timeout);
    }

    public function load($storage_name) {
      $mc_server = read_config(Array("mvid","storage","memcache","server"),"localhost");
      $mc_port = read_config(Array("mvid","storage","memcache","port"),11211);
      $mc_timeout = read_config(Array("mvid","storage","memcache","timeout"),3600);
      session_start();
      $memcache = new Memcache;
      if (!$memcache->connect($mc_server, $mc_port)) {
        return NULL;
      }
      $mv_session_id = $memcache->get(session_id()."_$storage_name");

      if ($mv_session_id) {
        return $mv_session_id;
      }
      return NULL;
    }

  }
