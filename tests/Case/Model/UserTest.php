<?php
namespace Test\ToiletEvolution\Model;

use ToiletEvolution\Models\User;
use GeckoPackages\MemcacheMock\MemcachedMock;

class UserTest extends \PHPUnit_Framework_TestCase
{
  private $target;
  private $cache;
  private $store;
  private $testdata = [
    'remote_id'   => 'remote1234',
    'type'        => 'Google',
    'name'        => 'Hoge Fuga',
    'email'       => 'fuga@example.com',
    'avatar'      => 'http://example.com/avatar',
    'auth_token'  => 'test-token',
  ];

  public function setUp()
  {
    parent::setUp();
    $this->cache = new MemcachedMock();
    $this->cache->addServer('127.0.0.1', 11211);
    $this->store = new \GDS\Store('Users');
    $this->target = new User($this->store, $this->cache);
    $this->store->delete($this->store->fetchAll());
    $this->cache->flush();
  }

  public function tearDown()
  {
  }

  public function testCreateEmptyEntity()
  {
    $results = $this->target->createEntity();
    assertInstanceOf(\GDS\Entity::class, $results);
  }

  public function testCreateParameterizedEntity()
  {
    $results = $this->target->createEntity($this->testdata);

    assertEquals('remote1234', $results->remote_id);
    assertEquals('Google', $results->type);
    assertEquals('Hoge Fuga', $results->name);
    assertEquals('fuga@example.com', $results->email);
    assertEquals('http://example.com/avatar', $results->avatar);
    assertEquals('test-token', $results->auth_token);
  }

  public function testSaveWithCache()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->target->save($entity);

    assertEquals($entity, $this->cache->get('user:auth_token:test-token'));
    assertEquals($entity, $this->cache->get('user:remote_id:remote1234'));
    assertEquals('Hoge Fuga', $this->store->fetchById($entity->getKeyId())->name);
  }

  public function testFindByTokenFromCache()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->cache->set('user:auth_token:test-1234', $entity);

    $actual = $this->target->byToken("test-1234");

    assertEquals('Hoge Fuga', $actual->name);
  }

  public function testFindByTokenFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->store->upsert($entity);
    $this->store->fetchById($entity->getKeyId());

    $actual = $this->target->byToken('test-token');
    assertEquals('Hoge Fuga', $actual->name);
  }

  public function testFindByRemoteIdFromCache()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->cache->set('user:remote_id:remote-1234', $entity);

    $actual = $this->target->byRemoteId("remote-1234");

    assertEquals('Hoge Fuga', $actual->name);
  }

  public function testFindByRemoteIdFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->store->upsert($entity);
    $this->store->fetchById($entity->getKeyId());

    $actual = $this->target->byRemoteId('remote1234');
    assertEquals('Hoge Fuga', $actual->name);
  }

}
