<?php
namespace Test\ToiletEvolution\Middlewares;

use ToiletEvolution\Middlewares\RequireLoginMiddleware;
use GuzzleHttp\Psr7\ServerRequest;
use GuzzleHttp\Psr7\Response;
use Helmich\Psr7Assert\Psr7Assertions;
use Slim\Route;
use RKA\Session;
use PHPUnit\Framework\TestCase;

class MockMiddleware
{
  public function __invoke($request, $response)
  {
  }
}

class MockSession
{
  public function get($key, $default = null)
  {
  }
}

final class RequireLoginMiddlewareTest extends TestCase
{
  use Psr7Assertions;

  private $target;
  private $session;

  /**
   * @before
   */
  public function before()
  {
    $this->session = $this->getMockBuilder(MockSession::class)->onlyMethods(['get'])->getMock();
    $this->target = new RequireLoginMiddleware('https://toiletevolution.space', $this->session);
  }

  public function testCallNextIfCurrentUserExistsInSession()
  {
    $route = new Route('GET', '/foo', function() {});
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute('route', $route);
    $route->setArgument('provider', 'google');
    $response = new Response();
    $next = $this->createPartialMock(MockMiddleware::class, ['__invoke']);
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
    $next = $this->createPartialMock(MockMiddleware::class, ['__invoke']);
    $next->expects($this->never())->method('__invoke');
    $this->session->expects($this->once())->method('get')->with($this->equalTo('current_user'))->willReturn(null);

    $results = $this->target->__invoke($request, $response, $next);
    $this->assertThat($results, hasStatus(302));
    $this->assertThat($results, hasHeader('Location', 'https://toiletevolution.space'));
  }
}
