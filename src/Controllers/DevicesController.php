<?php
namespace ToiletEvolution\Controllers;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use ToiletEvolution\Renderer\JsonRenderer;
use ToiletEvolution\Models\Device;

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

    $data = array_map(function($device) {
      return $device->toArrayWithoutSecret();
    }, $deviceModel->all());

    return $this->renderer->json($response, $data)->withStatus(empty($data)?204:200);
  }

  public function get(ServerRequestInterface $request, ResponseInterface $response, array $args)
  {
    $deviceModel = $this->ci->get(Device::class);
    $device = $deviceModel->byId($args['id']);

    if(!empty($device)) {
      $data = $device->toArrayWithoutSecret();
    }

    return $this->renderer->json($response, $data)->withStatus(empty($data)?404:200);
  }

}
