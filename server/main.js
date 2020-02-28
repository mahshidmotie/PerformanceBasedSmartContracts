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

app.use(express.static('client'));
app.use(express.static('build/contracts'));
app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.bodyParser());
var jsonParser = bodyParser.json();
//app.options('*', cors());
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/client/index.html`);
  });







app.get('/token',(req, res)=>{
    res.json(gettoken())
});

app.post('/id', jsonParser, async (req, res)=>{
   var deid= req.body.device_id;
   var buiid= req.body.building_id;
   //console.log(`${deid}`);
   console.log(deid);
   let deid2 = deid;
   //res.send(deid);
   var token = await gettoken();
   console.log(token);
   //var callres = await getObservationsByDatapointId(token, buiid, "B_01'EG'RS_EG_01_01'SENDEV'TR");
   var callres = await getObservationsByDatapointId(token, buiid, deid);
   assert.equal(callres.status, 200);
   body = callres.data;
    assert.equal(body.data.length, 1);

    assert.equal(body.data[0].type, "observation");
    console.log("value:",body.data[0].attributes.value);
    res.send (body.data[0].attributes.value);
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
    return getByFilter(token, buildingId, "observations", "measuredBy.source", id);
  };

  function getBasePath() {
    return process.env.BASE_PATH || BASE_PATH;
  };






