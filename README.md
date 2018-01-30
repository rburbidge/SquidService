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
* Testing: See [test commands](#Test-commands)

## Visual Studio Code
Launch configs can be imported from ```./launch.json```

## Environment variables
Name        | Description
- | -
NODE_ENV    | Defines the config file that is used. e.g. ```foo``` will cause ```config/foo.json``` to be used. If not defined, then ```default.json``` will be used.
PORT        | The port to listen on. If not defined, the the port in the config file will be used. This is just so that app hosting services such as Azure can define the port.
TEST_TARGET | The URL to run tests, e.g. https://localhost:3000. If not defined, then a node ```http.Server``` instance will be used.

## Configuration files and environments
SquidService uses https://www.npmjs.com/package/config, and requires a config file at ```./config/*.json```, where ```*``` is the value of the ```NODE_ENV``` environment variable.

NODE_ENV   | Config file      | Description
-|-|-
N/A        | default.json    | This config file is intentionally incomplete because of IDs and connection strings. Fill in all of the null fields with your application information, and use ```config.ts``` to guide you.
test       | test.json       | Points to "test" database, but all other fields are production. This is intentionally missing from the repo.
production | production.json | Production configuration file. This is intentionally missing from the repo.
foo        | foo.json        | Custom environment "foo".

## Tests

Tests are all run using mocha. There are two types of tests:
### Integration
* Execute an in-test-process node http.Server instance.
* Use in-memory mongoDB, cleared after every test.
* Mock out service calls using sinon.
### E2E
* Execute on local or remote server deployed via npm start. Defined in ```TEST_TARGET``` environment variable.
* Use persistent mongoDB.
* Do not mock out service calls.

### Test commands

When running integration tests, ```TEST_TARGET``` should not be set. When running E2E tests, ```TEST_TARGET``` should the the URL of the service to be tested, e.g. http://localhost:3000.

Test type | Test command | TEST_TARGET | Description
-|-|-|-
Integration | npm test                   | N/A        | Runs int tests in watch mode.
Integration | npm run testSingle         | N/A        | Runs int tests once.
E2E         | npm run testE2E            | Target URL | Runs E2E tests in watch mode.
E2E         | npm run testE2ESingle      | Target URL | Runs E2E tests once.
E2E         | npm run testE2ESingleStart | Target URL | Starts the server locally and waits for it to warm up, then runs E2E tests once against ```TEST_TARGET``` URL. This command is primarily used in the CI build.

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
