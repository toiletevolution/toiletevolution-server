<?php
namespace Test\ToiletEvolution\Model;

use ToiletEvolution\Models\Device;
use ToiletEvolution\Models\Entities\DeviceEntity;
use GeckoPackages\MemcacheMock\MemcachedMock;

class DeviceTest extends \PHPUnit_Framework_TestCase
{
  private $target;
  private $cache;
  private $store;
  private $testdata = [
    'name' => 'username',
    'password' => '12345678',
    'thresholds' => ['value' => 20, 'condition' => 'eq'],
    'location' => ['latitude' => '12.34', 'longitude' => '35.67']
  ];
  private $user;

  public function setUp()
  {
    parent::setUp();
    $this->cache = new MemcachedMock();
    $this->cache->addServer('127.0.0.1', 11211);
    $this->store = new \GDS\Store('Devices');
    $this->target = new Device($this->store, $this->cache);
    $this->user = new \GDS\Entity();
    $this->user->setKind('User')->setKeyId("".rand());
    $this->store->delete($this->store->fetchAll());
    $this->cache->flush();
  }

  public function tearDown()
  {
  }

  public function testCreateEmptyEntity()
  {
    $results = $this->target->createEntity();
    assertInstanceOf(DeviceEntity::class, $results);
  }

  public function testCreateParameterizedEntity()
  {
    $results = $this->target->createEntity($this->testdata, $this->user);

    assertEquals('username', $results->name);
    assertTrue(password_verify('12345678', $results->password));
    assertEquals('{"value":20,"condition":"eq"}', $results->thresholds);
    assertEquals('12.34', $results->latitude);
    assertEquals('35.67', $results->longitude);
    assertInstanceOf(\DateTime::class, $results->created_at);
    assertEquals($this->user->getKeyId(), $results->created_by);
  }

  public function testSaveWithCache()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->target->save($entity);

    assertEquals($entity, $this->cache->get('device:id:'.$entity->getKeyId()));
    assertEquals('username', $this->store->fetchById($entity->getKeyId())->name);
  }

  public function testAllCacheShouldRemovedAfterSave()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set('device:all', [$entity]);

    $this->target->save($entity);

    assertFalse($this->cache->get('device:all'));
    assertEquals(\Memcached::RES_NOTFOUND, $this->cache->getResultCode());
  }

  public function testCreatedUserCacheShouldRemovedAfterSave()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set("device:all:created_by:{$this->user->getKeyId()}", [$entity]);

    $this->target->save($entity);

    assertFalse($this->cache->get("device:all:created_by:{$this->user->getKeyId()}"));
  }

  public function testFindCreatedByIdFromCache()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set("device:all:created_by:{$this->user->getKeyId()}", [$entity]);

    $actual = $this->target->byCreatedBy($this->user);

    assertCount(1, $actual);
    assertEquals('username', $actual[0]->name);
  }

  public function testFindCreatedByIdFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);
    $this->store->fetchById($entity->getKeyId());

    $actual = $this->target->byCreatedBy($this->user);

    assertCount(1, $actual);
    assertEquals('username', $actual[0]->name);
  }

  public function testFindByIdFromCache()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set('device:id:1234', $entity);

    $actual = $this->target->byId("1234");

    assertEquals('username', $actual->name);
  }

  public function testFindByIdFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);
    $actual = $this->target->byId($entity->getKeyId());

    assertEquals('username', $actual->name);
  }

  public function testFindByIdAndCreatedByShouldReturnNullIfNotExists()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);

    $anotherUser = new \GDS\Entity();
    $anotherUser->setKind('User')->setKeyId("".rand());

    $actual = $this->target->byIdAndCreatedBy($entity->getKeyId(), $anotherUser);

    assertNull($actual);
  }

  public function testFindByIdAndCreatedBy()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);

    $actual = $this->target->byIdAndCreatedBy($entity->getKeyId(), $this->user);

    assertEquals('username', $actual->name);
  }

  public function testFindAllFromCache()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set("device:all", [$entity]);

    $actual = $this->target->all();

    assertCount(1, $actual);
    assertEquals('username', $actual[0]->name);
  }

  public function testFindAllFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);
    $this->store->fetchById($entity->getKeyId());

    $actual = $this->target->all();

    assertCount(1, $actual);
    assertEquals('username', $actual[0]->name);
  }

  public function testDelete()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);
    $key = $entity->getKeyId();

    $this->target->delete($entity);

    $actual = $this->store->fetchById($key);
    assertNull($actual);
    assertFalse($this->cache->get('device:all'));
    assertFalse($this->cache->get("device:id:{$key}"));
    assertFalse($this->cache->get("device:all:created_by:{$this->user->getKeyId()}"));
  }

}
