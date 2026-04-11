const { connectDb, disconnectDb } = require('./src/dbClient')
const { connectRabbit } = require('./src/rabbitProducer')
const { startConsumer } = require("./src/rabbitConsumer")
const { startMqttSubscriber } = require("./src/mqttSubscriber")

async function main() {
    await connectDb();
    await connectRabbit();
    await startConsumer();
    startMqttSubscriber();

    process.on('SIGINT', async () => {
    console.log('\n[App] Shutting down...');
    await disconnectDb();
    process.exit(0);    
    });

    main().catch(console.error);

}