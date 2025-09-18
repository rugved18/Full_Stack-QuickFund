import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.router.js";
import adminRoutes from "./routes/admin.router.js";

import authRoutes from "./routes/auth.router.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

export default app;
