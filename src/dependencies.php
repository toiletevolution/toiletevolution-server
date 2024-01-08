<?php
// DIC configuration
//use SlimApi\OAuth\OAuthFactory;
//use SlimApi\OAuth\OAuthMiddleware;
//use SlimApi\OAuth\UserServiceInterface;
use ToiletEvolution\Services\UserService;
use ToiletEvolution\Services\DeviceService;
use ToiletEvolution\Models\User;
use ToiletEvolution\Models\Device;
use ToiletEvolution\Services\DeviceValuesService;
use DI\Container;

return function (Container $container) {

  // Environment Settings
  if ($_SERVER['SERVER_NAME'] == 'localhost') {
    ini_set('session.save_handler', 'files');
    ini_set('session.save_path', null);
    $container->set(DeviceValuesService::class, function($container) {
      $impl = new ToiletEvolution\Services\DeviceValuesServiceLocalImpl($container->get('settings')['storage']['name']);
      $impl->setRoot(dirname(dirname(__FILE__)) . DIRECTORY_SEPARATOR . 'localstorage');
      return $impl;
    });
  } else {
//    session_set_save_handler(new Google\AppEngine\Ext\Session\MemcacheSessionHandler(), true);
    $storage = new Google\Cloud\Storage\StorageClient();
    $storage->registerStreamWrapper();
    $container->set(DeviceValuesService::class, function($container) {
      return new ToiletEvolution\Services\DeviceValuesServiceGsImpl($container->get('settings')['storage']['name']);
    });
  }

  // monolog
  $container->set('logger', function ($c)
  {
      $settings = $c->get('settings')['logger'];
      $logger = new Monolog\Logger($settings['name']);
      $logger->pushProcessor(new Monolog\Processor\UidProcessor());
      $logger->pushHandler(new Monolog\Handler\SyslogHandler('intranet', 'user', Monolog\Level::Debug, false, LOG_PID));
      return $logger;
  });

  $container->set('oAuthProviders', function($container) {
    return ['google'];
  });

  // these should all probably be in some configuration class
  $container->set('googleOAuth', function($container) {
    return new League\OAuth2\Client\Provider\Google($container->get('settings')['oauth']);
  });

  $container->set('session', function($container) {
    return new \RKA\Session();
  });

  $container->set(Redis::class, function($container) {
    $redis = new Redis();
    $redis->connect($container->get('settings')['redis']['host'], $container->get('settings')['redis']['port']);
    $redis->auth(['pass' => $container->get('settings')['redis']['password']]);
    return $redis;
  });

  $container->set('UserStore', function($container)
  {
    return new \GDS\Store('Users');
  });

  $container->set(User::class, function($container)
  {
    return new User($container->get('UserStore'), $container->get(Redis::class));
  });

  $container->set('DeviceStore', function($container)
  {
    return new \GDS\Store('Devices');
  });

  $container->set(Device::class, function($container)
  {
      return new Device($container->get('DeviceStore'), $container->get(Redis::class));
  });

  //$container[OAuthFactory::class] = function($container)
  //{
  //  $factory = new OAuthFactory($container->get('oAuthCreds'));
  //  if(!$factory->getService()) {
  //    $factory->createService('Google', ['userinfo_email', 'userinfo_profile']);
  //  }
  //  return $factory;
  //};

  $container->set(UserService::class, function($container)
  {
    return new UserService($container->get('ToiletEvolution\Models\User'));
  });

  $container->set(DeviceService::class, function($container)
  {
    return new DeviceService($container->get('ToiletEvolution\Models\Device'));
  });

  //$container[OAuthMiddleware::class] = function($container)
  //{
  //  $oauth = new OAuthMiddleware($container->get('SlimApi\OAuth\OAuthFactory'), $container->get('SlimApi\OAuth\UserServiceInterface'));
  //  $oauth->setOAuthProviders(array_keys($container->get('oAuthCreds')));
  //  return $oauth;
  //};

  return $container;
};
