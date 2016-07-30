<?php
namespace ToiletEvolution\Models\Entities;

/**
 * Device Model Entity Class
 */
class DeviceEntity extends \GDS\Entity
{
  public function toArray()
  {
    return array_merge(['id' => $this->getKeyId()], $this->getData());
  }
  
  public function toArrayWithoutSecret()
  {
    $result = $this->toArray();
    unset($result['password']);
    unset($result['created_by']);
    
    return $result;
  }
}