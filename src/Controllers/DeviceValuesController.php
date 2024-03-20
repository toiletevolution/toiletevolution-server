<?php
namespace ToiletEvolution\Controllers;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use ToiletEvolution\Renderer\JsonRenderer;
use Carbon\Carbon;
use ToiletEvolution\Services\DeviceValuesService;

class DeviceValuesController
{
  protected ContainerInterface $ci;
  private $redis;
  private DeviceValuesService $deviceValuesService;
  private JsonRenderer $renderer;

  public function __construct(ContainerInterface $ci)
  {
    $this->ci = $ci;
    $this->redis = $this->ci->get(\Redis::class);
    $this->deviceValuesService = $this->ci->get(DeviceValuesService::class);
    $this->renderer = new JsonRenderer();
  }

  public function get(ServerRequestInterface $request, ResponseInterface $response, array $args)
  {
    $id = $args['id'];
    $fileName = $this->deviceValuesService->getFileName($id);

    $cache = $this->redis->get($fileName);
    if ($cache === false) {
      if(file_exists($fileName)) {
        $data = json_decode(file_get_contents($fileName), true);
      } else {
        $data = [];
      }
    } else {
      $cache = unserialize($cache);
      $data = $cache['data'];
    }

    $expired = Carbon::now();
    $expired->subMinutes(5);
    $filtered = array_values(array_filter($data, function($item) use($expired) {
      if(empty($item['created'])) {
        return false;
      }
      $date = Carbon::parse($item['created']);
      return $date->gt($expired);
    }));

    return $this->renderer->json($response, $filtered)->withStatus(empty($filtered)?204:200);
  }

  public function add(ServerRequestInterface $request, ResponseInterface $response, array $args)
  {
    $id = $args['id'];
    $fileName = $this->deviceValuesService->getFileName($id);
    $cacheCount = 0;

    $cache = $this->redis->get($fileName);
    if ($cache === false) {
      if(file_exists($fileName)) {
        $data = json_decode(file_get_contents($fileName), true);
      } else {
        $data = [];
      }
    } else {
      $cache = unserialize($cache);
      $data = $cache['data'];
      $cacheCount = $cache['count'];
    }

    $expired = Carbon::now();
    $expired->subMinutes(5);
    $filtered = array_values(array_filter($data, function($item) use($expired) {
      if(empty($item['created'])) {
        return false;
      }
      $date = Carbon::parse($item['created']);
      return $date->gt($expired);
    }));

    $payload = $request->getParsedBody();

    $filtered[] = ['payload' => $payload, 'created' => Carbon::now()->toAtomString()];

    if ($cacheCount === 0) {
      file_put_contents($fileName, json_encode($filtered));
      $cacheCount = 30;
    }
    $this->redis->set($fileName, serialize(['data' => $filtered, 'count' => ($cacheCount - 1)]));

    return $response->withStatus(201);
  }
}
