<?php
namespace Test\ToiletEvolution\Middlewares\HttpBasicAuthentication;

use ToiletEvolution\Middlewares\HttpBasicAuthentication\DeviceAuthenticator;
use GuzzleHttp\Psr7\ServerRequest;
use GuzzleHttp\Psr7\Response;
use Helmich\Psr7Assert\Psr7Assertions;
use Slim\Route;
use GDS\Store;
  
class DeviceAuthenticatorTest extends \PHPUnit_Framework_TestCase
{
  use Psr7Assertions;

  private $target;
  private $stubDevice;
  
  public function setUp()
  {
    parent::setUp();
    $this->stubDevice = $this->getMockBuilder('Store')->setMethods(['fetchById'])->getMock();
    $this->target = new DeviceAuthenticator($this->stubDevice);
  }

  public function testShouldReturnTrueIfPasswordMatched()
  {
    $request = new ServerRequest('GET', '/foo');
    $response = new Response();
    $data = new \stdClass;
    $data->password = password_hash('password', PASSWORD_DEFAULT);
    $this->stubDevice->expects($this->once())->method('fetchById')->with($this->equalTo('username'))->willReturn($data);

    assertTrue($this->target->__invoke(['user' => 'username', 'password' => 'password']));
  }

  public function testShouldReturnFalseIfPasswordNotMatched()
  {
    $request = new ServerRequest('GET', '/foo');
    $response = new Response();
    $data = new \stdClass;
    $data->password = password_hash('password', PASSWORD_DEFAULT);
    $this->stubDevice->expects($this->once())->method('fetchById')->with($this->equalTo('username'))->willReturn($data);

    assertFalse($this->target->__invoke(['user' => 'username', 'password' => 'missing']));
  }
}