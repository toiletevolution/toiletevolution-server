<?php
namespace ToiletEvolution\Services;

use ToiletEvolution\Services\DeviceValuesService;

class DeviceValuesServiceGsImpl implements DeviceValuesService
{
  private $bucketName;

  public function __construct($bucketName)
  {
    $this->bucketName = $bucketName;
  }

  public function getFileName($id) {
    return "gs://{$this->bucketName}/{$id}.json";
  }
}
