<?php
namespace ToiletEvolution\Middlewares;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface;
use Slim\Psr7\Response;

class RequireLoginMiddleware
{
  private $redirectIfNotLogin;
  private $session;

  /**
   * @param  string       $redirectIfNotLogin  redirect to the url if user didn't login
   * @param  \RKA\Session $session             session
   */
  public function __construct($redirectIfNotLogin, $session)
  {
    $this->redirectIfNotLogin = $redirectIfNotLogin;
    $this->session = $session;
  }

  /**
   * RequireLogin middleware invokable class
   *
   * @param  Psr\Http\Message\ServerRequestInterface  $request PSR7 request
   * @param  Psr\Http\Server\RequestHandlerInterface    $handler PSR-15 request handler
   *
   * @return Psr\Http\Message\ResponseInterface
   */
  public function __invoke(Request $request, RequestHandler $handler): ResponseInterface
  {
    $response = new Response();
    if(empty($this->session->get('current_user')))
    {
      $response = $response
        ->withStatus(302)
        ->withHeader('Location', $this->redirectIfNotLogin);
    }
    else
    {
      $response = $handler->handle($request);
    }

    return $response;
  }
}
