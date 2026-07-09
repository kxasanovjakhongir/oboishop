// PM2 config for bare-metal (non-Docker) deployment.
// Usage: pm2 start ecosystem.config.js --env production
module.exports = {
  apps: [
    {
      name: 'oboy-backend',
      script: 'server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // PM2's own log rotation (pm2 install pm2-logrotate) handles these —
      // paths just need to exist and be writable by the deploy user.
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true,
      max_memory_restart: '400M',
      autorestart: true,
      watch: false,
    },
  ],
};
