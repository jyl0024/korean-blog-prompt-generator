module.exports = {
  apps: [
    {
      name: "webapp",
      script: "npm",
      args: "run dev",
      cwd: "/home/user/webapp",
      env: {
        NODE_ENV: "development",
        PORT: "3000",
        HOSTNAME: "0.0.0.0",
      },
      watch: false,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "1G",
    },
  ],
};
