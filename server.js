import app from "./src/app.js";
import "dotenv/config";
import connectDB from "./src/common/config/db.js";

const PORT = process.env.PORT || 8000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT} in ${process.env.NODE_ENV} mode`);
  });
};

start().catch((err) => {
  console.log(`Failed to start server`, err);
  process.exit(1);
});
