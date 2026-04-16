const ampq = require("amqplib");
const config = require("./config")

let channel;



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

