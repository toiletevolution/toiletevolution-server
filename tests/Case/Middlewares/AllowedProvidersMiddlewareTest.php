<?php
namespace Test\ToiletEvolution\Middlewares;

use ToiletEvolution\Middlewares\AllowedProvidersMiddleware;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Slim\Interfaces\CallableResolverInterface;
use GuzzleHttp\Psr7\ServerRequest;
use GuzzleHttp\Psr7\Response;
use Helmich\Psr7Assert\Psr7Assertions;
use Slim\Routing\Route;
use Slim\Routing\RouteContext;
use Slim\Interfaces\RouteParserInterface;
use Slim\Routing\RoutingResults;
use PHPUnit\Framework\TestCase;

final class AllowedProvidersMiddlewareTest extends TestCase
{
  use Psr7Assertions;

  private $target;

  protected function createRequestHandler(): RequestHandlerInterface
  {
    $response = new Response();

    return new class ($response) implements RequestHandlerInterface {
          private $response;

          public function __construct(ResponseInterface $response)
          {
              $this->response = $response;
          }

          public function handle(ServerRequestInterface $request): ResponseInterface
          {
              $this->response->request = $request;
              return $this->response;
          }
      };
  }

  /**
   * @before
   */
  public function setUpAllowedProvidersMiddleware()
  {
    $this->target = new AllowedProvidersMiddleware(['google', 'github']);
  }

  public function testCallNextIfProviderExsitsInProviders()
  {
    $route = new Route(['GET'], '/foo', function() {}, $this->getMockBuilder(ResponseFactoryInterface::class)->getMock(), $this->getMockBuilder(CallableResolverInterface::class)->getMock());
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute(RouteContext::ROUTE, $route);
    $request = $request->withAttribute(RouteContext::ROUTE_PARSER, $this->createMock(RouteParserInterface::class));
    $request = $request->withAttribute(RouteContext::ROUTING_RESULTS, $this->createMock(RoutingResults::class));
    $route->setArgument('provider', 'google');

    $results = $this->target->__invoke($request, $this->createRequestHandler());
    $this->assertTrue($results->request instanceof ServerRequest);
  }

  public function testResponseCodeIs404IfProviderNotExistsInProviders() {
    $route = new Route(['GET'], '/foo', function() {}, $this->getMockBuilder(ResponseFactoryInterface::class)->getMock(), $this->getMockBuilder(CallableResolverInterface::class)->getMock());
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute(RouteContext::ROUTE, $route);
    $request = $request->withAttribute(RouteContext::ROUTE_PARSER, $this->createMock(RouteParserInterface::class));
    $request = $request->withAttribute(RouteContext::ROUTING_RESULTS, $this->createMock(RoutingResults::class));
    $route->setArgument('provider', 'oauth2');

    $results = $this->target->__invoke($request, $this->createRequestHandler());
    $this->assertThat($results, hasStatus(404));
  }
}
