require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded());
app.post('/api/shorturl', (req, res, next) => {
  const {url} = req.body;
  dns.lookup(url, (err, address, family) => {    
    if (err) res.status(200).send({error: 'invalid url'});
    next();
  })  
})

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urls = new Array();

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const {url} = req.body;

  const urlExists = urls.filter(u => u.url === url);

  if (urlExists.length > 0){    
    res.json({original_url: url, short_url: urlExists[0].id});
  }
  else{
    const newId = urls.length + 1;
    urls.push({id: newId, url})
    res.json({original_url: url, short_url: newId })
  }
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const {shorturl} = req.params;
  const urlExists = urls.filter(u => u.id == shorturl);

  if (urlExists.length > 0)
    res.redirect(301, urlExists[0].url);
  else
    res.json({error: 'Invalid short url'});
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
