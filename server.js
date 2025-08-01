require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost/ecb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

app.use("/auth", require("./routes/authRoutes"));
app.use("/", require("./routes"));

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});