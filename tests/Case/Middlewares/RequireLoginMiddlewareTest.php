<?php
namespace Test\ToiletEvolution\Middlewares;

use ToiletEvolution\Middlewares\RequireLoginMiddleware;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Slim\Interfaces\CallableResolverInterface;
use GuzzleHttp\Psr7\ServerRequest;
use GuzzleHttp\Psr7\Response;
use Helmich\Psr7Assert\Psr7Assertions;
use Slim\Routing\Route;
use RKA\Session;
use PHPUnit\Framework\TestCase;

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
  public function before()
  {
    $this->session = $this->getMockBuilder(MockSession::class)->onlyMethods(['get'])->getMock();
    $this->target = new RequireLoginMiddleware('https://toiletevolution.space', $this->session);
  }

  public function testCallNextIfCurrentUserExistsInSession()
  {
    $route = new Route(['GET'], '/foo', function() {}, $this->getMockBuilder(ResponseFactoryInterface::class)->getMock(), $this->getMockBuilder(CallableResolverInterface::class)->getMock());
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute('route', $route);
    $route->setArgument('provider', 'google');
    $user = new \stdClass;
    $this->session->expects($this->once())->method('get')->with($this->equalTo('current_user'))->willReturn($user);

    $results = $this->target->__invoke($request, $this->createRequestHandler());
    $this->assertTrue($results->request instanceof ServerRequest);
  }

  public function testResponseCodeIs302IfCurrentUserNotExistsInSession() {
    $route = new Route(['GET'], '/foo', function() {}, $this->getMockBuilder(ResponseFactoryInterface::class)->getMock(), $this->getMockBuilder(CallableResolverInterface::class)->getMock());
    $request = new ServerRequest('GET', '/foo');
    $request = $request->withAttribute('route', $route);
    $route->setArgument('provider', 'oauth2');
    $this->session->expects($this->once())->method('get')->with($this->equalTo('current_user'))->willReturn(null);

    $results = $this->target->__invoke($request, $this->createRequestHandler());
    $this->assertThat($results, hasStatus(302));
    $this->assertThat($results, hasHeader('Location', 'https://toiletevolution.space'));
  }
}
