#!/usr/bin/env node
require('dotenv/config')
const concurrently = require('concurrently');
const path = require('path');

const run = () => {
  const DIR = __dirname;
  const cwd = path.resolve(path.join(DIR, '../'));
  const isDist = cwd?.includes('/dist');
  const cmd = `node  ${isDist ? '' : './dist/src/'}index.js`
  console.log(`script:server.js -> \n[isDist=${isDist}]\n[cmd=${cmd}]\n[cwd=${cwd}]`)
  const { result } = concurrently([{
    name: 'server',
    command: cmd,
    cwd,
  }], {
    prefix: 'server',
    killOthers: ['failure'],
    restartTries: process.env.restartTries ?? 1,
  });
  result.then(res => {
    console.log(`OK:server.js`, res)
  }, err => {
    console.error(`ERROR:server.js`)
  });
};
run();
