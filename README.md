# Toilet Evolition Server

このプログラムはトイレ監視のサーバー側プログラムで、Google App Engine で動作します。

https://toiletevolution.space

## 前提事項

### Google Cloud SDK

ローカルで開発/実行するために、Google Cloud SDK が必要です。
以下のURLからダウンロードしてインストールしておいてください。

https://cloud.google.com/sdk/docs/?hl=ja

またSDKを実行するために `python` が必要になります。バージョン情報などは上記公式ドキュメントを参照してください。

### PHP 8.2

GAEでサポートされている最新PHPのバージョンが8.2のため、ローカルにも同じバージョンのPHPが必要になります。

以下のようなPHP環境切り替えツールを使って、バージョン8.2のPHPを用意してください。

- anyenv
- phpenv
- phpbrew(Mac OSXの場合のみ)

#### 拡張

Redis の拡張をインストールしておくこと

```
$ pecl install redis
```

### Node.js

フロントエンド開発およびビルド、デプロイなどのタスク実行のため `Node.js` が必要になります。

バージョン4以上であれば動作すると思いますが、なるべく最新のバージョンを利用することが推奨されます。

## インストール

GitHubからリポジトリのコードをcloneまたはダウンロードしてください。

以下のコマンドを実行し、必要な依存関係をダウンロードします。

```
$ npm install
```

npmの `post install` で `bower install` と `composer.install` が実行されるので、上記コマンドだけで依存関係を解決します。

## 環境設定

`Google Map` および `Google Chart` を（実行環境で）表示するために、GoogleのAPIキーが必要になります。

※ローカル環境での実行には必要ありません

以下の環境変数を設定しておいてください。

```
export APIKEY=GoogleのAPIキー
```

`src/settings.php.default` ファイルをコピーして `src/settings.php` にして、以下の環境設定を変更してください。
`oauth` の設定は、現時点ではGoogle+のみ有効となっています。

```php
<?php
return [
    'settings' => [
        'displayErrorDetails' => false, // falseに変更する

        // Monolog settings
        'logger' => [
            'name' => 'toilet-evolution',
        ],
        
        'oauth' => [
            'clientId'     => 'PLEASE SET YOUR CLIENT ID',
            'clientSecret' => 'PLEASE SET YOUR CLIENT SECRET',
            'redirectUri'  => 'http://localhost:8888/auth/google/callback', // PLEASE CHANGE URI
            'hostedDomain' => 'http://localhost:8888',                      // PLEASE CHANGE DOMAIN
        ],
        
        'storage' => [
            'name' => 'toiletevolution.appspot.com'
        ],
        
    ],
];
```

## ローカルでの実行方法

ビルド前に編集しながら動作を確認したい場合などには、以下のコマンドを実行します。

```
$ npm run debug
```

ルートディレクトリの `app.yml` ファイルを使って、`dev_appserver.py` を実行します。

http://localhost:8888

でアクセス可能になります。

## ビルド方法

ビルドだけを実行する場合は、以下のコマンドを実行します。

```
$ npm run build
```

ビルドした結果は `.tmp` に保存されます。

ビルドしたアプリケーションの動作確認をしたい場合は、以下のコマンドを実行します（ビルドも実行されます）。

```
$ npm start
```

## 自動テスト

以下のコマンドを実行すると、ローカルのSDK上でGAEの機能を使った自動テストを実行します。

```
$ npm test
```

### Redis の起動

```
$ docker run -e REDIS_ARGS="--requirepass redis" -p 6379:6379 redis/redis-stack:latest
```

### データストアの起動

```
$ gcloud beta emulators datastore start
$ $(gcloud beta emulators datastore env-init)
```

テストが終了したら以下のコマンドで環境変数を削除できる

```
$ $(gcloud beta emulators datastore env-unset)
```

### PHPUnitの実行

```
composer run-script t
```
