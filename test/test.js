const http = require('http');
const assert = require('assert');
const child = require('child_process');
const path = require('path');

// Используем абсолютный путь к текущему Node
const nodePath = process.execPath;
const serverPath = path.join(__dirname, '..', 'index.js'); // если test/test.js внутри /test/

const server = child.spawn(nodePath, [serverPath], {
  env: { ...process.env, PORT: 4000 },
  stdio: 'inherit' // полезно для отладки — покажет вывод index.js
});

setTimeout(() => {
  http.get('http://127.0.0.1:4000', (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      assert.ok(body.includes('Hello'));
      console.log('✅ TEST OK');
      server.kill();
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('❌ TEST ERR', err);
    server.kill();
    process.exit(1);
  });
}, 300);
