<?php
namespace Test\ToiletEvolution\Model;

use ToiletEvolution\Services\DeviceValuesServiceLocalImpl;
use PHPUnit\Framework\TestCase;

class DeviceValuesServiceLocalImplTest extends TestCase
{
  private $target;

  /**
   * @before
   */
  public function before()
  {
    $this->target = new DeviceValuesServiceLocalImpl('test.toiletevolution.appspot.com');
  }

  public function testGetFileName()
  {
    $this->assertEquals(sys_get_temp_dir() . '/test.toiletevolution.appspot.com/id1234.json', $this->target->getFileName('id1234'));
  }

  public function testGetFileNameAfterSetRoot()
  {
    $dir = dirname(dirname(dirname(dirname(__FILE__)))) . DIRECTORY_SEPARATOR . 'localstorage';
    $this->target->setRoot($dir);
    $this->assertEquals($dir . '/test.toiletevolution.appspot.com/id1234.json', $this->target->getFileName('id1234'));
  }
}
