require('dotenv').config();

module.exports = {
    mqtt: {
        broker: process.env.MQTT_BROKER,
        topic: process.env.MQTT_TOPIC,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
    },
    rabbit: {
        url: process.env.RABBITMQ_URL,
       queue: process.env.RABBIT_QUEUE,
    },
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
    },
}