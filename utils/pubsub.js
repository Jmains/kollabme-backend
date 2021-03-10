const { RedisPubSub } = require("graphql-redis-subscriptions");
const Redis = require("ioredis");
const options = {
  host: "intreecateredis-001.intreecateredis.tjxfhy.usw1.cache.amazonaws.com",
  // host: "master.intreecateredis.tjxfhy.usw1.cache.amazonaws.com",
  // port: 6379,
  family: 4, // 4 (IPv4) or 6 (IPv6)
  retryStrategy: (times) => {
    // reconnect after
    return Math.min(times * 50, 2000);
  },

  connect_timeout: 15000,
  retry_unfulfilled_commands: true,
};

// const pubsub = new RedisPubSub();

// module.exports = pubsub;

// module.exports = new RedisPubSub({
//   connection: options,
// });
