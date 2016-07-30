<?php
namespace ToiletEvolution\Services;

class DeviceService
{

  public function __construct($model)
  {
    $this->model = $model;
  }

  public function createDevice($properties, $createdBy)
  {
    // create and save a new device
    $device = $this->model->createEntity($properties, $createdBy);
    $this->model->save($device);

    return $device;
  }

  public function validate($properties)
  {
    $json = json_decode(json_encode($properties));
    return $this->model->validate($json);
  }
}
