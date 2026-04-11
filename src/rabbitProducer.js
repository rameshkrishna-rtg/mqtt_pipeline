const ampq = require("amqplib");
const config = require("./config")

let channel;

const connectRabbit = async () => {
    const conn = await ampq.connect(config.rabbit.url);
    channel = await conn.createChannel();
    await channel.assertQueue(config.rabbit.queue, { durable: true });

    console.log('✅[RabbitMQ] Producer connected')
}

const publishToQueue = async (data) => {
    if (!channel) await connectRabbit();
    channel.sendToQueue(
        config.rabbit.queue,
        Buffer.from(JSON.stringify(data)), { persistent: true }
    );
    console.log(`✅[RabbitMQ] published:`, data.topic);
}

module.exports = {
    connectRabbit,
    publishToQueue
}