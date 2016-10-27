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

  public function setUp()
  {
    parent::setUp();
    $this->cache = new MemcachedMock();
    $this->cache->addServer('127.0.0.1', 11211);
    $this->store = new \GDS\Store('Devices');
    $this->target = new Device($this->store, $this->cache);
  }

  public function tearDown()
  {
    $this->store->delete($this->store->fetchAll());
  }

  public function testCreateEmptyEntity()
  {
    $results = $this->target->createEntity();
    assertInstanceOf(DeviceEntity::class, $results);
  }

  public function testCreateParameterizedEntity()
  {
    $user = new \GDS\Entity();
    $user->setKind('User')->setKeyId(123456);
    $results = $this->target->createEntity($this->testdata, $user);

    assertEquals('username', $results->name);
    assertTrue(password_verify('12345678', $results->password));
    assertEquals('{"value":20,"condition":"eq"}', $results->thresholds);
    assertEquals('12.34', $results->latitude);
    assertEquals('35.67', $results->longitude);
    assertInstanceOf(\DateTime::class, $results->created_at);
    assertEquals(123456, $results->created_by);
  }

  public function testSaveWithCache()
  {
    $user = new \GDS\Entity();
    $user->setKind('User')->setKeyId(123456);
    $entity = $this->target->createEntity($this->testdata, $user);
    $this->target->save($entity);

    assertEquals($entity, $this->cache->get('device:id:'.$entity->getKeyId()));
    assertEquals('username', $this->store->fetchById($entity->getKeyId())->name);
  }

  public function testAllCacheShouldRemovedAfterSave()
  {
    $user = new \GDS\Entity();
    $user->setKind('User')->setKeyId(123456);
    $entity = $this->target->createEntity($this->testdata, $user);
    $this->cache->set('device:all', [$entity]);

    $this->target->save($entity);

    assertFalse($this->cache->get('device:all'));
    assertEquals(\Memcached::RES_NOTFOUND, $this->cache->getResultCode());
  }

  public function testCreatedUserCacheShouldRemovedAfterSave()
  {
    $user = new \GDS\Entity();
    $user->setKind('User')->setKeyId(123456);
    $entity = $this->target->createEntity($this->testdata, $user);
    $this->cache->set('device:all:created_by:123456', [$entity]);

    $this->target->save($entity);

    assertFalse($this->cache->get('device:all:created_by:123456'));
  }

}
