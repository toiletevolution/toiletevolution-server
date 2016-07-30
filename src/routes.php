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
    $this->session->oauthCallback = empty($request->getQueryParams()['callback'])? '/#/admin/devices' : $request->getQueryParams()['callback'];
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

      //    Hello 健一郎!object(League\OAuth2\Client\Token\AccessToken)#89 (5) {
      //      ["accessToken":protected]=&gt;
      //    string(75) "ya29.CjLlAh71PeuQMVu0fZkjHkghlYzagc8z1QDbjk53y9fcAchK8wURlghFp5CmZztZvLmtyw"
      //      ["expires":protected]=&gt;
      //    int(1463455808)
      //      ["refreshToken":protected]=&gt;
      //    NULL
      //      ["resourceOwnerId":protected]=&gt;
      //    NULL
      //      ["values":protected]=&gt;
      //    array(2) {
      //      ["token_type"]=&gt;
      //      string(6) "Bearer"
      //        ["id_token"]=&gt;
      //      string(909) "eyJhbGciOiJSUzI1NiIsImtpZCI6IjUyNDNiNDI5ZGUxOGY0NTY4NTYwOTMwNDY3NDBlMDU2NjRjNDI5OTYifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXRfaGFzaCI6Il9wWGhrQ1M5ZUVhTENuNnF5Q2tjTnciLCJhdWQiOiI4MjU4MjQ1NjIwNTQtMjNmdXBuZWoxdjIxMHJpcnJuODB2YWcxOWI4bnVhdWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQ0MDExODA2Nzc0MzMyMTM2NzciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXpwIjoiODI1ODI0NTYyMDU0LTIzZnVwbmVqMXYyMTByaXJybjgwdmFnMTliOG51YXVkLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiaGQiOiJlc20uY28uanAiLCJlbWFpbCI6Imsta2lzaGlkYUBlc20uY28uanAiLCJpYXQiOjE0NjM0NTIyMTAsImV4cCI6MTQ2MzQ1NTgxMH0.EvONgq9eA6PIPlVzOBHzedhxEcx_udGLE-4hqQUygi8tYZSqIbbAsvLKNC5yT4tE7vztmv8lb__PZ3LqIaaJYJ_PvsDWukxjoiWwjSIl9OjHRsvl1I_jbS_T7xAJXta_SM1GUpj6aV15DxaYJ8TA4TveO6ozaC5u8LDAszsAMJPoOqVn2gxOMQcGgwXu0YScfHCfEFZ5yW2JLWr1EX2g5yO2L25zRXkoALMNT8LvsKwsEcVE4cawrYQhHO0LZS_AubBd5IREOu7iFWIiqP0E5BhsZDTOzDw7IJKwEwgj3rCkNLWWZAsFUMzlvtsu1TozSDBCcKulWcNJwvQ9zL69UQ"
      //    }
      //  }

    }  
  });
  
})->add(new \ToiletEvolution\Middlewares\AllowedProvidersMiddleware($app->getContainer()->get('oAuthProviders')));;
