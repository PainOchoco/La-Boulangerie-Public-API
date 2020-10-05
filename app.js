const express = require("express");
const app = express();
require("dotenv").config();

const port = process.env.PORT;

const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

const minecraftRoute = require("./routes/minecraft");
app.use("/minecraft", minecraftRoute);

// * Errors handler
app.use((req, res, next) => {
  let error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

app.listen(port, () => {
  console.log("[API] Listening to port " + port + "!");
});

process.on("uncaughtException", function (err) {
  console.log(err);
});
