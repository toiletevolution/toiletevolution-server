<?php
namespace ToiletEvolution\Controllers;

use Interop\Container\ContainerInterface;
use Carbon\Carbon;
use ToiletEvolution\Services\DeviceValuesService;

class DeviceValuesController
{
  protected $ci;
  private $redis;
  private $deviceValuesService;

  public function __construct(ContainerInterface $ci)
  {
    $this->ci = $ci;
    $this->redis = $this->ci->get(\Redis::class);
    $this->deviceValuesService = $this->ci->get(DeviceValuesService::class);
  }

  public function get($request, $response, $args)
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

    return $response->withJson($filtered, empty($filtered)?204:200);
  }

  public function add($request, $response, $args)
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
