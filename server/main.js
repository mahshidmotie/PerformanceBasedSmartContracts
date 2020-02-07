require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http');
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

app.use(express.static('client'));
app.use(express.static('build/contracts'));
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


const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`your server is running on port ${PORT}`);
    //console.log(data);
}

);
