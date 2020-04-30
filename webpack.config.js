require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
 
module.exports = {
  entry: './client/app.js',
  mode: process.env.MODE,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'client/dist')
  },
  plugins: [
    new webpack.DefinePlugin({
        'process.env': {
            'LOCAL_NODE': JSON.stringify(process.env.LOCAL_NODE),
            'MODE':JSON.stringify(process.env.MODE),
            'Infura_API_Key':JSON.stringify(process.env.Infura_API_Key),
            'ORACLE_RinkebyACCOUNTMNEMONIC':JSON.stringify(process.env.ORACLE_RinkebyACCOUNTMNEMONIC),

        }
    })
  ],
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
    fs: 'empty'
  },
  externals:[{
    xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'
}]
};