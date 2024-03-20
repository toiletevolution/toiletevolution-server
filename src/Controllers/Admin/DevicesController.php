<?php
namespace ToiletEvolution\Controllers\Admin;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use ToiletEvolution\Renderer\JsonRenderer;
use ToiletEvolution\Models\Device;
use ToiletEvolution\Services\DeviceService;

class DevicesController
{
  protected ContainerInterface $ci;
  private JsonRenderer $renderer;

  public function __construct(ContainerInterface $ci)
  {
    $this->ci = $ci;
    $this->renderer = new JsonRenderer();
  }

  public function index(ServerRequestInterface $request, ResponseInterface $response, array $args)
  {
    $deviceModel = $this->ci->get(Device::class);
    $user = $this->ci->get('session')->get('current_user');

    $data = array_map(function($device) {
      return $device->toArrayWithoutSecret();
    }, $deviceModel->byCreatedBy($user));

    return $this->renderer->json($response, $data)->withStatus(200);
  }

  public function add(ServerRequestInterface $request, ResponseInterface $response, array $args)
  {
    $user = $this->ci->get('session')->get('current_user');
    $parsedBody = $request->getParsedBody();
    $service = $this->ci->get(DeviceService::class);

    // Validate Request
    if(!$service->validate($parsedBody)) {
      return $response->withStatus(400);
    }
    // Build a new entity
    $service->createDevice($parsedBody, $user);

    return $response->withStatus(201);
  }

  public function get(ServerRequestInterface $request, ResponseInterface $response, array $args)
  {
    $deviceModel = $this->ci->get(Device::class);
    $user = $this->ci->get('session')->get('current_user');

    $device = $deviceModel->byIdAndCreatedBy($args['id'], $user);
    if(!empty($device)) {
      $data = $device->toArrayWithoutSecret();
    }

    return $this->renderer->json($response, $data)->withStatus(empty($data)?404:200);
  }

  public function delete(ServerRequestInterface $request, ResponseInterface $response, array $args)
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
