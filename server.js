const express = require('express');
const fs = require('fs');

const app = express();

const mime = {
  'html': 'text/html',
  'js': 'text/javascript',
  'mjs': 'text/javascript',
};

app.get('*', (req, res) => {
  try {
    const pathParams = req.url.split('.');
    const ext = pathParams.slice(-1) ?? 'js';
    const path = pathParams.slice(0, -1) + '.' + ext;
    const source = fs.readFileSync(__dirname + path);
    const type = mime[ext];
    res.setHeader('Content-type', type);
    res.send(source);
  } catch (e) {
    console.error(e);
    res.end();
  }
});

app.listen('4000', () => {
  console.log('Run on 4000!')
})
