module.exports = {
  apps: [{
    name: 'coursespeak',
    script: '.next/standalone/server.js',
    cwd: '/var/www/coursespeak',
    env: { NODE_ENV: 'production' }
  }]
};
