const config = require('./ecosystem.config.js');

module.exports = {
  apps: [
    {
      ...config.apps[0],
      name: 'auto-task-dev',
      script: 'npm run start',
      watch: ['src'],
      exec_mode: 'fork',
      instances: 1,
    },
  ],
};
