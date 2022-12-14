ð lambda-template
====

![GitHub issues](https://img.shields.io/github/issues/isystk/lambda-template)
![GitHub forks](https://img.shields.io/github/forks/isystk/lambda-template)
![GitHub stars](https://img.shields.io/github/stars/isystk/lambda-template)
![GitHub license](https://img.shields.io/github/license/isystk/lambda-template)

## ð ãã­ã¸ã§ã¯ãã®æ¦è¦

AWSï¼API Gateway â Lambda â DynamoDBï¼ãå©ç¨ããCRUDã®ãµã³ãã«ã§ãã
æç¨¿ãããè¨äºãã¼ã¿ãAPIçµç±ã§åå¾ã»ç»é²ã»å¤æ´ã»åé¤ãåºæ¥ã¾ãã
SAM ãå©ç¨ãã¦ç®¡çãã¦ããã®ã§ãã³ãã³ãã²ã¨ã¤ã§ã¤ã³ãã©ãæ§ç¯åºæ¥ãããã«ãã¦ãã¾ãã
ã¾ããDockerãå©ç¨ãããã¨ã§ã­ã¼ã«ã«ç°å¢ã§ãå®è£ã»ãã¹ããåºæ¥ãããã«ãã¦ãã¾ãã

## ð Demo

https://obew4p54y9.execute-api.ap-northeast-1.amazonaws.com/Prod/posts

## ð¦ ãã£ã¬ã¯ããªæ§é 

```
.
âââ README.md
âââ app (Lambdaã®ã¢ã¸ã¥ã¼ã«)
â   âââ app.js
â   âââ data
â   âââ dynamodb-client.js
â   âââ lambda.js
â   âââ local-app.js
â   âââ node_modules
â   âââ package-lock.json
â   âââ package.json
â   âââ schema
â   âââ tests
âââ dc.sh (Dockerç®¡çç¨ã®ã·ã§ã«ã¹ã¯ãªãã)
âââ docker
â   âââ awscli
â   âââ docker-compose.yml
â   âââ dynamodb
âââ layers (å±éã¢ã¸ã¥ã¼ã«)
â   âââ app-layer
âââ samconfig.toml
âââ template.yaml
```

## ð§ éçºç°å¢ã®æ§ç¯

IAM ã¦ã¼ã¶ã¼ãç¨æãã
```
ã¦ã¼ã¶åï¼ãlambda-userã
ã¢ã¯ã»ã¹æ¨©éï¼
ãAdministratorAccessã
```

SAM CLI ãã¤ã³ã¹ãã¼ã«ãã
```
$ pip install aws-sam-cli
```

AWSã«ã¢ã¯ã»ã¹ããçºã®è¨­å®ãä½æãã
```
$ aws configure --profile lambda-user 
AWS Access Key ID [None]: xxxxxxxxxx
AWS Secret Access Key [None]: xxxxxxxxxx
Default region name [None]: ap-northeast-1
Default output format [None]: json
```

## ðï¸ Docker æä½ç¨ã·ã§ã«ã¹ã¯ãªããã®ä½¿ãæ¹

```
Usage:
  dc.sh [command] [<options>]

Options:
  stats|st                 Dockerã³ã³ããã®ç¶æãè¡¨ç¤ºãã¾ãã
  init                     Dockerã³ã³ããã»ã¤ã¡ã¼ã¸ã»çæãã¡ã¤ã«ã®ç¶æãåæåãã¾ãã
  start                    ãã¹ã¦ã®Daemonãèµ·åãã¾ãã
  stop                     ãã¹ã¦ã®Daemonãåæ­¢ãã¾ãã
  --version, -v     ãã¼ã¸ã§ã³ãè¡¨ç¤ºãã¾ãã
  --help, -h        ãã«ããè¡¨ç¤ºãã¾ãã
```

## ð¬ ä½¿ãæ¹

ã­ã¼ã«ã«ã§APIãèµ·åãã
```
# äºåæºå
$ ./dc.sh init
$ docker network create lambda-local

# Dockerãèµ·åãã
$ ./dc.sh start

# DynamoDBã«ãã¼ãã«ãä½æãã
$ ./dc.sh aws local
> aws dynamodb create-table --cli-input-json file://app/schema/posts.json --endpoint-url http://dynamodb:8000  --billing-mode PAY_PER_REQUEST
> aws dynamodb list-tables  --endpoint-url http://dynamodb:8000 
> aws dynamodb scan --table-name simple_app_posts  --endpoint-url http://dynamodb:8000
(ãã¼ãã«ãåé¤ããå ´å)
> aws dynamodb delete-table --table-name simple_app_posts --endpoint-url http://dynamodb:8000

# SAMã§ã¢ããªããã«ããã¦ããAPIãèµ·åãã
$ sam build
$ sam local start-api --docker-network lambda-local

# ä¸è¦§åå¾
$ curl http://127.0.0.1:3000/posts
# ç»é²
$ curl -X POST -H "Content-Type: application/json" -d @app/data/post.json http://127.0.0.1:3000/posts
# åä¸åå¾
$ curl http://127.0.0.1:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# æ´æ°
$ curl -X PUT -H "Content-Type: application/json" -d @app/data/post.json http://localhost:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# åé¤
$ curl -X DELETE http://127.0.0.1:3000/posts/49e3de26-f28b-4140-becf-06d8b3279914/
```

æ¬çªç°å¢ï¼AWSï¼ ã«ããã­ã¤ãã
```
# ãã«ããå®è¡ããï¼.aws-samãã£ã¬ã¯ããªã«çæãããï¼
$ sam build
# AWSã«åæ ãã
$ sam deploy --config-env stg

# ä¸è¦§åå¾
$ curl https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/Prod/posts
# ç»é²
$ curl -X POST -H "Content-Type: application/json" -d @app/data/post.json https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/Prod/posts
# åä¸åå¾
$ curl https://9eu3s3iz99.execute-api.ap-northeast-1.amazonaws.com/Prod/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# æ´æ°
$ curl -X PUT -H "Content-Type: application/json" -d @app/data/post.json https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/Prod/posts/49e3de26-f28b-4140-becf-06d8b3279914/
# åé¤
$ curl -X DELETE https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/Prod/posts/49e3de26-f28b-4140-becf-06d8b3279914/

# AWSãããDynamoDBãLambda&APIGatewayãåé¤ãã
$ sam delete --stack-name simple-app --profile lambda-user
```

### DynamoDBAdmin
DynamoDBã«æ¥ç¶ãã¦ãã¼ã¿ã®åç§ãç·¨éãå¯è½ã§ãã
Dockerãèµ·åå¾ã«ä»¥ä¸ã®URLã«ã¢ã¯ã»ã¹ããã¨å©ç¨å¯è½ã§ãã

http://localhost:8001/

![DynamoDB-Admin](./dynamodb-admin.png "WSL-MySQL")


## ð¨ åè

| ãã­ã¸ã§ã¯ã| æ¦è¦|
| :---------------------------------------| :-------------------------------|
| [AWS SAM CLI åå¥é 2021.08](https://qiita.com/hayao_k/items/7827c3778a23c514e196)| AWS SAM CLI åå¥é 2021.08|
| [aws-sam-cliã§Lambda,DynamoDBã®ãµã¼ãã¼ã¬ã¹ã¢ããªã±ã¼ã·ã§ã³éçºã«å¥éãã¦ã¿ã](https://qiita.com/umeneri/items/6fb3f7560f4a878f6dfd)| aws-sam-cliã§Lambda,DynamoDBã®ãµã¼ãã¼ã¬ã¹ã¢ããªã±ã¼ã·ã§ã³éçºã«å¥éãã¦ã¿ã |
| [Lambda Layers ãnode.js(SAM)ã§è©¦ãã¦ã¿ã](https://qiita.com/monamu/items/96d63dd2151a8ab7e6cf)| Lambda Layers ãnode.js(SAM)ã§è©¦ãã¦ã¿ã |
| [serverless-expressã§API GatewayããLambdaãå®è¡ãã](https://zenn.dev/yuta_saito/articles/8b543a1957c375593ee5)| serverless-expressã§API GatewayããLambdaãå®è¡ãã |


## ð« Licence

[MIT](https://github.com/isystk/lambda-template/blob/master/LICENSE)

## ð Author

[isystk](https://github.com/isystk)
