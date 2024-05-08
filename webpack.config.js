const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlConfig = require(path.join(__dirname, 'html.config'));
const CleanPlugin = require('clean-webpack-plugin');
const os = require('os');
const ESLintPlugin = require('eslint-webpack-plugin');
const deploy = path.join(__dirname, 'deploy');

const isProduction = process.env.NODE_ENV == "production";

// keep the env param to be explicit, eslint disable should be removed when template is in use
// eslint-disable-next-line no-unused-vars
module.exports = (env) => {
  const plugins = [
    new CleanPlugin.CleanWebpackPlugin(),
    new HtmlWebpackPlugin(HtmlConfig),
    new MergeJsonWebpackPlugin({
        "output": {
            "groupBy": [
                {
                    "pattern": "./src/config/**/*.json",
                    "fileName": "./temp.json"
                }
            ]
        }
    }),
    new MiniCssExtractPlugin({ filename: 'css/game.style.css' }),
    new CopyPlugin({
      patterns: [
        { from: path.join(__dirname + '/static'), to: deploy }
      ]
    }),
    new ESLintPlugin()
  ];

  // Get running network information
  let networkInfo = os.networkInterfaces();
  let ipAddress;

  // Depending on operating system the network interface will be named differntly. Check if each exists to find the correct syntax
  if (networkInfo.en0){
    ipAddress = networkInfo.en0[1].address;
  } else if (networkInfo.en7) {
    ipAddress = networkInfo.en7[1].address;
  } else  if (networkInfo['Wi-Fi']){
    ipAddress = networkInfo['Wi-Fi'][1].address;
  } else  if (networkInfo['Ethernet']){
    ipAddress = networkInfo['Ethernet'][1].address;
  } else  if (networkInfo.eth0){
    ipAddress = networkInfo.eth0[1].address;
  }
  
  if (ipAddress) {
    console.log('\x1b[36m%s\x1b[0m', "NETWORK HOST: http://" + ipAddress + ":8080") 
  } else {
    console.log('\x1b[36m%s\x1b[0m', "Unable to find network address");
  }

  return {
    stats: 'errors-only',
    mode: isProduction ? 'production':'development',
    resolve: {
        alias: {
            config: path.join(__dirname, 'node_modules/platypus/src/config', env.dev ? 'development' : 'production')
        }
    },
    devServer: {
      open: true,
      client: { overlay: true },
      host: '0.0.0.0',
      port: 8080,
      static: path.join(__dirname, '/static')
    },
    context: path.resolve(__dirname, 'src'),

    entry: path.join(__dirname, '/src/index.js'),
    output: {
      filename: 'js/game.bundle.js',
      path: deploy
    },
    plugins,

    module: {
      rules: [
        {
          test: /\.atlas$/i,
          use: 'raw-loader',
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        },
        {
          test: /\.js$/,
          exclude: /(node_modules\/(?!platypus|recycle)|bower_components)/,
          use: ['babel-loader']
        },
        {
          test: /\.(otf|woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: 'asset/resource',
          dependency: {
              not: ['url']
          }
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: './assets/image/[hash][ext][query]'
          }
        },
        {
          test: /\.(mp3|ogg)$/,
          type: 'asset/resource',
          generator: {
            filename: './assets/audio/[hash][ext][query]'
          }
        },
        {
          test: /\.(mp4)$/,
          type: 'asset/resource',
          generator: {
            filename: './assets/video/[hash][ext][query]'
          }
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
        },
      ]
    }
  };
};