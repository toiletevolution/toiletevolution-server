<?php
namespace ToiletEvolution\Models;

/**
 * User Model Class
 */
class User
{
  private $dataStore;
  private $memcache;
  private $freezer;

  public function __construct($dataStore, $memcache)
  {
    $this->dataStore = $dataStore;
    $this->memcache = $memcache;
  }

  public function createEntity($properties = null)
  {
    return $this->dataStore->createEntity($properties);
  }

  public function byToken($authToken)
  {
    $result = $this->memcache->get("user:auth_token:{$authToken}");
    if($result === false) {
      $result = $this->dataStore->fetchOne("SELECT * FROM Users WHERE auth_token = @authToken", [
        'authToken' => $authToken
      ]);
    }
    return $result;
  }

  public function byRemoteId($remoteId)
  {
    $result = $this->memcache->get("user:remote_id:{$remoteId}");
    if($result === false) {
      syslog(LOG_DEBUG, "User({$remoteId}) is not found in Cache.");
      $result = $this->dataStore->fetchOne("SELECT * FROM Users WHERE remote_id = @remoteId", [
        'remoteId' => $remoteId
      ]);
    }
    return $result;
  }

  public function save($user) {
    $this->dataStore->upsert($user);
    $this->memcache->set("user:auth_token:{$user->auth_token}", $user);
    $this->memcache->set("user:remote_id:{$user->remote_id}", $user);
    return $user;
  }
}
