<?php
namespace ToiletEvolution\Services;

class UserService
{

  public function __construct($userModel)
  {
    $this->userModel = $userModel;
  }

  public function createUser($ownerDetails, $accessToken)
  {
    //  object(League\OAuth2\Client\Provider\GoogleUser)#78 (1) {
    //    ["response":protected]=&gt;
    //  array(5) {
    //    ["emails"]=&gt;
    //    array(1) {
    //      [0]=&gt;
    //      array(1) {
    //        ["value"]=&gt;
    //        string(19) "k-kishida@esm.co.jp"
    //      }
    //    }
    //    ["id"]=&gt;
    //    string(21) "104401180677433213677"
    //      ["displayName"]=&gt;
    //    string(15) "岸田健一郎"
    //      ["name"]=&gt;
    //    array(2) {
    //      ["familyName"]=&gt;
    //      string(6) "岸田"
    //        ["givenName"]=&gt;
    //      string(9) "健一郎"
    //    }
    //    ["image"]=&gt;
    //    array(1) {
    //      ["url"]=&gt;
    //      string(98) "https://lh6.googleusercontent.com/-aR-Lqb--WBc/AAAAAAAAAAI/AAAAAAAAAAA/bbJkWH1eiOg/photo.jpg?sz=50"
    //    }
    //  }
    
    
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
