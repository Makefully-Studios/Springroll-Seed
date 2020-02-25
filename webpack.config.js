const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlConfig = require(path.join(__dirname, 'html.config'));
const deploy = path.join(__dirname, 'deploy'),
    webpack = require('webpack');

module.exports = env => {
  const plugins = [
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
  return {
    stats: 'errors-only',
    mode: env.dev ? 'development' : 'production',
    resolve: {
        alias: {
            config: path.join(__dirname, 'node_modules/platypus/src/config', env.dev ? 'development' : 'production')
        }
    },
    devServer: {
      contentBase: path.join(__dirname, '/static')
    },
    entry: ['@babel/polyfill', path.join(__dirname, '/src/index.js')],
    output: {
      path: deploy
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
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
          exclude: /(node_modules\/(?!platypus)|bower_components)/,
          use: {
            loader: 'babel-loader'
          }
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
                outputPath: path.join(deploy + '/assets/audio/')
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
                outputPath: path.join(deploy + '/assets/video/')
              }
            }
          ]
        }
      ]
    }
  };
};