<?php
namespace Test\ToiletEvolution\Middlewares;

use ToiletEvolution\Middlewares\AllowedProvidersMiddleware;
use GuzzleHttp\Psr7\ServerRequest;
use GuzzleHttp\Psr7\Response;
use Helmich\Psr7Assert\Psr7Assertions;
use Slim\Route;
use PHPUnit\Framework\TestCase;

class NextMiddleware
{
  public function __invoke($request, $response)
  {
  }
}

final class AllowedProvidersMiddlewareTest extends TestCase
{
  use Psr7Assertions;

  private $target;

  /**
   * @before
   */
  public function setUpAllowedProvidersMiddleware()
  {
    $this->target = new AllowedProvidersMiddleware(['google', 'github']);
  }

  public function testCallNextIfProviderExsitsInProviders()
  {
    $route = new Route('GET', '/foo', function() {});
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute('route', $route);
    $route->setArgument('provider', 'google');
    $response = new Response();
    $next = $this->createPartialMock(NextMiddleware::class, ['__invoke']);
    $next->expects($this->once())->method('__invoke');

    $this->target->__invoke($request, $response, $next);
  }

  public function testResponseCodeIs404IfProviderNotExistsInProviders() {
    $route = new Route('GET', '/foo', function() {});
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute('route', $route);
    $route->setArgument('provider', 'oauth2');
    $response = new Response();
    $next = $this->createPartialMock(NextMiddleware::class, ['__invoke']);
    $next->expects($this->never())->method('__invoke');

    $results = $this->target->__invoke($request, $response, $next);
    $this->assertThat($results, hasStatus(404));
  }
}
