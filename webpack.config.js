const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlConfig = require(path.join(__dirname, 'html.config'));
const CleanPlugin = require('clean-webpack-plugin');
const os = require('os');
const deploy = path.join(__dirname, 'deploy'),
    webpack = require('webpack');

module.exports = env => {
  const plugins = [
    new CleanPlugin.CleanWebpackPlugin(),
    new webpack.ProvidePlugin({ // Needed to import pixi-spine correctly.
      PIXI: 'pixi.js'
    }),
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
    new MiniCssExtractPlugin(),
    new CopyPlugin([{ from: path.join(__dirname + '/static'), to: deploy }]),
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
    mode: env.dev ? 'development' : 'production',
    resolve: {
        alias: {
            config: path.join(__dirname, 'node_modules/platypus/src/config', env.dev ? 'development' : 'production')
        }
    },
    devServer: {
      open: true,
      overlay: true,
      host: '0.0.0.0',
      public: 'localhost:8080',
      contentBase: path.join(__dirname, '/static')
    },
    context: path.resolve(__dirname, 'src'),

    entry: ['@babel/polyfill', path.join(__dirname, '/src/index.js')],
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
          use: ['babel-loader', 'eslint-loader']
        },
        {
          test: /\.(otf|woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                useRelativePath: true
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: path.join(deploy + 'assets/image')
              }
            }
          ]
        },
        {
          test: /\.(mp3|ogg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: path.join(deploy + '/assets/audio')
              }
            }
          ]
        },
        {
          test: /\.(mp4)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: path.join(deploy + '/assets/video')
              }
            }
          ]
        }
      ]
    }
  };
};