const path = require('path');
const fs = require('fs');
const express = require('express');

const CLIENT_BUILD = path.resolve(__dirname, '../client/build');

function shouldServeClient() {
  if (process.env.SERVE_CLIENT === 'false') return false;
  if (process.env.SERVE_CLIENT === 'true') return fs.existsSync(CLIENT_BUILD);
  return fs.existsSync(path.join(CLIENT_BUILD, 'index.html'));
}

function setupStaticClient(app) {
  if (!shouldServeClient()) return false;

  app.use(express.static(CLIENT_BUILD, { index: false }));

  app.get('*', (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (
      req.path.startsWith('/auth') ||
      req.path.startsWith('/transaction') ||
      req.path.startsWith('/goals') ||
      req.path.startsWith('/income') ||
      req.path.startsWith('/recurring') ||
      req.path.startsWith('/overview') ||
      req.path.startsWith('/profile') ||
      req.path.startsWith('/ai')
    ) {
      return next();
    }
    res.sendFile(path.join(CLIENT_BUILD, 'index.html'));
  });

  return true;
}

module.exports = { setupStaticClient, CLIENT_BUILD };
