const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient({
    log: ['error', 'warn'],
})

const connectDb = async()=>{
    await prisma.$connect();
    console.log('[Prisma] connected to PostgreSql')
}