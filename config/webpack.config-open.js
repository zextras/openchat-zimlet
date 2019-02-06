/*
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

var webpack = require("webpack");
var BannerPlugin = webpack.BannerPlugin;
var path = require("path");
var autoprefixer = require('autoprefixer');

var license = [];
license.push("Copyright (C) " + ((new Date()).getFullYear()) + " ZeXtras S.r.l.");
license.push("");
license.push("This program is free software; you can redistribute it and/or");
license.push("modify it under the terms of the GNU General Public License");
license.push("as published by the Free Software Foundation, version 2 of");
license.push("the License.");
license.push("");
license.push("This program is distributed in the hope that it will be useful,");
license.push("but WITHOUT ANY WARRANTY; without even the implied warranty of");
license.push("MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the");
license.push("GNU General Public License for more details.");
license.push("");
license.push("You should have received a copy of the GNU General Public License.");
license.push("If not, see <http://www.gnu.org/licenses/>.");

var cow = "function Cow() {}\nCow.prototype.moo = function() { console.log('Moo!'); };";

module.exports = {
  entry: {
    com_zextras_chat_open_bundle: "./src/OpenChatZimlet.ts"
  },
  output: {
    path: path.resolve(__dirname, "../build/"),
    filename: '[name].js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/service/zimlet/com_zextras_chat_open/',
    jsonpFunction: "com_zextras_chat_open_jsonp"
  },
  resolve: {
    extensions: [".js", ".json", ".tsx", ".ts"],
    alias: {
      preact: path.resolve(__dirname, "../node_modules/preact/dist/preact.js")
    }
  },
  devtool: "source-map", // TODO: Remove source maps from production?
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: require.resolve('tslint-loader'),
        exclude: [
          path.resolve(__dirname, 'node_modules/')
        ],
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        loader: require.resolve('source-map-loader'),
        exclude: [],
        enforce: 'pre'
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: "[name].[ext]"
        }
      },
      {
        test: /\.tsx?$/,
        exclude: [
          path.resolve(__dirname, 'node_modules/')
        ],
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: "./tsconfig.json"
        }
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: require.resolve('style-loader')
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1
            }
          },
          {
            loader: "resolve-url-loader"
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
              sourceMapContents: false
            }
          },
          {
            loader: require.resolve('postcss-loader'),
            options: {
              // Necessary for external CSS imports to work
              // https://github.com/facebookincubator/create-react-app/issues/2677
              ident: 'postcss',
              syntax: 'postcss-scss',
              plugins: function() {
                return [
                  require('postcss-flexbugs-fixes'),
                  autoprefixer({
                    browsers: [
                      '>1%',
                      'last 4 versions',
                      'Firefox ESR',
                      'not ie < 9' // React doesn't support IE8 anyway
                    ],
                    flexbox: 'no-2009'
                  })
                ];
              }
            }
          }
        ]
      },
      {
        exclude: [/\.js$/, /\.html$/, /\.json$/, /\.tsx?$/, /\.s?css$/, /\.png$/],
        loader: require.resolve('file-loader'),
        options: {
          name: "[name].[ext]"
        }
      },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
    ]
  },
  externals: {
    jquery: "jQuery"
  },
  plugins: [
    // Banner required to avoid contamination caused by the YUI compressor.
    new BannerPlugin(
      {
        banner: cow,
        raw: true,
        include: /\.js$/
      }
    ),
    new BannerPlugin(
      {
        banner: license.join('\n'),
        entryOnly: false
      }
    ),
    new webpack.optimize.CommonsChunkPlugin({
      children: true,
      async: true,
      minChunks: 2
    })
  ]
};
