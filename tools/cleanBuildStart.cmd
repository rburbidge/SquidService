cd ..
git clean -fxd -e node_modules
tsc
node server.js