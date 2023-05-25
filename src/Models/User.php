<?php
namespace ToiletEvolution\Models;

/**
 * User Model Class
 */
class User
{
  private $dataStore;
  private $redis;
  private $freezer;

  public function __construct($dataStore, $redis)
  {
    $this->dataStore = $dataStore;
    $this->redis = $redis;
  }

  public function createEntity($properties = null)
  {
    return $this->dataStore->createEntity($properties);
  }

  public function byToken($authToken)
  {
    $result = $this->redis->get("user:auth_token:{$authToken}");
    if($result === false || $result === null) {
      $result = $this->dataStore->fetchOne("SELECT * FROM Users WHERE auth_token = @authToken", [
        'authToken' => $authToken
      ]);
    } else {
      $result = unserialize($result);
    }
    return $result;
  }

  public function byRemoteId($remoteId)
  {
    $result = $this->redis->get("user:remote_id:{$remoteId}");
    if($result === false || $result === null) {
      syslog(LOG_DEBUG, "User({$remoteId}) is not found in Cache.");
      $result = $this->dataStore->fetchOne("SELECT * FROM Users WHERE remote_id = @remoteId", [
        'remoteId' => $remoteId
      ]);
    } else {
      $result = unserialize($result);
    }
    return $result;
  }

  public function save($user) {
    $this->dataStore->upsert($user);
    $this->redis->set("user:auth_token:{$user->auth_token}", serialize($user));
    $this->redis->set("user:remote_id:{$user->remote_id}", serialize($user));
    return $user;
  }
}
