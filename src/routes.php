<?php
// Routes

//
// For Public
//
$app->get('/api/devices', '\ToiletEvolution\Controllers\DevicesController:index');
$app->get('/api/devices/{id}', '\ToiletEvolution\Controllers\DevicesController:get');
$app->get('/api/devices/{id}/values', '\ToiletEvolution\Controllers\DeviceValuesController:get');
$app->get('/api/user/current', '\ToiletEvolution\Controllers\UsersController:current');

//
// For Registered Devices
//
$app->post('/api/devices/{id}/values', '\ToiletEvolution\Controllers\DeviceValuesController:add')
    ->add(new \Slim\Middleware\HttpBasicAuthentication([
      "authenticator" => new ToiletEvolution\Middlewares\HttpBasicAuthentication\DeviceAuthenticator($app->getContainer()->get('DeviceStore')),
        "callback" => function($request, $response, $arguments) {
          $route = $request->getAttribute('route');
          $id = $route->getArgument('id');
          return $id === $arguments['user'];
        }
      ]));

//
// For Administrator
//
$app->group('/admin', function () use ($app) {
  $app->get('/devices', '\ToiletEvolution\Controllers\Admin\DevicesController:index');
  $app->get('/devices/{id}', '\ToiletEvolution\Controllers\Admin\DevicesController:get');
  $app->post('/device', '\ToiletEvolution\Controllers\Admin\DevicesController:add');
  $app->delete('/devices/{id}', '\ToiletEvolution\Controllers\Admin\DevicesController:delete');
})->add(new \ToiletEvolution\Middlewares\RequireLoginMiddleware('/', $app->getContainer()->get('session')));;

//
// For OAuth
//
$app->group('/auth/{provider}', function() use($app) {
  
  $app->get('/', function($request, $response, $args) {
    $auth = "${args['provider']}OAuth";
    $authUrl = $this->$auth->getAuthorizationUrl();
    $this->session->oauth2state = $this->$auth->getState();
    $this->session->oauthCallback = empty($request->getQueryParams()['callback'])? '/#/logined' : $request->getQueryParams()['callback'];
    return $response
      ->withStatus(302)
      ->withHeader('Location', $authUrl);
  });

  $app->get('/callback', function($request, $response, $args) {
    if ($request->getQueryParams()['state'] !== $this->session->oauth2state) {
      // State is invalid, possible CSRF attack in progress
      unset($this->session->oauth2state);
      return $response
        ->withStatus(401);
    } else {
      $auth = "${args['provider']}OAuth";
      // Try to get an access token (using the authorization code grant)
      $token = $this->$auth->getAccessToken('authorization_code', [
        'code' => $request->getQueryParams()['code']
      ]);

      // Optional: Now you have a token you can look up a users profile data
      try {
        // We got an access token, let's now get the owner details
        $ownerDetails = $this->$auth->getResourceOwner($token);
        // Use these details to create a new profile
        $user = $this->get(ToiletEvolution\Services\UserService::class)->createUser($ownerDetails, $token->getToken());
        $this->session->set('current_user', $user);
        
        return $response
          ->withStatus(302)
          ->withHeader('Location', $this->session->oauthCallback);
      } catch (Exception $e) {
        // Failed to get user details
        exit('Something went wrong: ' . $e->getMessage());
      }

    }  
  });
  
})->add(new \ToiletEvolution\Middlewares\AllowedProvidersMiddleware($app->getContainer()->get('oAuthProviders')));;
