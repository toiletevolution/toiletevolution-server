<?php
namespace ToiletEvolution\Middlewares;

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
   * @param  \Psr\Http\Message\ServerRequestInterface $request  PSR7 request
   * @param  \Psr\Http\Message\ResponseInterface      $response PSR7 response
   * @param  callable                                 $next     Next middleware
   *
   * @return \Psr\Http\Message\ResponseInterface
   */
  public function __invoke($request, $response, $next)
  {
    if(empty($this->session->get('current_user')))
    {
      $response = $response
        ->withStatus(302)
        ->withHeader('Location', $this->redirectIfNotLogin);
    }
    else
    {
      $response = $next($request, $response);
    }

    return $response;
  }
}