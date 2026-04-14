# 🚀 MQTT Pipeline

A real-time IoT data ingestion pipeline that receives data from MQTT-enabled devices (e.g., from sensors), queues messages via RabbitMQ, caches them in Redis, and persists to PostgreSQL using Prisma ORM.
## 🏗️ Architecture

MQTT Device → Node.js Subscriber → RabbitMQ Queue → Consumer → Redis Cache
                                                              → PostgreSQL D



## 📦 Prerequisites

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | v18 or v20 LTS | JavaScript runtime |
| Erlang/OTP | **26.x** | ⚠️ Must install BEFORE RabbitMQ |
| RabbitMQ | **3.13.x** | Message broker |
| Redis | Latest (Windows) | In-memory cache |
| PostgreSQL | 15 or 16 | Persistent database |



## ⚙️ Installation & Setup

### 1. Install Erlang/OTP 26

> ⚠️ **RabbitMQ will not work without Erlang. Install Erlang first.**

1. Download from: https://www.erlang.org/downloads
2. Choose **OTP 26.x — Windows 64-bit Binary**
3. Run the installer as **Administrator**, accept all defaults
4. Verify installation — open a new Command Prompt and run:
   
   erl
   
   You should see an Erlang shell. Type `q().` to exit.

> 💡 If `erl` is not recognized, add `C:\Program Files\erl-26.x\bin` to your System PATH.



### 2. Install RabbitMQ 3.13

1. Download from: https://www.rabbitmq.com/install-windows.html
2. Run the installer as **Administrator**
3. RabbitMQ installs as a Windows Service and starts automatically

#### Enable the Management UI

Open **PowerShell as Administrator** and run:

```powershell
cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-3.13.x\sbin"
rabbitmq-plugins enable rabbitmq_management
rabbitmq-service.bat stop
rabbitmq-service.bat start
```

Then open: http://localhost:15672
- **Username:** `guest`
- **Password:** `guest`

#### Start / Stop RabbitMQ Manually (bat file)

```powershell
cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-3.13.x\sbin"

# Start server
rabbitmq-server.bat

# Or control the Windows service
rabbitmq-service.bat start
rabbitmq-service.bat stop
```

#### Verify RabbitMQ is Running

```powershell
rabbitmqctl status
```

You should see `Status: running`.

> 💡 To auto-start on Windows boot: open `services.msc`, find **RabbitMQ**, set Startup Type to **Automatic**.



### 3. Install Redis

1. Download from: https://github.com/microsoftarchive/redis/releases
2. Download the latest `.msi` installer (`Redis-x64-xxx.msi`)
3. Run as **Administrator** — check **Add Redis to PATH**, keep port `6379`

#### Start Redis

```powershell
# As a Windows service
net start Redis

# Or manually
redis-server
```

#### Verify Redis

```powershell
redis-cli ping
```

Expected output: `PONG`

---

### 4. Install PostgreSQL

1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer — set a password for the `postgres` user, keep port `5432`
3. After install, create the database:

```powershell
psql -U postgres
```

```sql
CREATE DATABASE iot_db;
\q
```

> 💡 If `psql` is not recognized, add `C:\Program Files\PostgreSQL\16\bin` to your PATH.

---

### 5. Clone & Install Project

```powershell
git clone <your-repo-url> MQTT-Pipeline
cd MQTT-Pipeline
npm install
```

---

### 6. Configure Environment Variables

Create a `.env` file in the project root:

```env
MQTT_BROKER=mqtt://your-broker-url:1883
MQTT_TOPIC="topic/#"
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password

RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=Queue_name

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/iot_db"
```

> ⚠️ **Always wrap MQTT topics that contain `#` or `+` in double quotes.** Without quotes, the `#` is treated as a comment character and the value gets silently cut off.
>
> ✅ Correct: `MQTT_TOPIC="topic/#"`
> ❌ Wrong: `MQTT_TOPIC=topic/#`

---

### 7. Run Database Migrations

```powershell
cd "path\to\MQTT-Pipeline"
npx prisma migrate dev --name init
npx prisma generate
```

Expected output:
```
Your database is now in sync with your schema.
```

> ⚠️ Run this command from inside the project folder, not from `AppData` or any system directory.

---

### 8. Start with PM2

```powershell
# Install PM2 globally
npm install -g pm2

# Start the pipeline
pm2 start index.js --name mqtt-pipeline

# Save so it survives reboots
pm2 save
```

#### Useful PM2 Commands

| Command | Description |
|---------|-------------|
| `pm2 logs mqtt-pipeline` | View live logs |
| `pm2 logs mqtt-pipeline --lines 0` | View only new logs (skip history) |
| `pm2 restart mqtt-pipeline --update-env` | Restart and reload `.env` changes |
| `pm2 flush mqtt-pipeline` | Clear old log files |
| `pm2 stop mqtt-pipeline` | Stop the process |
| `pm2 delete mqtt-pipeline` | Remove from PM2 |
| `pm2 save` | Persist process list across reboots |

---

## ✅ Expected Logs on Successful Start

```
✅[Redis] connected
✅[Prisma] connected to PostgreSQL
✅[RabbitMQ] Producer connected
✅[RabbitMQ] Consumer ready, waiting for message...
[MQTT] Connected
[MQTT] Subscribed -> topic/#
```

When a device sends data:
```
✅[RabbitMQ] published: topic/868064072965913
[Redis] Cached -> latest:topic:868064072965913
[Prisma] Inserted id=1 topic=topic/868064072965913
```

---

## 📁 Project Structure

```
MQTT-Pipeline/
├── src/
│   ├── mqttSubscriber.js      # Connects to MQTT broker, receives messages
│   ├── rabbitProducer.js      # Publishes messages to RabbitMQ queue
│   ├── rabbitConsumer.js      # Consumes messages, writes to Redis + DB
│   ├── dbClient.js            # Prisma database client & queries
│   ├── redisClient.js         # Redis cache client
│   └── config.js              # Loads environment variables
├── prisma/
│   └── schema.prisma          # Database schema definition
├── .env                       # Environment variables (never commit this!)
├── index.js                   # Entry point
└── package.json
```

---

## 🛠️ Troubleshooting

| Error | Fix |
|-------|-----|
| `SyntaxError: Unexpected end of JSON input` | MQTT payload is raw CSV, not JSON. Use `message.toString()` directly — remove `JSON.parse()` in `mqttSubscriber.js` |
| `MQTT_TOPIC` only subscribing to `topic/` instead of `topic/#` | Wrap topic in quotes in `.env`: `MQTT_TOPIC="topic/#"` |
| `RABBIT_QUEUE` vs `RABBITMQ_QUEUE` mismatch | Ensure the `.env` key matches `config.js` exactly — use `RABBITMQ_QUEUE` in both |
| `Could not find Prisma Schema` | Run `npx prisma` commands from the project root directory, not from AppData |
| `Error: getaddrinfo ENOTFOUND` | MQTT broker hostname unreachable — check internet and broker URL in `.env` |
| Data not saving to database | Check `RABBITMQ_QUEUE` key matches in `.env` and `config.js` — a mismatch means producer and consumer use different queues |
| `redis-cli` not found | Add Redis install folder to Windows PATH |
| RabbitMQ fails to start | Install Erlang/OTP 26 **before** RabbitMQ. Reinstall RabbitMQ after confirming Erlang works |


---

## 📋 Quick Start Checklist

- [ ] Erlang/OTP 26 installed (`erl` works in terminal)
- [ ] RabbitMQ 3.13 installed and running (`rabbitmqctl status` shows running)
- [ ] RabbitMQ Management Plugin enabled (http://localhost:15672 loads)
- [ ] Redis running (`redis-cli ping` returns `PONG`)
- [ ] PostgreSQL installed and `iot_db` database created
- [ ] Node.js 18 or 20 installed
- [ ] `.env` file created with all required variables
- [ ] `MQTT_TOPIC` wrapped in quotes if using wildcards (`"topic/#"`)
- [ ] `RABBITMQ_QUEUE` key matches in both `.env` and `config.js`
- [ ] `npx prisma migrate dev --name init` completed successfully
- [ ] `pm2 start index.js --name mqtt-pipeline` running
- [ ] PM2 logs show all green checkmarks with no errors
- [ ] `pm2 save` run to persist across reboots

---

## 🔒 Security Notes

- Never commit your `.env` file — add it to `.gitignore`
- Change RabbitMQ default `guest` credentials in production
- Use strong passwords for PostgreSQL and MQTT broker
