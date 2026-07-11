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
      // Caps V8's old-space heap so a runaway process dies with a clear
      // "JavaScript heap out of memory" stack trace in the PM2 logs, well
      // before it grows large enough for the kernel OOM-killer to step in
      // with no diagnostic at all. Sized for a ~1GB RAM VPS also running
      // MongoDB and Nginx — raise it (e.g. 512) on a bigger box.
      node_args: '--max-old-space-size=256',
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
      // A coarser safety net alongside node_args above — this catches
      // total RSS growth (native buffers, uploaded-file streaming, etc.)
      // that the V8 heap limit alone wouldn't.
      max_memory_restart: '400M',
      autorestart: true,
      watch: false,
    },
  ],
};
