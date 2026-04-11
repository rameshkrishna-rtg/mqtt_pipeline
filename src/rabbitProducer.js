const ampq = require("amqplib");
const config = require("./config")

let channel;

const connectRabbit = async () => {
    const conn = await ampq.connect(config.rabbit.url);
    channel = await conn.createChannel();
    await channel.assertQueue(config.rabbit.queue, { durable: true });

    console.log('✅[RabbitMQ] Producer connected')
}