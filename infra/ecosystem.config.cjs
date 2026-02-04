module.exports = {
  apps: [
    {
      name: "life-rpg-api",
      script: "/opt/life-rpg/apps/api/dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      max_memory_restart: "512M",
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
