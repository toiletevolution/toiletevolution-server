<?php
namespace ToiletEvolution\Middlewares\HttpBasicAuthentication;

use Tuupola\Middleware\HttpBasicAuthentication\AuthenticatorInterface;

class DeviceAuthenticator implements AuthenticatorInterface {
  private $devices;

  /**
   * @param  \GDS\Store   $devices Device Data Store
   */
  public function __construct($devices)
  {
    $this->devices = $devices;
  }

  public function __invoke(array $arguments): bool {
    $device = $this->devices->fetchById($arguments['user']);

    return password_verify($arguments['password'], $device->password);
  }
}
