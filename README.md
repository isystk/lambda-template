🌙 lambda-template
====

![GitHub issues](https://img.shields.io/github/issues/isystk/lambda-template)
![GitHub forks](https://img.shields.io/github/forks/isystk/lambda-template)
![GitHub stars](https://img.shields.io/github/stars/isystk/lambda-template)
![GitHub license](https://img.shields.io/github/license/isystk/lambda-template)

## 📗 プロジェクトの概要

AWS（API Gateway → Lambda → DynamoDB）を利用したCRUDのサンプルです。
投稿された記事データをAPI経由で取得・登録・変更・削除が出来ます。
SAM を利用して管理しているので、コマンドひとつでインフラを構築出来るようにしています。
また、Dockerを利用することでローカル環境でも実装・テストが出来るようにしています。

## 🌐 Demo

![デモ画面](./demo.png "デモ画面")

## 📦 ディレクトリ構造

```
.
├── README.md
├── app (Lambdaのモジュール)
│   ├── dist
│   ├── jest.config.ts
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   ├── tests
│   └── tsconfig.json
├── dc.sh (Docker管理用のシェルスクリプト)
├── docker
│   ├── awscli
│   ├── docker-compose.yml
│   └── dynamodb
├── layers (共通モジュール)
│   └── app-layer
├── samconfig.toml
├── schema
│   ├── data
│   └── posts.json
├── task
│   ├── env.json
│   └── env.json.example
└── template.yaml
```

## 🔧 事前準備

※ この環境を利用する為には、事前にdocker、docker-composeが動作する状態であることが前提条件です。
(Windowsの場合は、以下を参考に「WSL」と「Docker Desktop for Windows」を用意してください)

### WSLのインストール（Windowsの場合）
参考
https://docs.microsoft.com/ja-jp/windows/wsl/install

WSLでUbuntuを起動する
```
# 初回起動時に、ユーザ名とパスワードが聞かれます。
# 何も入力せずにEnterを押すとroot ユーザーで利用できるようになるので、rootユーザーとして設定します。

# 初めにライブラリを最新化します。
$ apt update

# 日本語に対応しておきます。
$ apt -y install language-pack-ja
$ update-locale LANG=ja_JP.UTF8
$ apt -y install manpages-ja manpages-ja-dev
```

### Docker Desktop for Windows のインストール（Windowsの場合）

https://docs.docker.com/docker-for-windows/install/
```
↓コマンドプロンプトでバージョンが表示されればOK
docker --version
```

### WSL2から、Docker for Windows を利用できるようにする（Windowsの場合）
参考
```
１．通知領域から、dockerのアイコンを右クリックして、Settingを選択
２．Generalの「Expose daemon on tcp://localhost:2375 without TLS」のチェックを入れます。
３．Resourcesの「WSL INTEGRATION」から、"Ubuntu" をスイッチをONにします。

WSL 側のルートを Docker for Windows に合わせるように WSL のマウント設定を行います。
$ vi /etc/wsl.conf
---
[automount]
root = /
options = "metadata"
---

以下のように Cドライブのパスが"/mnt/c/"→"/c/" に変更されていれば正常です。
$ cd /c/Users/USER/github/lambda-template
$ pwd
/c/Users/USER/github/lambda-template

# WSL 上にDockerとDocker Composeをインストールする。
$ apt install docker
$ apt install docker-compose

これでWSLからWindows側にインストールしたDockerが利用できるようになります。
```

## 💬 開発環境の構築

### 各種デーモンを起動する

```
# 初期化してDocker用のネットワークを作成する
$ ./dc.sh init
$ docker network create lambda-local

# Dockerの各種デーモンを起動する
$ ./dc.sh start
```

| デーモン | 概要                                                 | URL |
|:-----|:---------------------------------------------------|:-----|
| DynamoDB | AWSが提供するNoSQLデータベースサービスで、高可用性・可変性が特徴的なクラウドデータベースです | |
| DynamoDBAdmin | DynamoDBのWebベースの管理ツールで、データの可視化や簡単な操作が可能です          | http://localhost:8001/ |
| console | node.jsのランタイム環境です。AWS-CLIコマンドも利用できます               | |
| mailhog  | ダミーのメールサーバーです。実際にはメールは送信されず、送信されたメールはブラウザで閲覧できます   | http://localhost:8025/  |


### バックエンド（Lambda）の開発環境

事前準備
```
# コンソールにログインする
$ ./dc.sh console login

# DynamoDBにテーブルを作成する
> aws dynamodb create-table --cli-input-json file://schema/posts.json --endpoint-url http://dynamodb:8000  --billing-mode PAY_PER_REQUEST
> aws dynamodb list-tables  --endpoint-url http://dynamodb:8000 

(テーブルを削除する場合)
> aws dynamodb delete-table --table-name lambda_template_posts --endpoint-url http://dynamodb:8000

$ cd app
# Envファイルをコピーして必要に応じて変更する
$ cp .env.example .env
$ npm install
```

動作確認
```
# コンソールにログインする
$ ./dc.sh app login

# ビルドして起動する（docker-composeで自動で実行しているので手動で起動したい場合）
$ npm run dev

# 一覧取得
$ curl http://127.0.0.1:3000/posts
$ curl "http://127.0.0.1:3000/posts?limit=3&page=2"
$ curl "http://127.0.0.1:3000/posts?userId=aaa"
# 登録
$ curl -X POST -H "Content-Type: application/json" -d @data/post.json http://127.0.0.1:3000/posts
# 単一取得
$ curl http://127.0.0.1:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# 更新
$ curl -X PUT -H "Content-Type: application/json" -d @data/post.json http://localhost:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# 削除
$ curl -X DELETE http://127.0.0.1:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
```


## 🖊️ SAM-CLIの使い方

事前準備
```
# SAM CLI をインストールする
$ pip install aws-sam-cli

# ESModuleでビルドできるようにする
$ npm install -g esbuild

# AWSコンソールから、IAM ユーザーを用意してください。
----
ユーザ名：「lambda-user」
アクセス権限：
「AdministratorAccess」
----

# AWSにアクセスする為の設定を作成する
$ aws configure --profile lambda-user
AWS Access Key ID [None]: xxxxxxxxxx
AWS Secret Access Key [None]: xxxxxxxxxx
Default region name [None]: ap-northeast-1
Default output format [None]: json
```

SAMを利用してローカルでAPIを起動する
```
# ビルドを実行する（.aws-samディレクトリに生成される）
$ sam build
# Envファイルをコピーして必要に応じて変更する
$ cp task/env.json.example task/env.json
$ sam local start-api --env-vars task/env.json --docker-network lambda-local
# 動作確認
$ curl http://127.0.0.1:3000/posts
```

本番環境（AWS） にデプロイする
```
# AWSに反映する
$ sam deploy --config-env stg

# （AWSから削除する場合）
$ sam delete --stack-name lambda-template --profile lambda-user
```

## 🎨 参考

| プロジェクト| 概要|
| :---------------------------------------| :-------------------------------|
| [AWS SAM CLI 再入門 2021.08](https://qiita.com/hayao_k/items/7827c3778a23c514e196)| AWS SAM CLI 再入門 2021.08|
| [aws-sam-cliでLambda,DynamoDBのサーバーレスアプリケーション開発に入門してみる](https://qiita.com/umeneri/items/6fb3f7560f4a878f6dfd)| aws-sam-cliでLambda,DynamoDBのサーバーレスアプリケーション開発に入門してみる |
| [Lambda Layers をnode.js(SAM)で試してみる](https://qiita.com/monamu/items/96d63dd2151a8ab7e6cf)| Lambda Layers をnode.js(SAM)で試してみる |
| [serverless-expressでAPI GatewayからLambdaを実行する](https://zenn.dev/yuta_saito/articles/8b543a1957c375593ee5)| serverless-expressでAPI GatewayからLambdaを実行する |


## 🎫 Licence

[MIT](https://github.com/isystk/lambda-template/blob/master/LICENSE)

## 👀 Author

[isystk](https://github.com/isystk)
