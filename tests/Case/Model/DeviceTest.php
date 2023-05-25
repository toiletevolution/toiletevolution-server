<?php
namespace Test\ToiletEvolution\Model;

use ToiletEvolution\Models\Device;
use ToiletEvolution\Models\Entities\DeviceEntity;
use PHPUnit\Framework\TestCase;
use M6Web\Component\RedisMock\RedisMock;

class DeviceTest extends TestCase
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

  /**
   * @before
   */
  public function before()
  {
    $this->cache = new RedisMock();
    $this->store = new \GDS\Store('Devices');
    $this->target = new Device($this->store, $this->cache);
    $this->user = new \GDS\Entity();
    $this->user->setKind('User')->setKeyId("".rand());
    $this->store->delete($this->store->fetchAll());
    $this->cache->flushDb();
  }

  public function testCreateEmptyEntity()
  {
    $results = $this->target->createEntity();
    $this->assertInstanceOf(DeviceEntity::class, $results);
  }

  public function testCreateParameterizedEntity()
  {
    $results = $this->target->createEntity($this->testdata, $this->user);

    $this->assertEquals('username', $results->name);
    $this->assertTrue(password_verify('12345678', $results->password));
    $this->assertEquals('{"value":20,"condition":"eq"}', $results->thresholds);
    $this->assertEquals('12.34', $results->latitude);
    $this->assertEquals('35.67', $results->longitude);
    $this->assertInstanceOf(\DateTime::class, $results->created_at);
    $this->assertEquals($this->user->getKeyId(), $results->created_by);
  }

  public function testSaveWithCache()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->target->save($entity);

    $this->assertEquals($entity, unserialize($this->cache->get('device:id:'.$entity->getKeyId())));
    $this->assertEquals('username', $this->store->fetchById($entity->getKeyId())->name);
  }

  public function testAllCacheShouldRemovedAfterSave()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set('device:all', [$entity]);

    $this->target->save($entity);

    $this->assertEquals($this->cache->exists('device:all'), 0);
  }

  public function testCreatedUserCacheShouldRemovedAfterSave()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set("device:all:created_by:{$this->user->getKeyId()}", serialize([$entity]));

    $this->target->save($entity);

    $this->assertNull($this->cache->get("device:all:created_by:{$this->user->getKeyId()}"));
  }

  public function testFindCreatedByIdFromCache()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set("device:all:created_by:{$this->user->getKeyId()}", serialize([$entity]));
    $actual = $this->target->byCreatedBy($this->user);

    $this->assertCount(1, $actual);
    $this->assertEquals('username', $actual[0]->name);
  }

  public function testFindCreatedByIdFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);
    $this->store->fetchById($entity->getKeyId());

    $actual = $this->target->byCreatedBy($this->user);

    $this->assertCount(1, $actual);
    $this->assertEquals('username', $actual[0]->name);
  }

  public function testFindByIdFromCache()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set('device:id:1234', serialize($entity));

    $actual = $this->target->byId("1234");

    $this->assertEquals('username', $actual->name);
  }

  public function testFindByIdFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);
    $actual = $this->target->byId($entity->getKeyId());

    $this->assertEquals('username', $actual->name);
  }

  public function testFindByIdAndCreatedByShouldReturnNullIfNotExists()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);

    $anotherUser = new \GDS\Entity();
    $anotherUser->setKind('User')->setKeyId("".rand());

    $actual = $this->target->byIdAndCreatedBy($entity->getKeyId(), $anotherUser);

    $this->assertNull($actual);
  }

  public function testFindByIdAndCreatedBy()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);

    $actual = $this->target->byIdAndCreatedBy($entity->getKeyId(), $this->user);

    $this->assertEquals('username', $actual->name);
  }

  public function testFindAllFromCache()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->cache->set("device:all", serialize([$entity]));

    $actual = $this->target->all();

    $this->assertCount(1, $actual);
    $this->assertEquals('username', $actual[0]->name);
  }

  public function testFindAllFromDatastore()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);
    $this->store->fetchById($entity->getKeyId());

    $actual = $this->target->all();

    $this->assertCount(1, $actual);
    $this->assertEquals('username', $actual[0]->name);
  }

  public function testDelete()
  {
    $entity = $this->target->createEntity($this->testdata, $this->user);
    $this->store->upsert($entity);
    $key = $entity->getKeyId();

    $this->target->delete($entity);

    $actual = $this->store->fetchById($key);
    $this->assertNull($actual);
    $this->assertEquals($this->cache->exists('device:all'), 0);
    $this->assertEquals($this->cache->exists("device:id:{$key}"), 0);
    $this->assertEquals($this->cache->exists("device:all:created_by:{$this->user->getKeyId()}"), 0);
  }

  /**
   * @dataProvider deviceData
   */
  public function testValidate($json, $valid, $message)
  {
    $json = json_decode($json);
    $this->assertEquals($valid, $this->target->validate($json), $message);
  }

  public function deviceData()
  {
    return [
      ['', false, 'Empty is invalid'],
      ['{"name": "hoge", "password": "pass", "thresholds": [{"value": "1", "condition": "eq"}], "location": {"latitude": 123.45, "longitude": 345.678}}', true, 'Valid Data'],
      ['{"password": "pass", "thresholds": [{"value": "1", "condition": "eq"}], "location": {"latitude": 123.45, "longitude": 345.678}}', false, 'Name is required'],
      ['{"name": "hoge", "thresholds": [{"value": "1", "condition": "eq"}], "location": {"latitude": 123.45, "longitude": 345.678}}', false, 'Password is required'],
      ['{"name": "hoge", "password": "pass", "location": {"latitude": 123.45, "longitude": 345.678}}', false, 'Thresholds is required'],
// TODO: Json Schema library couldn't valid object in array
//      ['{"name": "hoge", "password": "pass", "thresholds": [{"condition": "eq"}], "location": {"latitude": 123.45, "longitude": 345.678}}', false, 'Thresholds value is required'],
//      ['{"name": "hoge", "password": "pass", "thresholds": [{"value": "1"}], "location": {"latitude": 123.45, "longitude": 345.678}}', false, 'Thresholds condition is required'],
//      ['{"name": "hoge", "password": "pass", "thresholds": [{"value": "1", "condition": "equal"}], "location": {"latitude": 123.45, "longitude": 345.678}}', false, 'Thresholds condition is only gt,eq,lt'],
      ['{"name": "hoge", "password": "pass", "thresholds": [{"value": "1", "condition": "eq"}]}', false, 'location is required'],
      ['{"name": "hoge", "password": "pass", "thresholds": [{"value": "1", "condition": "eq"}], "location": {"longitude": 345.678}}', false, 'location latitude is required'],
      ['{"name": "hoge", "password": "pass", "thresholds": [{"value": "1", "condition": "eq"}], "location": {"latitude": 123.45}}', false, 'location longitude is required'],
      ['{"name": "hoge", "password": "pass", "thresholds": [{"value": 1, "condition": "eq"}], "location": {"latitude": 123.45, "longitude": 345.678}}', false, 'thresholds value should string'],
    ];
  }
}
