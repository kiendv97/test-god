const NODE_OPTIONS = '--max-old-space-size=8192';

module.exports = {
  apps: [
    {
      name: 'auto-task',
      script: './dist/main.js',
      error_file: './.pm2/err.log',
      out_file: './.pm2/out.log',
      max_restarts: 5,
      autorestart: true,
      restart_delay: 5000,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'docker-data'],
      exec_mode: 'cluster',
      instances: 2,
      max_memory_restart: '800M',
      env: {
        DEBUG: 'backend:*',
        NODE_OPTIONS,
      },
      env_test: {
        NODE_ENV: 'test',
        DEBUG: 'backend:*',
        NODE_OPTIONS,
      },
      env_prod: {
        NODE_ENV: 'prod',
        DEBUG: 'false',
        NODE_OPTIONS,
      },
    },
  ],
};
