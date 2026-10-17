const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

test('startup exits with an error when the HTTP port is occupied', () => {
  const result = spawnSync(process.execPath, ['-e', `
    const net = require('node:net');
    const http = require('node:http');
    const blocker = net.createServer();
    blocker.listen(0, '127.0.0.1', () => {
      const listen = http.Server.prototype.listen;
      http.Server.prototype.listen = function (port, callback) {
        return listen.call(this, blocker.address().port, '127.0.0.1', callback);
      };
      // Replace only the DB handshake; Express and the socket error remain real.
      const db = require.resolve('mysql2/promise');
      require.cache[db] = { exports: { createPool: () => ({ query: async () => [] }) } };
      require('./app.js');
    });
  `], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
    timeout: 3000,
  });

  assert.notEqual(result.status, null, 'startup must exit instead of hanging');
  assert.notEqual(result.status, 0, 'startup must report failure');
  assert.match(result.stderr, /EADDRINUSE/);
});
