## Document
Health check: [http://hostname/api/v1](http://hostname/api) \
Api doc: [http://hostname/apidoc](http://hostname/apidoc) 

## Installation
Install Node18, pm2, docker, docker-compose
```bash
cd nest-base
npm install
npm i -g pm2
```

## Config & Pre-Run
Create  file `.env` from file `.env.example`.

## Running the app
### dev mode

```env
docker-compose up -d redis mongo
```
```backend
npm run start:dev
# or
pm2 start --env dev

```
### test/staging mode
```
npm run build
pm2 start ecosystem-dev.config.js --env test 
```
### product mode
```
docker-compose up -d
```
