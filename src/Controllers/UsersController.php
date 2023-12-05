<?php
namespace ToiletEvolution\Controllers;

use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use ToiletEvolution\Renderer\JsonRenderer;

class UsersController
{
  protected ContainerInterface $ci;
  private JsonRenderer $renderer;

  public function __construct(ContainerInterface $ci)
  {
    $this->ci = $ci;
    $this->renderer = new JsonRenderer();
  }

  public function current(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
  {
    $user = $this->ci->get('session')->get('current_user');
    if(empty($user)) {
      return $response->withStatus(404);
    }

    return $this->renderer->json($response, [
      'name'   => $user->name,
      'email'  => $user->email,
      'avatar' => $user->avatar,
    ])->withStatus(200);
  }

}
