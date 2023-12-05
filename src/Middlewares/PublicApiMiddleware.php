<?php
namespace ToiletEvolution\Middlewares;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response;

class PublicApiMiddleware
{
  /**
   * Public api middleware invokable class
   *
   * @param  Psr\Http\Message\ServerRequestInterface  $request PSR7 request
   * @param  Psr\Http\Server\RequestHandlerInterface    $handler PSR-15 request handler
   *
   * @return Slim\Psr7\Response
   */
  public function __invoke(Request $request, RequestHandler $handler): Response
  {
    $response = $handler->handle($request);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  }
}
