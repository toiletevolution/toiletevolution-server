<?php
namespace Test\ToiletEvolution\Model;

use ToiletEvolution\Services\DeviceValuesServiceGsImpl;
use PHPUnit\Framework\TestCase;

class DeviceValuesServiceGsImplTest extends TestCase
{
  private $target;

  /**
   * @before
   */
  public function before()
  {
    $this->target = new DeviceValuesServiceGsImpl('test.toiletevolution.appspot.com');
  }

  public function testGetFileName()
  {
    $this->assertEquals('gs://test.toiletevolution.appspot.com/id1234.json', $this->target->getFileName('id1234'));
  }
}
