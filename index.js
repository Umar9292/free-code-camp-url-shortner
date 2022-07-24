require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlParser = require('url');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const urlSchema = new Schema({ url: String });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Url = mongoose.model("url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async function(req, res) {
  const { url } = req.body;

  dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
    if (err) {
      return res.json({ error: 'Invalid URL' });
    }

    if (!address) {
      return res.json({ error: 'Invalid URL' });
    }

   const { url: newUrl, _id } = await new Url(req.body).save();

   return res.json({
    original_url: newUrl,
    short_url: _id
   });
  });
});

app.get('/api/shorturl/:id', async function(req, res) {
  const id = req.params.id;

 const data = await Url.findById(id);
 if (!data) {
  return res.json({ error: 'Invalid URL' });
 }

 return res.redirect(data.url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
