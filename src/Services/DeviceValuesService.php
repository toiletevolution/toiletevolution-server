<?php
namespace ToiletEvolution\Services;

interface DeviceValuesService {
  public function __construct($bucketName);
  public function getFileName($id);
}
