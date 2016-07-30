<?php
namespace ToiletEvolution\Models;

use ToiletEvolution\Models\Entities\DeviceEntity;

/**
 * Device Model Class
 */
class Device
{
  private $dataStore;
  private $memcache;

  public function __construct($dataStore, $memcache)
  {
    $this->dataStore = $dataStore;
    $this->dataStore->setEntityClass(DeviceEntity::class);
    $this->memcache = $memcache;
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
    $this->memcache->set("device:id:{$device->getKeyId()}", $device);
    $this->memcache->delete("device:all");
    $this->memcache->delete("device:all:created_by:{$device->created_by}");
    return $device;
  }

  public function byCreatedBy($user) {
    $devices = $this->memcache->get("device:all:created_by:{$user->getKeyId()}");
    if($devices === false) {
      $devices = $this->dataStore->fetchAll("SELECT * FROM Devices WHERE created_by = @createdBy", ['createdBy' => $user->getKeyId()]);
      $this->memcache->set("device:all:created_by:{$user->getKeyId()}", $devices);
    }
    return $this->createResultSets($devices);
  }

  public function byId($id) {
    $device = $this->memcache->get("device:id:{$id}");
    if($device === false) {
      $device = $this->dataStore->fetchById($id);
      $this->memcache->set("device:id:{$device->getKeyId()}", $device);
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
    $devices = $this->memcache->get("device:all");
    if($devices === false) {
      $devices = $this->dataStore->fetchAll();
      $this->memcache->set("device:all", $devices);
    }
    return $this->createResultSets($devices);
  }

  public function validate($data) {
    $refResolver = new \JsonSchema\RefResolver(new \JsonSchema\Uri\UriRetriever(), new \JsonSchema\Uri\UriResolver());
    $schema = $refResolver->resolve('file://' . realpath(__DIR__.'/Schemas/DeviceSchema.json'));
    // Validate
    $validator = new \JsonSchema\Validator();
    $validator->check($data, $schema);

    $valid = $validator->isValid();
    return $valid;
  }

  public function delete($device) {
    $this->memcache->deleteMulti([
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
