<?php
namespace ToiletEvolution\Controllers\Admin;

use Interop\Container\ContainerInterface;
use ToiletEvolution\Models\Device;
use ToiletEvolution\Services\DeviceService;

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
    $user = $this->ci->get('session')->get('current_user');

    $data = array_map(function($device) {
      return $device->toArrayWithoutSecret();
    }, $deviceModel->byCreatedBy($user));

    return $response->withJson($data);
  }

  public function add($request, $response, $args)
  {
    $user = $this->ci->get('session')->get('current_user');
    $parsedBody = $request->getParsedBody();
    $service = $this->ci->get(DeviceService::class);

    // Validate Request
    if(!$service->validate($parsedBody)) {
      return $response->withStatus(400);
    }
    // Build a new entity
    $device = $service->createDevice($parsedBody, $user);

    return $response->withStatus(201);
  }

  public function get($request, $response, $args)
  {
    $deviceModel = $this->ci->get(Device::class);
    $user = $this->ci->get('session')->get('current_user');

    $device = $deviceModel->byIdAndCreatedBy($args['id'], $user);
    if(!empty($device)) {
      $data = $device->toArrayWithoutSecret();
    }

    return $response->withJson($data, empty($data)?404:200);
  }

  public function delete($request, $response, $args)
  {
    $result = 404;
    $deviceModel = $this->ci->get(Device::class);
    $user = $this->ci->get('session')->get('current_user');

    $device = $deviceModel->byIdAndCreatedBy($args['id'], $user);
    if(!empty($device)) {
      $result = $deviceModel->delete($device) ? 200 : 500;
    }

    return $response->withStatus($result);
  }

}
