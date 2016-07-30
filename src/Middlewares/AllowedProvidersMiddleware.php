<?php
namespace ToiletEvolution\Middlewares;

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
   * @param  \Psr\Http\Message\ServerRequestInterface $request  PSR7 request
   * @param  \Psr\Http\Message\ResponseInterface      $response PSR7 response
   * @param  callable                                 $next     Next middleware
   *
   * @return \Psr\Http\Message\ResponseInterface
   */
  public function __invoke($request, $response, $next)
  {
    $route = $request->getAttribute('route');
    $provider = $route->getArgument('provider');    

    if(!in_array($provider, $this->providers))
    {
      $response = $response->withStatus(404);
    }
    else
    {
      $response = $next($request, $response);
    }

    return $response;
  }
}