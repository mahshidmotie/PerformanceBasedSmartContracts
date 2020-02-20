require('dotenv').config();
const express = require('express');
const httputil = require("./httputil");
const app = express();
//console.log(process.env.TOKEN_ENDPOINT);
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
const data11 = require('../data/measured11.json');
const data12 = require('../data/measured12.json');
const data13 = require('../data/measured13.json');
const data14 = require('../data/measured14.json');
const data15 = require('../data/measured15.json');
const data16 = require('../data/measured16.json');
const data17 = require('../data/measured17.json');
const data21 = require('../data/measured22.json');
const data22 = require('../data/measured22.json');
const data23 = require('../data/measured23.json');
const data24 = require('../data/measured24.json');
const data25 = require('../data/measured25.json');
const data26 = require('../data/measured26.json');
const data27 = require('../data/measured27.json');
// app.use(cors({
//     'allowedHeaders': ['sessionId', 'Content-Type'],
//     'exposedHeaders': ['sessionId'],
//     'origin': '*',
//     'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     'preflightContinue': false
//   })); // Use this after the variable declaration
app.use(express.static('client'));
app.use(express.static('build/contracts'));
//app.use(express.bodyParser());
var jsonParser = bodyParser.json();
//app.options('*', cors());
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/client/index.html`);
  });

  // app.get('*', (req, res) => {
  //   res.status(404);
  //   res.send('Ooops... this URL does not exist');
  // });

  app.get('/item',(req, res)=>{
    //res.send(`a put request with /item route on port ${PORT}`);
    var randomnumber=Math.random();
    if (randomnumber>0.01){
        res.send(' ' + randomnumber);
    }


});
app.get('/',(req, res)=>{
    //res.send(`a put request with /item route on port ${PORT}`);
    var randomnumber=Math.random();
    if (randomnumber>0.01){
        console.log(' ' + randomnumber);
    }


});
app.get('/data/measured11.json',(req, res)=>
//first get the data from internal api
res.json(data11)
);

app.get('/data/measured12.json',(req, res)=>
//first get the data from internal api
res.json(data12)
);
app.get('/data/measured13.json',(req, res)=>
//first get the data from internal api
res.json(data13)
);
app.get('/data/measured14.json',(req, res)=>
//first get the data from internal api
res.json(data14)
);
app.get('/data/measured15.json',(req, res)=>
//first get the data from internal api
res.json(data15)
);
app.get('/data/measured16.json',(req, res)=>
//first get the data from internal api
res.json(data16)
);
app.get('/data/measured17.json',(req, res)=>
//first get the data from internal api
res.json(data17)
);
app.get('/data/measured21.json',(req, res)=>
//first get the data from internal api
res.json(data21)
);
app.get('/data/measured22.json',(req, res)=>
//first get the data from internal api
res.json(data22)
);
app.get('/data/measured23.json',(req, res)=>
//first get the data from internal api
res.json(data23)
);
app.get('/data/measured24.json',(req, res)=>
//first get the data from internal api
res.json(data24)
);
app.get('/data/measured25.json',(req, res)=>
//first get the data from internal api
res.json(data25)
);
app.get('/data/measured26.json',(req, res)=>
//first get the data from internal api
res.json(data26)
);
app.get('/data/measured27.json',(req, res)=>
//first get the data from internal api
res.json(data27)
);

app.get('/token',(req, res)=>{
    res.json(gettoken())
});

app.post('/id', jsonParser, async (req, res)=>{
   var deid= req.body.device_id;
   console.log(`${deid}`);
   //res.send(deid);
   var token = await gettoken();
   console.log(token);
   var callres = await getObservationsByDatapointId(token, "f3d22a6c-8250-41e4-8e44-39a4ab5cb255", "66b080a1-a963-4c0f-8680-3705c633e88c");
   assert.equal(callres.status, 200);
   body = callres.data;
    assert.equal(body.data.length, 1);

    assert.equal(body.data[0].type, "observation");
    console.log("value:",body.data[0].attributes.value);
});

app.get('/measurement',async (req, res)=>{
    //res.json((await gettoken()).access_token)
    res.json(await gettoken())
});

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`your server is running on port ${PORT}`);
    //console.log(data);
}

);


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
    let filter = `?filter[${filterKey}]=${filterValue}`;
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
    return getByFilter(token, buildingId, "observations", "measuredBy", id);
  };

  function getBasePath() {
    return process.env.BASE_PATH || BASE_PATH;
  };






