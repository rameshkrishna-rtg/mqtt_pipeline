require('dotenv').config();

module.exports = {
    mqtt:{
        broker: process.env.MQTT_BROKER,
        topic: process.env.MQTT_TOPIC
    },
    rabbit: {
        url: process.env.RABBIT_URL,
        queue: process.env.MQTT_TOPIC,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
    },
}