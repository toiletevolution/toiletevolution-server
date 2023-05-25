<?php
namespace Test\ToiletEvolution\Model;

use ToiletEvolution\Models\User;
use M6Web\Component\RedisMock\RedisMock;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
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

  /**
   * @before
   */
  public function before()
  {
    $this->cache = new RedisMock();
    $this->store = new \GDS\Store('Users');
    $this->target = new User($this->store, $this->cache);
    $this->store->delete($this->store->fetchAll());
    $this->cache->flushDb();
  }

  public function testCreateEmptyEntity()
  {
    $results = $this->target->createEntity();
    $this->assertInstanceOf(\GDS\Entity::class, $results);
  }

  public function testCreateParameterizedEntity()
  {
    $results = $this->target->createEntity($this->testdata);

    $this->assertEquals('remote1234', $results->remote_id);
    $this->assertEquals('Google', $results->type);
    $this->assertEquals('Hoge Fuga', $results->name);
    $this->assertEquals('fuga@example.com', $results->email);
    $this->assertEquals('http://example.com/avatar', $results->avatar);
    $this->assertEquals('test-token', $results->auth_token);
  }

  public function testSaveWithCache()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->target->save($entity);

    $this->assertEquals($entity, unserialize($this->cache->get('user:auth_token:test-token')));
    $this->assertEquals($entity, unserialize($this->cache->get('user:remote_id:remote1234')));
    $this->assertEquals('Hoge Fuga', $this->store->fetchById($entity->getKeyId())->name);
  }

  public function testFindByTokenFromCache()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->cache->set('user:auth_token:test-1234', serialize($entity));

    $actual = $this->target->byToken("test-1234");

    $this->assertEquals('Hoge Fuga', $actual->name);
  }

  public function testFindByTokenFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->store->upsert($entity);
    $this->store->fetchById($entity->getKeyId());

    $actual = $this->target->byToken('test-token');
    $this->assertEquals('Hoge Fuga', $actual->name);
  }

  public function testFindByRemoteIdFromCache()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->cache->set('user:remote_id:remote-1234', serialize($entity));

    $actual = $this->target->byRemoteId("remote-1234");

    $this->assertEquals('Hoge Fuga', $actual->name);
  }

  public function testFindByRemoteIdFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata);
    $this->store->upsert($entity);
    $this->store->fetchById($entity->getKeyId());

    $actual = $this->target->byRemoteId('remote1234');
    $this->assertEquals('Hoge Fuga', $actual->name);
  }

}
