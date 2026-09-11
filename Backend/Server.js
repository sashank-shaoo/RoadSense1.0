import app from "./src/App.js";

const start = async () => {
  try {
    const PORT = Number(app.config.PORT || 3000);

    await app.listen({
      port: PORT,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
