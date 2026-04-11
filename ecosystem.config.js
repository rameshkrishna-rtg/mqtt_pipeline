module.exports = {
  apps: [{
    name: 'mqtt-pipeline',
    script: 'index.js',
    watch: false,
    autorestart: true,
    restart_delay: 3000,
    max_restarts: 10,
    env_file: '.env'
  }]
};