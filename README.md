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

## Deploying to the server
* Deploy types to the server: ```gulp deployTypes```

## Running the server
SquidService uses https://www.npmjs.com/package/config, and requires a config file at ./config/*.json.

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
To make a custom "foo" configuration, ```./config/foo.json```.
```
set NODE_ENV=foo
node server.js
```

## Visual Studio Code
Launch configs can be imported from ./launch.json
