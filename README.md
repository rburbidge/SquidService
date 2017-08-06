# SquidService
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
* Clean: ```gulp clean```

## Visual Studio Code
Launch configs can be imported from ```./launch.json```

## Running the server
SquidService uses https://www.npmjs.com/package/config, and requires a config file at ```./config/*.json```.

#### Default
This uses ```./config/default.json```, which as cloned from the repo is intentionally incomplete. Fill in ```server.database.url``` with your MongoDB connection string.
```
node server.js
```

#### Production
This uses ```./config/production.json```, which is intentionally missing from the repo.
```
set NODE_ENV=production
node server.js
```

#### Custom
To make a custom "foo" configuration, e.g. ```./config/foo.json```.
```
set NODE_ENV=foo
node server.js
```

## Deploying to Azure
A fresh deployment to Azure looks like:
```
gulp deployTypes
gulp deployProdConfig -pass=<FTP password from Azure>
git push azure master
```

If you don't have the azure remote yet, run:

```git remote add azure https://sirnommington.scm.azurewebsites.net:443```

Notes on deployTypes and deployProdConfig commands:
* ```./node_modules/@types``` must be uploaded to Azure by FTP because Azure refuses to NPM sync those packages to the server.
* ```./config/production.json``` must be deployed separately because it is intentionally not included in the repo.
