const mqtt = require("mqtt")
const config = require("./config")

const { publishToQueue } = require("./rabbitProducer");

const startMqttSubscriber = async () => {
    const client = mqtt.connect(config.mqtt.broker, {
        username: config.mqtt.username,
        password: config.mqtt.password,
    });

    client.on("connect", () => {
        console.log(`[MQTT] Connected`);
        client.subscribe(config.mqtt.topic, (err) => {
            if (err)
                console.error(`[MQTT] Snbscriben error: ${err}`)
            else
                console.log(`[MQTT] Subscribed to the topic: -> ${config.mqtt.topic}`);
        });
    });

    client.on('message', async (topic, message) => {
        try {
            const payload = message.toString();
            await publishToQueue({
                topic,
                payload,
                receivedAt: new Date().toISOString()
            }
            )
        } catch (err) {
            console.error(`[MQTT] Error: ${err}`);
        }
    });

    client.on('error', (err) => console.error(`[MQTT] Error: ${err}`));
}

module.exports = {
    startMqttSubscriber
}