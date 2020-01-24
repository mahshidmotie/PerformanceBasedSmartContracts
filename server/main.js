require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const http = require('http');


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
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`your server is running on port ${PORT}`);
    //console.log(data);
}
    
);
