[![Build Status](https://semaphoreci.com/api/v1/projects/e3ab9e81-83b4-4bd0-ae4e-b97e4ba471f4/1713794/badge.svg)](https://semaphoreci.com/rburbidge-squid/squidservice)

# SquidService
Squid is an app that allows a user to open web pages from Google Chrome on their Android devices and vice versa. This service, built on node.js, drives device management and integrates with [Google Cloud Messaging](https://developers.google.com/cloud-messaging/) for push notifications.

## Getting started
```
git clone https://github.com/rburbidge/SquidService.git
cd SquidService
npm install
npm install -g typescript gulp
```

## Commands
* Build: ```tsc -w```
* Run the server locally: ```npm start```
* Clean: ```git clean -fxd```
* Test in watch mode: ```npm test```
* Test in single run mode: ```npm run testSingle```

## Visual Studio Code
Launch configs can be imported from ```./launch.json```

## Running the server
SquidService uses https://www.npmjs.com/package/config, and requires a config file at ```./config/*.json```.

#### Default
This uses ```./config/default.json```, which as cloned from the repo is intentionally incomplete. Fill in ```server.database.url``` with your MongoDB connection string.
```
npm start
```

#### Production
This uses ```./config/production.json```, which is intentionally missing from the repo.
```
set NODE_ENV=production
npm start
```

#### Custom
To make a custom "foo" configuration, e.g. ```./config/foo.json```.
```
set NODE_ENV=foo
npm start
```

## Deploying to Azure
Below are the commands for a fresh deployment. You will need credentials to deploy to Azure. These can be found in the publish profile configuration, which can be found on the [Azure Portal](https://portal.azure.com/.)
```
gulp deployProdConfig -host=<FTP host> -user=<FTP username> -pass=<FTP password>
git push azure master
```

If you don't have the azure remote yet, run:

```git remote add azure https://<site name>.scm.azurewebsites.net:443```

### How the deployment works
When a new commit is pushed to ```azure master```, the ```./deploy.cmd``` script runs NPM package install. ```./deploy.cmd``` will then build the service, and then launch ```npm start``` from ```package.json```.

```gulp deployProdConfig``` deploys ```./config/production.json``` to the server's ```site/wwwroot/config``` directory. This file is intentionally not stored in the repo because it contains private data.
