<?php
namespace ToiletEvolution\Controllers;

use ToiletEvolution\Models\Device;
use Interop\Container\ContainerInterface;
use Carbon\Carbon;

class DevicesController
{
  protected $ci;

  public function __construct(ContainerInterface $ci)
  {
    $this->ci = $ci;
  }

  public function index($request, $response, $args)
  {
    $deviceModel = $this->ci->get(Device::class);

    $data = array_map(function($device) {
      return $device->toArrayWithoutSecret();
    }, $deviceModel->all());

    return $response->withJson($data, empty($data)?204:200);
  }

  public function get($request, $response, $args)
  {
    $deviceModel = $this->ci->get(Device::class);
    $device = $deviceModel->byId($args['id']);

    if(!empty($device)) {
      $data = $device->toArrayWithoutSecret();
    }

    return $response->withJson($data, empty($data)?404:200);
  }

}