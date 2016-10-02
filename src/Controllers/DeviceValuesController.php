<?php
namespace ToiletEvolution\Controllers;

use Interop\Container\ContainerInterface;
use Carbon\Carbon;

class DeviceValuesController
{
  protected $ci;

  public function __construct(ContainerInterface $ci)
  {
    $this->ci = $ci;
  }

  public function get($request, $response, $args)
  {
    $id = $args['id'];
    $bucketName = $this->ci->get('settings')['storage']['name'];
    $fileName = "gs://{$bucketName}/${id}.json";

    if(file_exists($fileName)) {
      $data = json_decode(file_get_contents($fileName), true);
    } else {
      $data = [];
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
    $bucketName = $this->ci->get('settings')['storage']['name'];
    $fileName = "gs://{$bucketName}/${id}.json";

    if(file_exists($fileName)) {
      $data = json_decode(file_get_contents($fileName), true);
    } else {
      $data = [];
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

    file_put_contents($fileName, json_encode($filtered));

    return $response->withStatus(201);
  }
}
