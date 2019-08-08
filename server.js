'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');


const app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const Schema = mongoose.Schema;

const urlSchema = new Schema(
  {
    originalUrl: String,
    shorterUrl: String
  },
  { timestamps: true }
);

const ShortUrl = mongoose.model('shortUrl', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(bodyParser.json());


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/new', (req, res) => {
  const urlToShorten = req.body.url;
  
  dns.lookup(urlToShorten, (err, addresses, family) => {
    if (err) {
      console.log(err.message);
      return res.json({ error: 'invalid URL' });
    } else {
      ShortUrl.findOne({ originalUrl: urlToShorten }, (err, data) => {
        if (err) return res.send(err);
        if (data) {
          return res.json(data);
        } else {
          var short = Math.floor(Math.random() * 100000).toString();
          var data = new ShortUrl({
          originalUrl: urlToShorten,
          shorterUrl: short
          });
        
          data.save(err => {
            if (err) {
              return res.send('Error saving to database');
            }
          });
          return res.json(data);
        }   
      }); 
    }
  });
});

app.get('/api/shorturl/:urlToForward', (req, res) => {
  console.log('here');
  var shorterUrl = req.params.urlToForward;
  ShortUrl.findOne({ shorterUrl }, (err, data) => {
    if (err) {
      return res.send('Error reading database');
    }
    var re = new RegExp('^(http|https)://', 'i');
    var strToCheck = data.originalUrl;
    console.log(strToCheck);
    if (re.test(strToCheck)) {
      res.redirect(data.originalUrl);
    }
    res.redirect('https://' + data.originalUrl);
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

/*

const shortUrl = require('./models/shortUrl');

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));


app.listen(process.env.PORT || 3000, () => {
  console.log('Everything is working fine');
});

*/