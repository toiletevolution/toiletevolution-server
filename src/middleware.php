<?php
// Application middleware
declare(strict_types=1);

use Slim\App;

return function (App $app) {
  // e.g: $app->add(new \Slim\Csrf\Guard);

  $app->add(new \RKA\SessionMiddleware(['name' => 'ToiletEvolution']));
};
