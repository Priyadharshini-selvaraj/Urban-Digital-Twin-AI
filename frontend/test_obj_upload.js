const http = require('http');
const fs = require('fs');

const filePath = 'c:/Users/acer/Downloads/Twin ai/sample_models/j1.obj';
const boundary = '----FormBoundary' + Date.now();
const file = fs.readFileSync(filePath);

const header = Buffer.from(
  '--' + boundary + '\r\n' +
  'Content-Disposition: form-data; name="file"; filename="j1.obj"\r\n' +
  'Content-Type: text/plain\r\n\r\n'
);
const footer = Buffer.from('\r\n--' + boundary + '--\r\n');
const body = Buffer.concat([header, file, footer]);

const req = http.request({
  hostname: 'localhost',
  port: 8081,
  path: '/api/v1/models/upload-skp',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': body.length
  }
});

req.on('response', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const j = JSON.parse(d);
    console.log('=== j1.obj Backend Parse Test ===');
    console.log('Status:', j.status);
    console.log('Total Nodes:', Object.keys(j.graph?.nodes || {}).length);
    console.log('Total Edges:', j.graph?.meta?.totalRoadSegments);
    console.log('Node IDs:', Object.keys(j.graph?.nodes || {}).join(', '));
    console.log('Sample Node J1:', JSON.stringify(j.graph?.nodes?.J1));
    console.log('Adj J1 connections:', (j.graph?.adjacencyList?.J1 || []).map(e => e.to).join(', '));
  });
});

req.on('error', err => console.error('Request failed:', err.message));
req.write(body);
req.end();
