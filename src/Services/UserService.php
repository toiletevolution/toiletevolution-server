<?php
namespace ToiletEvolution\Services;

use ToiletEvolution\Models\User;

class UserService
{
  private User $userModel;

  public function __construct($userModel)
  {
    $this->userModel = $userModel;
  }

  public function createUser($ownerDetails, $accessToken)
  {
    $user = $this->userModel->byRemoteId($ownerDetails->getId());

    if (!$user) {
      // create and save a new user
      $user = $this->userModel->createEntity([
        'remote_id'   => $ownerDetails->getId(),
        'type'        => 'Google',
        'name'        => $ownerDetails->getName(),
        'email'       => $ownerDetails->getEmail(),
        'avatar'      => $ownerDetails->getAvatar(),
      ]);
    }
    $user->oauth_token = $accessToken;

    $this->userModel->save($user);

    return $user;
  }
}
