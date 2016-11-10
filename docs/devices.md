FORMAT: 1A
 
# Group デバイス
 
## センサー値のエンドポイント [/api/devices/{id}/values]

+ Parameters
    + id: `543210`  - デバイスID

### センサー値送信 [POST]
 
#### 処理概要
 
* センサーから取得した値を配列で送信する。
* デバイス登録時の `センサー0` が `0` 番目の値に対応する
 
+ Request (application/json)
 
    + Headers
 
            Accept: application/json
            Authorization: Basic ABC123
 
    + Attributes(array[number], required)
        + 1 (number)
        + 0 (number)
 
+ Response 201

### センサー値取得 [GET]
 
#### 処理概要
 
* 登録されている直近5分以内のセンサー値を配列で取得する。
* 配列の内容
    + created - データ受信日時
    + payload - センサーの値。デバイス登録時の `センサー0` が `0` 番目の値に対応する
* 直近5分以内のデータが1件もない場合は `204` が返却される。

 
+ Response 200 (application/json)

    + Attributes(array[DeviceValue], required)

+ Response 204

## 詳細情報のエンドポイント [/api/devices/{id}]

+ Parameters
    + id: `543210`  - デバイスID

### 詳細情報取得 [GET]
 
#### 処理概要
 
* 登録されている直近5分以内のセンサー値を配列で取得する。
* デバイス登録時の `センサー0` が `0` 番目の値に対応する
* デバイスIDに一致するデバイスが見つからない場合は `404` が返却される。
 
+ Response 200 (application/json)

    + Attributes(Device)

+ Response 404

## デバイス一覧のエンドポイント [/api/devices]

### 一覧取得 [GET]
 
#### 処理概要
 
* 登録されているデバイスの一覧を取得する。
* デバイスが1件も登録されていない場合は `204` が返却される。
 
+ Response 200 (application/json)

    + Attributes(array[Device])

+ Response 204

# Data Structures

## DeviceValue (object)

+ created : `2015-12-25T14:15:16-05:00` (string, required) - データ受信日時
+ payload (array, required) - センサーの値
    + (number)

## Device (object)

+ name (string, required) - デバイス名
+ thresholds (object, required) - しきい値
    + value : 20 (string, required) - 空室になるときの値
    + condition (enum[string], required) - 空室になるための条件
        + Members
            + eq
            + gt
            + lt
+ location (object, required) - 設置場所
    + latitude : `12.34` (string, required) - 緯度
    + longitude : `35.67` (string, required) - 経度
