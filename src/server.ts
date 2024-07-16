import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import Logger from "./utils/logger";

const logger = new Logger("server");

async function bootstrap() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    logger.log("datasource initialized", { name: "portal-punks" });
  } catch (err) {
    logger.error("unable to initialize datasource", {
      name: "portal-punks",
      reason: err.message,
    });
  }

  const PORT = process.env.PORT || 2001;
  const server = app.listen(PORT, () => {
    logger.log(`portal-punks api is running`, { PORT });
  });

  const exitHandler = () =>
    server.close(() => {
      try {
        // for (const cron of Object.values(cronJobs)) {
        //   cron.stop();
        // }
        logger.log("server closed", { PORT });
        process.exit(0);
      } catch (error) {
        logger.error("An error occurred", error?.message);
        process.exit(1);
      }
    });

  process.on("SIGTERM", exitHandler);
  process.on("SIGINT", exitHandler);
}

bootstrap();
