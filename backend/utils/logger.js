const isProd = process.env.NODE_ENV === 'production';

// Logs go to stdout/stderr rather than files on disk — the process manager
// (Docker, PM2) already captures and rotates those, so a second file-based
// logger here would just duplicate that and risk filling the disk.
const info = (...args) => {
  if (isProd) console.log(JSON.stringify({ level: 'info', time: new Date().toISOString(), message: args.map(String).join(' ') }));
  else console.log(...args);
};

const error = (err, context = {}) => {
  if (isProd) {
    console.error(JSON.stringify({
      level: 'error',
      time: new Date().toISOString(),
      message: err?.message || String(err),
      stack: err?.stack,
      ...context,
    }));
  } else {
    console.error(err);
  }
};

module.exports = { info, error };
