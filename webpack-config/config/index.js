// @flow
const os = require('os');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const { StatsWriterPlugin } = require("webpack-stats-plugin")

const { createDefaultGlob } = require('./utils');
const statsOptions = require('./statsOptions');

const baseCacheDir = path.resolve(
  __dirname,
  '../../../node_modules/.cache-loader',
);

module.exports = async function createWebpackConfig(
  {
    globs = createDefaultGlob(),
    mode = 'development',
    websiteEnv = 'local',
    websiteDir = process.cwd(), // if not passed in, we must be in the websiteDir already
    noMinimize = false,
    report = false,
    entry,
    output,
  } /*: {
    globs?: Array<string>,
    websiteDir?: string,
    mode: string,
    websiteEnv: string,
    noMinimize?: boolean,
    report?: boolean,
    entry?: any,
    output?: any
  }*/,
) {
  const isProduction = mode === 'production';

  return {
    stats: statsOptions,
    mode,
    performance: {
      // performance hints are used to warn you about large bundles but come at their own perf cost
      hints: false,
    },
    // parallelism: ??, TODO
    entry: entry || {
      main: getEntries({
        isProduction,
        websiteDir,
        entryPath: './src/index.tsx',
      }),
      examples: getEntries({
        isProduction,
        websiteDir,
        entryPath: './src/examples-entry.tsx',
      }),
    },
    output: output || {
      filename: '[name].js',
      path: path.resolve(websiteDir, 'dist'),
      publicPath: '/',
    },
    devtool: isProduction ? false : 'cheap-module-source-map',
    module: {
      rules: [
        {
          test: /CHANGELOG\.md$/,
          exclude: /node_modules/,
          loader: require.resolve('changelog-md-loader'),
        },
        {
          test: /\.md$/,
          exclude: /node_modules|docs/,
          loader: require.resolve('raw-loader'),
        },
        {
          test: /\.md$/,
          include: /docs/,
          exclude: /node_modules/,
          loader: require.resolve('gray-matter-loader'),
        },
        {
          test: /\.js$/,
          exclude: /node_modules|packages\/media\/media-editor\/src\/engine\/core\/binaries\/mediaEditor.js/,
          use: [
            {
              loader: 'thread-loader',
              options: {
                name: 'babel-pool',
              },
            },
            {
              loader: 'babel-loader',
              options: {
                babelrc: true,
                  presets: ['@babel/env', '@babel/react'],
                envName: 'production:esm',
                //cacheDirectory: path.resolve(baseCacheDir, 'babel'),
              },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'cache-loader',
              options: {
                cacheDirectory: path.resolve(baseCacheDir, 'ts'),
              },
            },
            {
              loader: require.resolve('ts-loader'),
              options: {
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: require.resolve('style-loader'),
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                camelCase: true,
                importLoaders: 1,
                mergeRules: false,
                modules: true,
              },
            },
          ],
        },
        {
          test: /\.(gif|jpe?g|png|ico|woff|woff2)$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
          },
        },
        {
          test: /\.svg/,
          use: {
            loader: require.resolve('svg-url-loader'),
            options: {
              limit: 512,
            },
          },
        },
        {
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader'],
        },
      ],
    },
    resolve: {
      mainFields: ['module', 'browser', 'main'],
      extensions: ['.js', '.ts', '.tsx']
    },
    resolveLoader: {
      modules: [
        path.join(__dirname, '..', '..'), // resolve custom loaders from `build/` dir
        'node_modules',
      ],
    },
    plugins: [
      new StatsWriterPlugin({
        filename: "webpackStats.json"
      }),
      // new BundleAnalyzerPlugin({
      //   analyzerMode: report ? 'static' : 'disabled',
      //   generateStatsFile: true,
      //   openAnalyzer: report,
      //   logLevel: 'error',
      //   statsOptions: statsOptions,
      //   defaultSizes: 'gzip',
      // }),
    ],
    optimization: getOptimizations({
      isProduction,
      noMinimizeFlag: noMinimize,
    }),
  };
};

//
function getEntries({ isProduction, entryPath, websiteDir }) {
  const absEntryPath = path.join(websiteDir, entryPath);
  if (isProduction) {
    return absEntryPath;
  }
  const port = process.env.ATLASKIT_DEV_PORT || '9000';
  const devServerPath = `${require.resolve(
    'webpack-dev-server/client',
  )}?http://localhost:${port}/`;
  return [devServerPath, absEntryPath];
}

function getOptimizations({ isProduction, noMinimizeFlag }) {
  if (!isProduction) {
    // If we are in development, use all of webpack's default optimizations ("do nothing")
    return undefined;
  }
  const uglifyPlugin = new UglifyJsPlugin({
    parallel: Math.max(os.cpus().length - 1, 1),
    uglifyOptions: {
      compress: {
        // Disabling following options speeds up minimization by 20 - 30s
        // without any significant impact on a bundle size.
        //arrows: false,
        booleans: false,
        collapse_vars: false,

        // https://product-fabric.atlassian.net/browse/MSW-436
        comparisons: false,
        // We disables a lot of these rules because they don't effect the size very much, but cost a lot
        // of time
        //computed_props: false,
        hoist_funs: false,
        hoist_props: false,
        hoist_vars: false,
        if_return: false,
        inline: false,
        join_vars: false,
        keep_infinity: true,
        loops: false,
        negate_iife: false,
        properties: false,
        reduce_funcs: false,
        reduce_vars: false,
        sequences: false,
        side_effects: false,
        switches: false,
        top_retain: false,
        toplevel: false,
        typeofs: false,
        unused: false,

        // Switch off all types of compression except those needed to convince
        // react-devtools that we're using a production build
        conditionals: true,
        dead_code: true,
        evaluate: true,
      },
      mangle: true,
    },
  });

  return {
    // There's an interesting bug in webpack where passing *any* uglify plugin, where `minimize` is
    // false, causes webpack to use its own minimizer plugin + settings.
    minimizer: noMinimizeFlag ? undefined : [uglifyPlugin],
    minimize: noMinimizeFlag ? false : true,
    splitChunks: {
      // "Maximum number of parallel requests when on-demand loading. (default in production: 5)"
      // The default value of 5 causes the webpack process to crash, reason currently unknown
      maxAsyncRequests: Infinity,
    },
  };
}
