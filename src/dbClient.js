const { PrismaClient } = require("./generated/prisma")

const prisma = new PrismaClient({
    log: ['error', 'warn'],
})

const connectDb = async () => {
    await prisma.$connect();
    console.log('✅[Prisma] connected to PostgreSql')
}


const insertReading = async (topic, payload, receivedAt) => {
    const record = await prisma.sensorReading.create({
        data: {
            topic,
            payload,
            receivedAt: new Date(receivedAt)
        }
    })
    console.log(`[Prisma] Inserted id=${record.id} topic=${topic}`)
    return record;
}


const getReadings = async (topic, limit = 10) => {
    return prisma.sensorReading.findMany({
        where: {
            topic
        },
        orderBy: { receivedAt: "desc" },
        take: limit
    });
}


const disconnectDb = async () => {
    await prisma.$disconnect();
    console.log("⚠️[Prisma] Disconnected")
}

module.exports = {
    connectDb,
    insertReading,
    getReadings,
    disconnectDb
}

