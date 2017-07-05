<?php

  abstract class MVID_SessionStorage {
    /* Reimplement save() in your specialization class.
       it should save the $mv_session_id using the identifier name
       $storage_name. For instance if it were a cookie storage it would
       look someting like this:

         setcookie($mvid_storage_name,$mv_session_id);

       if the operation is successful return true. Otherwise if it could
       not succeed (ie. the storage medium did not respond), then the
       method should return false.

    */
    abstract public function save($storage_name,$mv_session_id);

    /* Reimplement load() in your specialization class.
       it should load the $mv_session_id using the identifier name
       $storage_name. For instance if it were a cookie storage it would
       look someting like this:

         return $_COOKIE[$mvid_storage_name];

       if the operation is successful return the mv_session_id. Otherwise
       if it could not succeed (ie. no session ID was available), then the
       method should return NULL.
    */
    abstract public function load($storage_name);

  }
