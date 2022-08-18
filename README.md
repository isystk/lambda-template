🌙 lambda-template
====

![GitHub issues](https://img.shields.io/github/issues/isystk/lambda-template)
![GitHub forks](https://img.shields.io/github/forks/isystk/lambda-template)
![GitHub stars](https://img.shields.io/github/stars/isystk/lambda-template)
![GitHub license](https://img.shields.io/github/license/isystk/lambda-template)

## 📗 プロジェクトの概要

AWS Lambda 経由で DynamoDB に投稿データを登録・取得します。
SAM を利用して Lambda を管理しています。

## 🌐 Demo

https://obew4p54y9.execute-api.ap-northeast-1.amazonaws.com/Prod/posts

## 📦 ディレクトリ構造

```
.
├── docker （各種Daemon）
│   │
│   ├── awscli （Docker のDynamoDBへアクセスする為のAWS-CLIコンソール ）
│   └── docker-compose.yml
│
├── posts （SAMプロジェクト）
│   ├── data
│   ├── schema
│   ├── tests
│   ├── app.js
│   └── package.json
├── dc.sh （Dockerの起動用スクリプト）
├── samconfig.toml （SAM Deploy 用設定ファイル）
└── template.yaml （SAM テンプレート）
```

## 🔧 開発環境の構築

```
# AWS SAM CLIをインストール
$ pip install aws-sam-cli
$ sam --version
```

## 🖊️ Docker 操作用シェルスクリプトの使い方

```
Usage:
  dc.sh [command] [<options>]

Options:
  stats|st                 Dockerコンテナの状態を表示します。
  init                     Dockerコンテナ・イメージ・生成ファイルの状態を初期化します。
  start                    すべてのDaemonを起動します。
  stop                     すべてのDaemonを停止します。
  build                    SAMでBuild&Invokeを実行します。
  --version, -v     バージョンを表示します。
  --help, -h        ヘルプを表示します。
```

## 💬 使い方

```
# DockerでDynamoDBを起動する
$ ./dc.sh start

# DynamoDBにテーブルを作成する
$ ./dc.sh aws local
$ aws dynamodb create-table --cli-input-json file://app/schema/posts.json --endpoint-url http://dynamodb:8000  --billing-mode PAY_PER_REQUEST
$ aws dynamodb list-tables  --endpoint-url http://dynamodb:8000 
$ aws dynamodb scan --table-name posts  --endpoint-url http://dynamodb:8000
(テーブルを削除する場合)
$ aws dynamodb delete-table --table-name posts --endpoint-url http://dynamodb:8000

# APIを起動する (SAMを利用する場合)
$ sam build
$ sam local start-api --env-vars task/env.json

# 登録
$ curl -X POST -H "Content-Type: application/json" -d @app/data/post.json http://127.0.0.1:3000/posts
# 一覧取得
$ curl http://127.0.0.1:3000/posts
# 単一取得
$ curl http://127.0.0.1:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# 更新
$ curl -X PUT -H "Content-Type: application/json" -d @app/data/post.json http://localhost:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# 削除
$ curl -X DELETE http://127.0.0.1:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
```

本番環境（AWS） にデプロイ
```
# ビルドを実行する（.aws-samディレクトリに生成される）
$ sam build
# AWSに反映する
$ sam deploy --config-env stg
```

動作確認
```
# 登録
$ curl -X POST -H "Content-Type: application/json" -d @app/data/post.json https://9eu3s3iz99.execute-api.ap-northeast-1.amazonaws.com/Prod/posts
# 一覧取得
$ curl https://9eu3s3iz99.execute-api.ap-northeast-1.amazonaws.com/Prod/posts
# 単一取得
$ curl https://9eu3s3iz99.execute-api.ap-northeast-1.amazonaws.com/Prod/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# 更新
$ curl -X PUT -H "Content-Type: application/json" -d @app/data/post.json https://9eu3s3iz99.execute-api.ap-northeast-1.amazonaws.com/Prod/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# 削除
$ curl -X DELETE https://9eu3s3iz99.execute-api.ap-northeast-1.amazonaws.com/Prod/posts/49e3de26-f28b-4140-becf-06d8b3279914/
```

AWSから、DynamoDB、Lambda&APIGatewayを削除する
```
$ sam delete --stack-name simple-app --profile simple-app 
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
