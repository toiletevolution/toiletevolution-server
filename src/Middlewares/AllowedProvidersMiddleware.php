<?php
namespace ToiletEvolution\Middlewares;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface;
use Slim\Psr7\Response;
use Slim\Routing\RouteContext;

class AllowedProvidersMiddleware
{
  private $providers;

  /**
   * @param  array $providers array of allowed provider name
   */
  public function __construct($providers)
  {
    $this->providers = $providers;
  }

  /**
   * AllowedProviders middleware invokable class
   *
   * @param Request $request PSR7 request
   * @param RequestHandler $handler PSR-15 request handler
   *
   * @return ResponseInterface
   */
  public function __invoke(Request $request, RequestHandler $handler): ResponseInterface
  {
    $routeContext = RouteContext::fromRequest($request);
    $route = $routeContext->getRoute();
    $provider = $route->getArgument('provider');
    $response = new Response();

    if(!in_array($provider, $this->providers))
    {
      $response = $response->withStatus(404);
    }
    else
    {
      $response = $handler->handle($request);
    }

    return $response;
  }
}
