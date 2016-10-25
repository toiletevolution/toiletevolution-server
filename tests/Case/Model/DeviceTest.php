<?php
namespace Test\ToiletEvolution\Model;

use ToiletEvolution\Models\Device;
use ToiletEvolution\Models\Entities\DeviceEntity;
use GeckoPackages\MemcacheMock\MemcachedMock;

class DeviceTest extends GDSTestBase
{
  private $target;
  private $cache;

  public function setUp()
  {
    parent::setUp();
    $this->cache = new MemcachedMock();
    $this->cache->addServer('127.0.0.1', 11211);
    $this->target = new Device($this->createStore('Device'), $this->cache);
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

    $results = $this->target->createEntity([
      'name' => 'username',
      'password' => '12345678',
      'thresholds' => ['value' => 20, 'condition' => 'eq'],
      'location' => ['latitude' => '12.34', 'longitude' => '35.67']
    ], $user);

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
    $target = new Device($this->createMockStore('Device', ['upsert']), $this->cache);
    $entity = $target->createEntity();
    $entity->setKeyId(123456);
    $target->save($entity);

    assertEquals($entity, $this->cache->get('device:id:123456'));
  }

  public function testAllCacheShouldRemovedAfterSave()
  {
    $target = new Device($this->createMockStore('Device', ['upsert']), $this->cache);
    $entity = $target->createEntity();
    $entity->setKeyId(123456);
    $this->cache->set('device:all', [$entity]);

    $target->save($entity);

    assertFalse($this->cache->get('device:all'));
    assertEquals(\Memcached::RES_NOTFOUND, $this->cache->getResultCode());
  }

  public function testCreatedUserCacheShouldRemovedAfterSave()
  {
    $target = new Device($this->createMockStore('Device', ['upsert']), $this->cache);
    $user = new \GDS\Entity();
    $user->setKind('User')->setKeyId(123456);
    $entity = $target->createEntity([
      'name' => 'username',
      'password' => '12345678',
      'thresholds' => ['value' => 20, 'condition' => 'eq'],
      'location' => ['latitude' => '12.34', 'longitude' => '35.67']
    ], $user);
    $entity->setKeyId(999);
    $this->cache->set('device:all:created_by:123456', [$entity]);

    $target->save($entity);

    assertFalse($this->cache->get('device:all:created_by:123456'));
  }

}
