const ampq = require("amqplib")
const config = require("./config")

const { cacheLatest } = require("./redisClient")
const { insertReading } = require("./dbClient")

const startConsumer = async () => {
    const conn = await ampq.connect(config.rabbit.url);
    const channel = await conn.createChannel();

    await channel.assertQueue(config.rabbit.queue, { durable: true });
    channel.prefetch(10);

    console.log(`✅[RabbitMQ] Consumer ready, waiting for message...`)

    channel.consume(config.rabbit.queue, async (msg) => {
        if (!msg) return;

        try {
            const { topic, payload, receivedAt } = JSON.parse(msg.content.toString());

            //Cache latest in Redis
            await cacheLatest(topic, { payload, receivedAt });

            //persist to Postgres
            await insertReading(topic, payload, receivedAt);

            channel.ack(msg); //ack only after both succeed
        } catch (err) {
            console.error(`❌[Consumer] Failed to process message: ${err.mesage}`)
            channel.nack(msg, false, true) //requeue on failure
        }
    });
}

module.exports = {
    startConsumer
}