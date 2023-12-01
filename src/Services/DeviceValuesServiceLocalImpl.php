<?php
namespace ToiletEvolution\Services;

use ToiletEvolution\Services\DeviceValuesService;

class DeviceValuesServiceLocalImpl implements DeviceValuesService
{
  private $bucketName;
  private $root;

  public function __construct($bucketName)
  {
    $this->bucketName = $bucketName;
    $this->root = sys_get_temp_dir();
  }

  public function setRoot($dir) {
    $this->root = $dir;
  }

  public function getFileName($id) {
    $dir = $this->root . DIRECTORY_SEPARATOR . $this->bucketName;
    if (!file_exists($dir)) mkdir($dir);
    return $dir . DIRECTORY_SEPARATOR . "{$id}.json";
  }
}
