#!/usr/bin/env node
require('dotenv/config')
const concurrently = require('concurrently');
const path = require('path');

const run = () => {
  const { result } = concurrently([{
    name: 'server',
    command: 'node ./dist/index.js',
    cwd: path.resolve(path.join(__dirname, '../'))
  }], {
    prefix: 'server',
    killOthers: ['failure'],
    restartTries: process.env.restartTries ?? 100,
  });
  result.then(res => {
    console.log(`OK:server.js`, res)
  }, err => {
    console.error(`ERROR:server.js`)
  });
};
run();
