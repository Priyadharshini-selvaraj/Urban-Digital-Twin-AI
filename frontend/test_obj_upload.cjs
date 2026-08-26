const http = require('http');
const fs = require('fs');

const filePath = 'c:/Users/acer/Downloads/Twin ai/sample_models/j2_highway_corridor.obj';
const boundary = '----FormBoundary' + Date.now();
const file = fs.readFileSync(filePath);

const header = Buffer.from(
  '--' + boundary + '\r\n' +
  'Content-Disposition: form-data; name="file"; filename="j2_highway_corridor.obj"\r\n' +
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
    console.log('=== j2_highway_corridor.obj Backend Parse Test ===');
    console.log('Status:', j.status);
    console.log('Total Nodes:', Object.keys(j.graph?.nodes || {}).length, '(expected: 8)');
    console.log('Total Edges:', j.graph?.meta?.totalRoadSegments, '(expected: 9)');
    console.log('Node IDs:', Object.keys(j.graph?.nodes || {}).join(', '));
    console.log('');
    console.log('Node Positions:');
    Object.values(j.graph?.nodes || {}).forEach(n => {
      console.log(` ${n.id}: x=${n.x}, y=${n.y}, z=${n.z}`);
    });
    console.log('');
    console.log('Adjacency (edges):');
    Object.entries(j.graph?.adjacencyList || {}).forEach(([id, edges]) => {
      if (edges.length > 0) {
        console.log(` ${id} -> ${edges.map(e => e.to + '(' + e.distance + 'km)').join(', ')}`);
      }
    });
  });
});

req.on('error', err => console.error('Request failed:', err.message));
req.write(body);
req.end();
