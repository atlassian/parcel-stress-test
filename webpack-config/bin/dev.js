#!/usr/bin/env node

// @flow

// Start of the hack for the issue with the webpack watcher that leads to it dying in attempt of watching files
// in node_modules folder which contains circular symbolic links

const DirectoryWatcher = require('watchpack/lib/DirectoryWatcher');
const _oldSetDirectory = DirectoryWatcher.prototype.setDirectory;
DirectoryWatcher.prototype.setDirectory = function(
  directoryPath,
  exist,
  initial,
  type,
) {
  // Any new files created under src/ will trigger a rebuild when in watch mode
  // If we are just adding snapshots or updating tests, we can safely ignore those
  if (directoryPath.includes('__snapshots__')) return;
  if (directoryPath.includes('__image_snapshots__')) return;
  if (directoryPath.includes('__tests__')) return;
  if (directoryPath.includes('__tests-karma__')) return;
  if (!directoryPath.includes('node_modules')) {
    _oldSetDirectory.call(this, directoryPath, exist, initial, type);
  }
};

// End of the hack

const path = require('path');
const minimatch = require('minimatch');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const historyApiFallback = require('connect-history-api-fallback');
const ora = require('ora');
const chalk = require('chalk');
const createWebpackConfig = require('../config');
const utils = require('../config/utils');
const { print, devServerBanner, errorMsg } = require('../banner');
let HOST = 'localhost';
let disableHostCheck = false;

if (process.env.VISUAL_REGRESSION) {
  HOST = '0.0.0.0';
  disableHostCheck = true;
}

const PORT = +process.env.ATLASKIT_DEV_PORT || 9000;
const stats = require('../config/statsOptions');

async function runDevServer() {
  const workspaceGlobs = process.argv
    .slice(2)
    .filter(arg => !arg.startsWith('--')) // in case we ever pass other flags to this script
    .map(arg => arg.replace(/["']/g, '')); // remove all quotes (users add them to prevent early glob expansion)
  const report = !!process.argv.find(arg => arg.startsWith('--report'));

  const mode = 'development';
  const websiteEnv = 'local';


  //
  // Creating webpack instance
  //

  const config = await createWebpackConfig({
    mode,
    websiteEnv,
    report,
    entry: path.join(process.cwd(), 'app/index.js')
  });

  const compiler = webpack(config);

  //
  // Starting Webpack Dev
  //

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) console.error(err.details);
        return reject(1); // eslint-disable-line
      }

      const statsString = stats.toString('minimal');
      if (statsString) console.log(statsString + '\n');
      if (stats.hasErrors()) return reject(2);
      console.log('CHUNKS', stats.chunks)
      resolve();
    });
  });
}

runDevServer().catch(err => {
  console.log('ERR', err)
  process.exit(err)
});
