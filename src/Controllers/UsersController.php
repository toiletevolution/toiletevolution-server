<?php
namespace ToiletEvolution\Controllers;

use Interop\Container\ContainerInterface;

class UsersController
{
  protected $ci;

  public function __construct(ContainerInterface $ci)
  {
    $this->ci = $ci;
  }

  public function current($request, $response, $args)
  {
    $user = $this->ci->get('session')->get('current_user');
    if(empty($user)) {
      return $response->withStatus(404);
    }

    return $response->withJson([
      'name'   => $user->name,
      'email'  => $user->email,
      'avatar' => $user->avatar,
    ]);
  }

}