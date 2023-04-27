# PS8

## Web version

### Run in dev mode

For example on your own computer

```bash
npm install
```

```bash
docker-compose up
```

### Run in prod mode

For example on an AWS EC2 instance

```bash
docker-compose --env-file ./env/docker-prod.env up -d
```

## Cordova version

Add android platform
```bash
cd cordova
```

```bash
cordova platform add android
```

Build and run
```bash
cordova run android
```