import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

let oracleAdresses = [];

const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;
const statusCodes = [STATUS_CODE_UNKNOWN,STATUS_CODE_ON_TIME,STATUS_CODE_LATE_AIRLINE,STATUS_CODE_LATE_WEATHER,STATUS_CODE_LATE_TECHNICAL,STATUS_CODE_LATE_OTHER];

// Authorize app contract in data contract when starting the server
function authorizeContract(caller) {
  return new Promise((resolve, reject) => {
      flightSuretyData.methods.authorizeContract(config.appAddress).send({
          from: caller
      }).then(result => {
          console.log(result ? `Contract: ${config.appAddress} is authorized` : `Caller: ${config.appAddress} is not authorized`);
          return (result ? resolve : reject)(result);
      }).catch(err => {
          reject(err);
      });
  })
}

// Init contracts
function initContracts() {
  return new Promise((resolve, reject) => {
      web3.eth.getAccounts().then(accounts => {
          web3.eth.defaultAccount = accounts[0];
          authorizeContract(accounts[0])
      }).catch(err => {
          reject(err);
      });
  });
}

initContracts();

// Register 30 Oracles
const registerOracles = () => new Promise((resolve, reject) => {
  web3.eth.getAccounts().then(function(result) {
    oracleAdresses = result;
    for(var a = 20; a < 50; a++){
      flightSuretyApp.methods.registerOracle()
      .send({
        from: oracleAdresses[a],
        value: web3.utils.toWei('1', 'ether'),
        gas: 45000000
      }, (error, result) => {
        if (error) {
          console.error('Error2')
          reject(error)
        } else {
          console.log(`Oracle Registered: ${result}`);
          resolve(result)
        }
      })
    }
  })
})

registerOracles();

// Respond to event
const submitOracleResponse = (event) => new Promise((resolve, reject) => {
  let validOracles = [];
  let count = 20; //starts at 20 because 30 is the first oracle
  let oracleResponseSubmitted = false;
  // loop through all registered oracles (address 20-50)
  for (var a = 20; a < 50; a++) {
    flightSuretyApp.methods
    .getMyIndexes()
    .call({
      from: oracleAdresses[a],
      gas: 45000000
    }, (error, result) => {
      if (error) {
        console.error('Error3')
        reject(error)
      } else {
        console.log(result, count);
        // three oracle responses required
        if (validOracles.length < 3) {
          // loop through all three indexes and see if one matches
          for (var i = 0; i < 3; i++) {
            if (result[i] === event.returnValues.index) {
              validOracles.push(count);
              console.log("validOracles: ", validOracles);
              break;
            }
          }
        }
        count++;
        resolve(result)
      }
    }).then(function() {
      if (validOracles.length === 3 && !oracleResponseSubmitted) {
        oracleResponseSubmitted = true;
        // let statusCode = statusCodes[Math.floor(Math.random()*statusCodes.length)]
        // instead set statusCode to late, so we always get an insurance case
        const statusCode = STATUS_CODE_LATE_AIRLINE;
        // submit response from all three oracles
        for (var k = 0; k < 3; k++) {
          flightSuretyApp.methods
          .submitOracleResponse(event.returnValues.index, event.returnValues.airline, event.returnValues.flight, event.returnValues.timestamp, statusCode)
          .send({
            from: oracleAdresses[validOracles[k]],
            gas: 45000000
          }, (error, result) => {
            if (error) {
              console.error('Error4')
              reject(error)
            } else {
              // console.log(result);
              resolve(result)
            }
          })
        }
      }
    })
  }
})

// Listen to oracle related events
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (error) console.log(error)
    console.log("Event OracleRequest:", event)
    submitOracleResponse(event);
});

flightSuretyApp.events.OracleReport({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log("Event OracleReport:", event)
});

flightSuretyApp.events.FlightStatusInfo({
  fromBlock: 0
}, function (error, event) {
  if (error) console.log(error)
  console.log("Event FlightStatusInfo:", event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;
