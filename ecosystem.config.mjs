module.exports = {
  apps: [{
    name: 'asleepace.com',
    script: './dist/server/entry.mjs',
    interpreter: '/root/.bun/bin/bun',
    cwd: '/root/asleepace.com',
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 4321
    }
  }]
}