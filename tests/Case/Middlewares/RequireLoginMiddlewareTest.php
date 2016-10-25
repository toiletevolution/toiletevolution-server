<?php
namespace Test\ToiletEvolution\Middlewares;

use ToiletEvolution\Middlewares\RequireLoginMiddleware;
use GuzzleHttp\Psr7\ServerRequest;
use GuzzleHttp\Psr7\Response;
use Helmich\Psr7Assert\Psr7Assertions;
use Slim\Route;
use RKA\Session;

class RequireLoginMiddlewareTest extends \PHPUnit_Framework_TestCase
{
  use Psr7Assertions;

  private $target;
  private $session;

  public function setUp()
  {
    parent::setUp();
    $this->session = $this->getMockBuilder('Session')->setMethods(['get'])->getMock();
    $this->target = new RequireLoginMiddleware('https://toiletevolution.space', $this->session);
  }

  public function testCallNextIfCurrentUserExistsInSession()
  {
    $route = new Route('GET', '/foo', function() {});
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute('route', $route);
    $route->setArgument('provider', 'google');
    $response = new Response();
    $next = $this->getMock(\stdClass::class, ['__invoke']);
    $next->expects($this->once())->method('__invoke');
    $user = new \stdClass;
    $this->session->expects($this->once())->method('get')->with($this->equalTo('current_user'))->willReturn($user);

    $this->target->__invoke($request, $response, $next);
  }

  public function testResponseCodeIs302IfCurrentUserNotExistsInSession() {
    $route = new Route('GET', '/foo', function() {});
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute('route', $route);
    $route->setArgument('provider', 'oauth2');
    $response = new Response();
    $next = $this->getMock(\stdClass::class, ['__invoke']);
    $next->expects($this->never())->method('__invoke');
    $this->session->expects($this->once())->method('get')->with($this->equalTo('current_user'))->willReturn(null);

    $results = $this->target->__invoke($request, $response, $next);
    assertThat($results, hasStatus(302));
    assertThat($results, hasHeader('Location', 'https://toiletevolution.space'));
  }
}
