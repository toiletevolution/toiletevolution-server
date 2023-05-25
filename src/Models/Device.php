<?php
namespace ToiletEvolution\Models;

use ToiletEvolution\Models\Entities\DeviceEntity;

/**
 * Device Model Class
 */
class Device
{
  private $dataStore;
  private $redis;

  public function __construct($dataStore, $redis)
  {
    $this->dataStore = $dataStore;
    $this->dataStore->setEntityClass(DeviceEntity::class);
    $this->redis = $redis;
  }

  public function createEntity($properties = null, $created_by = null)
  {
    $device = $this->dataStore->createEntity();
    if(!empty($properties)) {
      $device->name       = $properties['name'];
      $device->password   = password_hash($properties['password'], PASSWORD_DEFAULT);
      $device->thresholds = json_encode($properties['thresholds']);
      $device->latitude   = $properties['location']['latitude'];
      $device->longitude  = $properties['location']['longitude'];
      $device->created_at = new \DateTime();
      $device->created_by = $created_by->getKeyId();
    }
    return $device;
  }

  public function save($device) {
    $this->dataStore->upsert($device);
    $this->redis->set("device:id:{$device->getKeyId()}", serialize($device));
    $this->redis->del("device:all");
    $this->redis->del("device:all:created_by:{$device->created_by}");
    return $device;
  }

  public function byCreatedBy($user) {
    $devices = $this->redis->get("device:all:created_by:{$user->getKeyId()}");
    if($devices === false || $devices === null) {
      $devices = $this->dataStore->fetchAll("SELECT * FROM Devices WHERE created_by = @createdBy", ['createdBy' => $user->getKeyId()]);
      $this->redis->set("device:all:created_by:{$user->getKeyId()}", serialize($devices));
    } else {
      $devices = unserialize($devices);
    }
    return $this->createResultSets($devices);
  }

  public function byId($id) {
    $device = $this->redis->get("device:id:{$id}");
    if($device === false || $device === null) {
      $device = $this->dataStore->fetchById($id);
      $this->redis->set("device:id:{$device->getKeyId()}", serialize($device));
    } else {
      $device = unserialize($device);
    }
    return $this->createResultSet($device);
  }

  public function byIdAndCreatedBy($id, $user) {
    $device = $this->byId($id);
    if($device->created_by !== $user->getKeyId()) {
      $device = null;
    }
    return $device;
  }

  public function all() {
    $devices = $this->redis->get("device:all");
    if($devices === false || $devices === null) {
      $devices = $this->dataStore->fetchAll();
      $this->redis->set("device:all", serialize($devices));
    } else {
      $devices = unserialize($devices);
    }
    return $this->createResultSets($devices);
  }

  public function validate($data) {
    // Validate
    $validator = new \JsonSchema\Validator;
    $validator->validate($data, (object)['$ref' => 'file://' . realpath(__DIR__.'/Schemas/DeviceSchema.json')]);
    $valid = $validator->isValid();
    return $valid;
  }

  public function delete($device) {
    $this->redis->del([
      "device:id:{$device->getKeyId()}",
      "device:all",
      "device:all:created_by:{$device->created_by}",
    ]);

    return $this->dataStore->delete($device);
  }

  private function createResultSets($entities) {
    return array_map(function($entity) {
      return $this->createResultSet($entity);
    }, $entities);
  }

  private function createResultSet($entity) {
    if(!empty($entity)) {
      $entity->thresholds = json_decode($entity->thresholds);
    }
    return $entity;
  }
}
