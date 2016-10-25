<?php
namespace Test\ToiletEvolution\Model;

use google\appengine\testing\ApiProxyTestBase;

abstract class GDSTestBase extends ApiProxyTestBase
{
  protected function createStore($name)
  {
    $obj_gateway = new \GDS\Gateway\ProtoBuf('Dataset');
    $obj_store = new \GDS\Store($name, $obj_gateway);
    return $obj_store;
  }
  protected function createMockStore($name, $mockMethods)
  {
    $obj_gateway = new \GDS\Gateway\ProtoBuf('Dataset');
    $obj_store = $this->getMockBuilder('\GDS\Store')->setConstructorArgs([$name, $obj_gateway])->setMethods($mockMethods)->getMock();
    return $obj_store;

  }
}
