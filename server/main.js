require('dotenv').config();
const fs = require('fs');
const Edata = require('../data/Emeasu.json');
const express = require('express');
const httputil = require("./httputil");
var TruffleContract = require('@truffle/contract');
const app = express();
app.use(express.static('client'));
app.use(express.static('build/contracts'));
const PerformanceCheckABI = require('../build/contracts/PerformanceCheck.json').abi;
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
var csvWriter = require('csv-write-stream');
//const networkURL = 'http://localhost:7545'; 
//const provider = new HDWalletProvider(process.env.ORACLE_ACCOUNTMNEMONIC, networkURL);
const networkURL = process.env.Infura_API_Key; 
const provider = new HDWalletProvider(process.env.ORACLE_RinkebyACCOUNTMNEMONIC, networkURL);
const web3 = new Web3(provider);

// Readig the contract
const PerformanceCheckArtifact = require('../build/contracts/PerformanceCheck.json');
PerformanceCheck = TruffleContract(PerformanceCheckArtifact);
PerformanceCheck.setProvider(provider);
contract = new web3.eth.Contract(PerformanceCheckABI);

const PORT = process.env.PORT || 3000;
var cors = require('cors');
var request = require('request');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const assert = require("assert");
let cachedToken = null;
const BASE_PATH = "https://api.buildingtwin.siemens.com/core/buildings";

const http = require('http');
const https = require('https');

var measus = new Array;

app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.bodyParser());
var jsonParser = bodyParser.json();
//app.options('*', cors());
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/client/index.html`);
  });

//creating a random number
function randcreat() {
    var randomnumber=Math.random();
    console.log(' ' + randomnumber);
    decide(randomnumber);
};



function getMetaskAccountID () {

    
     // Retrieving accounts
     web3.eth.getAccounts(function(err, res) {
         if (err) {
             console.log('Error:',err);
             return;
         }
         console.log('getMetaskID:',res);
         metamaskAccountID = res[0];

     })

 };

//decising whether a sensor of a building should be read
async function decide (randomnumber){
    const PerformanceCheckdep = await PerformanceCheck.deployed();
    // gettting number of monitored buildings from blockchain
    const caseCount = (await PerformanceCheckdep.caseCount()).toString();
    console.log("case count"  + caseCount);
    // defining the number of measuremnets per day
    const MPD = 150;
    // calculating the decision factor 
    const DF = MPD * 90 / (24 * 60 * 60);
        if (randomnumber<=caseCount*DF){
        // selectig the building based on the created random
        const select = Math.floor(randomnumber/DF)+1;
        console.log(select);
        // getting building information of the selected building from blockchain
        const item = await PerformanceCheckdep.cases(select);
        // geeting te array contating sesnor ID s
        let bs = await PerformanceCheckdep.getarray(select);
        const buildingId = item[4];
        console.log("buildingId:",buildingId);
        // creating the second random number for selecting the sensor
        var randomnumber2=(Math.random())*bs.length;
        const select2 = Math.floor(randomnumber2);
        var devid = bs[select2];
        // conversting the formt of the sensor id to string
        var devidstr = web3.utils.hexToUtf8(devid);

        // later we should get list of rooms and then check the sesnors is a room, not finding one snesor and creating other addresess
        var floor = (devidstr.split("'"))[1];
        var room = (devidstr.split("'"))[2];
        var building = (devidstr.split("'"))[0];
        var Tid = building.concat("'",floor.concat("'",room.concat("'","SENDEV'TR")));
        var RHuid = building.concat("'",floor.concat("'",room));
        var AQuid = building.concat("'",floor.concat("'",room.concat("'","AQUALR")));
        console.log("room:",room);
        console.log("device id:",devidstr);
        console.log("Tid:",Tid);
        console.log("RHuid:",RHuid);
        console.log("AQuid:",AQuid);
        var token = await gettoken();
        console.log("token:" , token)

        // var callres = await getObservationsByDatapointId(token, buildingId, devidstr);
        // assert.equal(callres.status, 200);
        // body = callres.data;
        // assert.equal(body.data.length, 1);

        // assert.equal(body.data[0].type, "observation");
        var obsval = 0;
        
        if (room == "RS_1OG_02_01" ||room == "RS_1OG_02_02" || room == "RS_1OG_05_03" )
        {
            obsval = 225;
        }
        else{
            obsval = 210;
        }
        //const obsval = Math.floor((body.data[0].attributes.value)*10);
        console.log("T set point value:", obsval);
        
        // Checking this temperature measurement sensor existst in the list of sensors
        let check = await PerformanceCheckdep.chekTid(select, web3.utils.asciiToHex(Tid) );
        console.log("check:",check);
        if (check){
            var callres2 = await getObservationsByDatapointId(token, buildingId, Tid);
    
            assert.equal(callres2.status, 200);
            body = callres2.data;
            assert.equal(body.data.length, 1);
    
            assert.equal(body.data[0].type, "observation");
            var obsval2 = Math.floor((body.data[0].attributes.value)*10);

        }
        else{
            var obsval2 = 10000;
        }
    
        console.log("Room T value:",obsval2);
        // Checking if this relative humidity measurement sensor existst in the list of sensors
        let check2 = await PerformanceCheckdep.chekRHuid(select, web3.utils.asciiToHex(RHuid) );
        console.log("check2:",check2);
        if (check2){
            RHuid = RHuid.concat("'","SENDEV'HURELR");
            console.log("RHuid:",RHuid);
            var callres3 = await getObservationsByDatapointId(token, buildingId, RHuid);
    
            assert.equal(callres3.status, 200);
            body = callres3.data;
            assert.equal(body.data.length, 1);
     
            assert.equal(body.data[0].type, "observation");
            var obsval3 = Math.floor((body.data[0].attributes.value)*10);
        }
        else{
            obsval3 = 10000;
        }
    
        console.log("Relative Humidity value:",obsval3);

        // Checking if this co2 measurement sensor existst in the list of sensors
        let check3 = await PerformanceCheckdep.chekAQuid(select, web3.utils.asciiToHex(AQuid) );
        console.log("check3:",check3);
        if (check3){
            var callres4 = await getObservationsByDatapointId(token, buildingId, AQuid);
   
            assert.equal(callres4.status, 200);
            body = callres4.data;
            assert.equal(body.data.length, 1);
    
            assert.equal(body.data[0].type, "observation");
            var obsval4 = Math.floor((body.data[0].attributes.value));
        }
        else{
            obsval4 = 10000;
        }
        console.log("Air quality value:",obsval4);

       
        measus[0]= obsval;
        measus[1]=obsval2;
        measus[2]=obsval3;
        measus[3]=obsval4;

        //const contractowner = await PerformanceCheckdep.contractOwner();
        console.log("devids:", devid);
        console.log("measurements:", measus);
        getMetaskAccountID();


        PerformanceCheck.deployed().then(function(instance) {
            return instance.addValue(
                devid,
                measus,
                buildingId,
                {from:metamaskAccountID}
            );
        }).then(function(result) {
            // $("#ftc-item").text(result[tx]);
            console.log('Temperature added',result);

            var FMFCount = 0;
            var COFCount = 0;
            var AllfineCount = 0;
    
            if ( obsval>220)
            {
              if(obsval2>=200)
              {
                FMFCount = 1;
              }
              else if(obsval2<200 && !(obsval2==0))
              {
                COFCount = 1;
              }
              else{
                AllfineCount = 1;
              }
              
            }
            else if ( obsval<200 && !(obsval=00))
            {
              if(((obsval2>=180 && obsval2<=250) || obsval2 == 10000 || obsval2 == 0 ) && ((obsval3>=200 && obsval3<=600) || obsval3==10000 || obsval3==0 ) && (obsval4 <= 1000 || obsval4 == 10000 || obsval4 == 0))
              {
                AllfineCount = 1;
              }
              else if(obsval2<180 )
              {
                FMFCount = 1;
              }
              else
              {
                COFCount = 1;
              }
            }
            else if ( obsval<=220 && obsval>=200)
            {
              if(((obsval2>=180 && obsval2<=250) || obsval2 == 10000 || obsval2 == 0 ) && ((obsval3>=200 && obsval3<=600) || obsval3==10000 || obsval3==0 ) && (obsval4 <= 1000 || obsval4 == 10000 || obsval4 == 0))
              {
                AllfineCount = 1;
              }
              else
              {
                COFCount = 1;
              }
            }
            else{
              AllfineCount = 1;
            }
    
            let date_ob = new Date();
    
            // current date
            // adjust 0 before single digit date
            let date = (("0" + date_ob.getDate()).slice(-2)).toString();
    
            // current month
            let month = (("0" + (date_ob.getMonth() + 1)).slice(-2)).toString();
    
            // current year
            let year = (date_ob.getFullYear()).toString();
    
            // current hours
            let hours = (("0" + date_ob.getUTCHours()).slice(-2)).toString() ;
    
            // current minutes
            let minutes =(("0" + date_ob.getUTCMinutes()).slice(-2)).toString() ;
    
            // current seconds
            let seconds =(("0" + date_ob.getUTCSeconds()).slice(-2)).toString() ;
    
    
            // prints date & time in YYYY-MM-DD HH:MM:SS format
            //console.log(year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds+".000Z");
            var time = year.concat("-",month.concat("-",date.concat("T",hours.concat(":",minutes.concat(":",seconds.concat(".","000Z"))))));
            console.log(time);
    
            var writer = csvWriter({sendHeaders: false}); //Instantiate var
            var csvFilename = "comfort.csv";
    
            // If CSV file does not exist, create it and add the headers
            if (!fs.existsSync(csvFilename)) {
            writer = csvWriter({sendHeaders: false});
            writer.pipe(fs.createWriteStream(csvFilename));
            writer.write({
                header1: 'SPT',
                header2: 'RT',
                header3: 'RHU',
                header4: 'AQU',
                header5: 'Time',
                header6: 'Room',
                header7: 'FMF',
                header8: 'COF',
                header9: 'Allfine'
    
            });
            writer.end();
            } 
    
            // Append some data to CSV the file    
            writer = csvWriter({sendHeaders: false});
            writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
            writer.write({
            header1: obsval,
            header2: obsval2,
            header3: obsval3,
            header4: obsval4,
            header5: time,
            header6: room,
            header7: FMFCount,
            header8: COFCount,
            header9: AllfineCount
            });
            writer.end();

        }).catch(function(err) {
            console.log(err.message);
        });


    }
    if (randomnumber<=caseCount*0.20572917/35){
        //const contractowner = await PerformanceCheckdep.contractOwner();
        getMetaskAccountID();
        const select = (Math.floor(randomnumber*35/0.20572917))+1;
        console.log(select);
        const item = await PerformanceCheckdep.cases(select);
        //let bs = await PerformanceCheckdep.getarray(select);
        const buildingId = item[4];
        console.log("buildingId:",buildingId);
        let date_ob = new Date();

        // current date
        // adjust 0 before single digit date
        let date = (("0" + date_ob.getDate()).slice(-2)).toString();

        // current month
        let month = (("0" + (date_ob.getMonth() + 1)).slice(-2)).toString();

        // current year
        let year = (date_ob.getFullYear()).toString();

        // current hours
        let hours = (("0" + date_ob.getUTCHours()).slice(-2)).toString() ;

        // current minutes
        let minutes =(("0" + date_ob.getUTCMinutes()).slice(-2)).toString() ;

        // current seconds
        let seconds =(("0" + date_ob.getUTCSeconds()).slice(-2)).toString() ;


        // prints date & time in YYYY-MM-DD HH:MM:SS format
        console.log(year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds+".000Z");
        var time = year.concat("-",month.concat("-",date.concat("T",hours.concat(":",minutes.concat(":",seconds.concat(".","000Z"))))));
        console.log(time);

        //$.getJSON(`./data/Emeasu.json`, function(json) {
            // var jsf = Edata;
            // var random3 = Math.floor((Math.random())*10);
            // console.log(jsf); 
            // var jsf2 = Math.floor(parseFloat (jsf["data"][random3]["attributes"]["value"]));
            var jsf2 = (Math.floor((Math.random())*20))+35;
            console.log("Measured electricity:" , jsf2);
            PerformanceCheck.deployed().then(function(instance) {
                return instance.addEValue(
                    jsf2,
                    buildingId,
                    {from:metamaskAccountID}
                );
            }).then(function(result) {
                // $("#ftc-item").text(result[tx]);
                console.log('electricity added:',result);

                
            var writer = csvWriter({sendHeaders: false}); //Instantiate var
            var csvFilename = "consumedenergy.csv";
    
            // If CSV file does not exist, create it and add the headers
            if (!fs.existsSync(csvFilename)) {
            writer = csvWriter({sendHeaders: false});
            writer.pipe(fs.createWriteStream(csvFilename));
            writer.write({
                header1: 'electricity',
                header2: 'time',
            });
            writer.end();
            } 
    
            // Append some data to CSV the file    
            writer = csvWriter({sendHeaders: false});
            writer.pipe(fs.createWriteStream(csvFilename, {flags: 'a'}));
            writer.write({
            header1: jsf2,
            header2: time

            });
            writer.end();

            }).catch(function(err) {
                console.log(err.message);
            });

    

        //});
    }



}

// async function readmeasurmenet(){
//     const PerformanceCheckdep = await PerformanceCheck.deployed();
//     const num = (await PerformanceCheckdep.measurmentCount()).toString();
//     console.log("case count"  + num);
//     //const num = await PerformanceCheckdep.measurmentCount();
//     for (var a=1; a<num+1; a++){
//         var valuesSt = await PerformanceCheckdep.values(a);
//         //let bs = await PerformanceCheckdep.getarray2(a);
//         var deviceid1 = valuesSt[1];
//         var deviceid = web3.utils.hexToUtf8(deviceid1);
//         var values = (valuesSt[3]).toString();
//         console.log(deviceid);
//         console.log(values);
//         //console.log(values);
//     }
// }

app.get('/random', jsonParser, (req, res)=>{

    
    setInterval(() => {
       randcreat();
     }, 18000);
    //readmeasurmenet();
    
    
});

// ******this function was for the time that we had random in the front end, its useless now
// app.post('/id', jsonParser, async (req, res)=>{
//    var deid= req.body.device_id;
//    var buiid= req.body.building_id;
//    //console.log(`${deid}`);
//    console.log(deid);
//    let deid2 = deid;
//    //res.send(deid);
//    var token = await gettoken();
//    console.log(token);
//    //var callres = await getObservationsByDatapointId(token, buiid, "B_01'EG'RS_EG_01_01'SENDEV'TR");
//    var callres = await getObservationsByDatapointId(token, buiid, deid);
//    assert.equal(callres.status, 200);
//    body = callres.data;
//     assert.equal(body.data.length, 1);

//     assert.equal(body.data[0].type, "observation");
//     console.log("value:",body.data[0].attributes.value);
//     res.send (body.data[0].attributes.value);
// }); **********************


const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`your server is running on port ${PORT}`);
    //console.log(data);
});


function httpRequest(method, url, body = null) {
    if (!['get', 'post', 'head'].includes(method)) {
        throw new Error(`Invalid method: ${method}`);
    }

    let urlObject;

    try {
        urlObject = new URL(url);
    } catch (error) {
        throw new Error(`Invalid url ${url}`);
    }

    if (body && method !== 'post') {
        throw new Error(`Invalid use of the body parameter while using the ${method.toUpperCase()} method.`);
    }

    let options = {
        method: method.toUpperCase(),
        hostname: urlObject.hostname,
        port: urlObject.port,
        path: urlObject.pathname,
        headers : {"Content-Type": "application/json"}
    };

    if (body) {
        options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    return new Promise((resolve, reject) => {

        const clientRequest = https.request(options, incomingMessage => {

            // Response object.
            let response = {
                statusCode: incomingMessage.statusCode,
                headers: incomingMessage.headers,
                body: []
            };

            // Collect response body data.
            incomingMessage.on('data', chunk => {
                response.body.push(chunk);
            });

            // Resolve on end.
            incomingMessage.on('end', () => {
                if (response.body.length) {

                    response.body = response.body.join();

                    try {
                        response.body = JSON.parse(response.body);
                    } catch (error) {
                        // Silently fail if response is not JSON.
                    }
                }

                resolve(response);
            });
        });

        // Reject on request error.
        clientRequest.on('error', error => {
            reject(error);
        });

        // Write request body if present.
        if (body) {
            clientRequest.write(body);
        }

        // Close HTTP connection.
        clientRequest.end();
    });
};


async function gettoken() {

    let now = Date.now()/1000;

    if(cachedToken){
        console.log("oomad too cash");
      var decoded = jwt.decode(cachedToken);

      if(decoded.exp > (now+30)){
        console.log("same token");
        return cachedToken
      }else{
        console.log("renew token");
      }
    }

    //console.log(process.env.TOKEN_ENDPOINT);
    let payload = {
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET,
        "audience": process.env.TOKEN_AUDIENCE,
        "grant_type": "client_credentials"
    };


    cachedToken = (await httpRequest("post", process.env.TOKEN_ENDPOINT, JSON.stringify(payload))).body.access_token;
    //cachedToken = res.body.access_token;
    return cachedToken
};
async function getdata() {
    let payload = {
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET,
        "audience": process.env.TOKEN_AUDIENCE,
        "grant_type": "client_credentials"
    };


    cachedToken = (await httpRequest("post", process.env.TOKEN_ENDPOINT, JSON.stringify(payload))).body.access_token;
    //cachedToken = res.body.access_token;
    return cachedToken
};

function getRequest(token, method, path, data) {
    return {
      schema: "https",
      host: process.env.API_DOMAIN,
      path: path,
      method: method,
      data: data,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };
  };
  const REQUEST_TIMEOUT = 20000;
  async function getByFilter(token, buildingId, resource, filterKey, filterValue) {
    let date_ob1 = new Date();
    let date_ob = new Date(date_ob1 - 4147200000);
    let date_ob2 = new Date(date_ob - 900000);

    // current date
    // adjust 0 before single digit date
    let date = (("0" + date_ob.getDate()).slice(-2)).toString();

    // current month
    let month = (("0" + (date_ob.getMonth() + 1)).slice(-2)).toString();

    // current year
    let year = (date_ob.getFullYear()).toString();

    // current hours
    let hours = (("0" + date_ob.getUTCHours()).slice(-2)).toString() ;

    // current minutes
    let minutes =(("0" + date_ob.getUTCMinutes()).slice(-2)).toString() ;

    // current seconds
    let seconds =(("0" + date_ob.getUTCSeconds()).slice(-2)).toString() ;
    let date2 = (("0" + date_ob2.getDate()).slice(-2)).toString();

    // current month
    let month2 = (("0" + (date_ob2.getMonth() + 1)).slice(-2)).toString();

    // current year
    let year2 = (date_ob2.getFullYear()).toString();

    // current hours
    let hours2 = (("0" + date_ob2.getUTCHours()).slice(-2)).toString() ;

    // current minutes
    let minutes2 =(("0" + date_ob2.getUTCMinutes()).slice(-2)).toString() ;

    // current seconds
    let seconds2 =(("0" + date_ob2.getUTCSeconds()).slice(-2)).toString() ;


    // prints date & time in YYYY-MM-DD HH:MM:SS format
    console.log(date_ob1);
    var time = year.concat("-",month.concat("-",date.concat("T",hours.concat(":",minutes.concat(":",seconds.concat(".","000Z"))))));
    var time2 = year2.concat("-",month2.concat("-",date2.concat("T",hours2.concat(":",minutes2.concat(":",seconds2.concat(".","000Z"))))));
    console.log(time);
    console.log(time2);
    let filter = `?filter[${filterKey}]=${filterValue}&filter[timestamp][lt]=${time}&filter[timestamp][gt]=${time2}`;
    let path = `${getBasePath()}/${buildingId}/${resource}${filter}`;
    let req = getGetRequest(token, path);
    let res = await httputil.smartRequest(req, REQUEST_TIMEOUT);
    //let res = await httpRequest("get", path, JSON.stringify(req));
    return res;
  };

  function getGetRequest(token, path) {
    return getRequest(token, "GET", path, null);
  };

  async function getObservationsByDatapointId(token, buildingId, id) {
    return getByFilter(token, buildingId, "observations", "measuredBy.source", id);
  };

  function getBasePath() {
    return process.env.BASE_PATH || BASE_PATH;
  };






