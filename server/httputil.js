require('dotenv').config();

let http = require("http");
let https = require("https");
let ProxyAgent = require('proxy-agent')

let axiosbase = require("axios");
let AxiosLogger =require("axios-logger");
let axios = null;

function initAxios() {

  axios = axiosbase.create({
    timeout: 5000,
    maxRedirects: 10,
    maxContentLength: 50 * 1000 * 1000
  });


  axios.defaults.proxy = false;

  axios.interceptors.request.use(AxiosLogger.requestLogger, AxiosLogger.errorLogger);

  axios.interceptors.response.use(function (response) {

    if(response.config.url.indexOf("token")==-1){
      return AxiosLogger.responseLogger(response)
    }else{
      console.log("REDACTED token log",)
      return response
    }
  }, AxiosLogger.errorLogger);

}

async function smartRequest(req, timeout) {

  let headers = req.headers;

  if(!headers){
    headers = {}
  }

  let axiosRequest = {
    url: (typeof req.url !== 'undefined' && req.url) ? req.url : (req.schema + "://" + req.host + req.path),
    method: req.method,
    headers: headers,
    data: req.data
  }

  //console.log(axiosRequest);
  //if (process.env.LOG_REQUESTS) {
    console.log(`${axiosRequest.method} ${axiosRequest.url}`);
  //}

  if (timeout) {
    axios.defaults.timeout = timeout;
  }

  if(process.env.FORCE_PROXY){
    //console.log("DEV MODE DETECTED");
    const httpsProxyAgent = new ProxyAgent(process.env.HTTPS_PROXY);
    const httpProxyAgent = new ProxyAgent(process.env.HTTP_PROXY);
    axiosRequest.httpsAgent = httpsProxyAgent;
    axiosRequest.httpAgent = httpProxyAgent;
  }

  let res = await axios(axiosRequest);
  if (process.env.LOG_RESPONSES) {
    console.log(`request response:\r\nstatus:${(res.status)},\r\ndata:${JSON.stringify(res.data, null, 2)}`);
  }

  return res;

}

//INIT
initAxios();

module.exports = {
  smartRequest: smartRequest
}
