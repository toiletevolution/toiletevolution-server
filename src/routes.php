<?php
// Routes
declare(strict_types=1);

use App\Handler\HomePageHandler;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;

return function (App $app) {
  //
  // For Public
  //
  $app->get('/api/devices', '\ToiletEvolution\Controllers\DevicesController:index')->add(new \ToiletEvolution\Middlewares\PublicApiMiddleware());
  $app->get('/api/devices/{id}', '\ToiletEvolution\Controllers\DevicesController:get')->add(new \ToiletEvolution\Middlewares\PublicApiMiddleware());
  $app->get('/api/devices/{id}/values', '\ToiletEvolution\Controllers\DeviceValuesController:get')->add(new \ToiletEvolution\Middlewares\PublicApiMiddleware());
  $app->get('/api/user/current', '\ToiletEvolution\Controllers\UsersController:current')->add(new \ToiletEvolution\Middlewares\PublicApiMiddleware());

  //
  // For Registered Devices
  //
  $app->post('/api/devices/{id}/values', '\ToiletEvolution\Controllers\DeviceValuesController:add')
      ->add(new \Tuupola\Middleware\HttpBasicAuthentication([
          "authenticator" => new ToiletEvolution\Middlewares\HttpBasicAuthentication\DeviceAuthenticator($app->getContainer()->get('DeviceStore')),
          "before" => function($request, $response, $arguments) {
            $id = $arguments('id');
            return $id === $arguments['user'];
          },
          "secure" => false
        ]));

  //
  // For Administrator
  //
  $app->group('/admin', function (RouteCollectorProxy $group) {
    $group->get('/devices', '\ToiletEvolution\Controllers\Admin\DevicesController:index');
    $group->get('/devices/{id}', '\ToiletEvolution\Controllers\Admin\DevicesController:get');
    $group->post('/device', '\ToiletEvolution\Controllers\Admin\DevicesController:add');
    $group->delete('/devices/{id}', '\ToiletEvolution\Controllers\Admin\DevicesController:delete');
  })->add(new \ToiletEvolution\Middlewares\RequireLoginMiddleware('/', $app->getContainer()->get('session')));;

  //
  // For OAuth
  //
  $app->group('/auth/{provider}', function(RouteCollectorProxy $group) {
    $group->get('/', function($request, $response, array $args) {
      $auth = $this->get("{$args['provider']}OAuth");
      $session = $this->get('session');
      $authUrl = $auth->getAuthorizationUrl();
      $session->oauth2state = $auth->getState();
      $session->oauthCallback = empty($request->getQueryParams()['callback'])? '/#/logined' : $request->getQueryParams()['callback'];
      return $response
        ->withStatus(302)
        ->withHeader('Location', $authUrl);
    });

    $group->get('/callback', function($request, $response, array $args) {
      $auth = $this->get("{$args['provider']}OAuth");
      $session = $this->get('session');

      if ($request->getQueryParams()['state'] !== $session->oauth2state) {
        // State is invalid, possible CSRF attack in progress
        unset($session->oauth2state);
        return $response
          ->withStatus(401);
      } else {
        // Try to get an access token (using the authorization code grant)
        $token = $auth->getAccessToken('authorization_code', [
          'code' => $request->getQueryParams()['code']
        ]);

        // Optional: Now you have a token you can look up a users profile data
        try {
          // We got an access token, let's now get the owner details
          $ownerDetails = $auth->getResourceOwner($token);
          // Use these details to create a new profile
          $user = $this->get(ToiletEvolution\Services\UserService::class)->createUser($ownerDetails, $token->getToken());
          $session->set('current_user', $user);

          return $response
            ->withStatus(302)
            ->withHeader('Location', $session->oauthCallback);
        } catch (Exception $e) {
          // Failed to get user details
          exit('Something went wrong: ' . $e->getMessage());
        }

      }
    });

  })->add(new \ToiletEvolution\Middlewares\AllowedProvidersMiddleware($app->getContainer()->get('oAuthProviders')));
};
