import express from "express";
import dotenv from "dotenv";
import { prisma } from "../lib/db";
import { uptime } from "node:process";
import cors from "cors";
import Redirect from "./routes/Redirect";
import cookieparser from "cookie-parser";
import CreateRoute from "./routes/Create";

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL, // Replace with your frontend's actual origin (protocol, host, and port)
  credentials: true, // Only if your app uses cookies or authentication
}));
app.use(express.json());
app.use(cookieparser());
app.use('/', Redirect);
app.use(async (req, res, next) => {
  try {
    let userId = req.cookies?.anon_id;
    if (!userId) {
      userId = crypto.randomUUID()

      await prisma.user.create({
        data: {
          userId: userId
        }
      })
      res.cookie("anon_id", userId, {
        httpOnly: true,
        sameSite: "lax",
      })
      return res.json({ message: "New user created succesfully" })
    } else {
      const userExists = await prisma.user.findUnique({
        where: {
          userId: userId
        }, select: {
          Link: true,
        }
      })
      if (!userExists) {
        await prisma.user.create({
          data: { userId: userId }
        })
      }
      req.userId = userId;
      next();
    }
  } catch (error) {
    return res.status(500).json({ Error: "user initialization failed" })
  }
})
app.use('/api', CreateRoute);
app.get("/health", async (req, res) => {
  try {
    const healthCheck = {
      uptime: uptime(),
      message: "OK",
      timestamp: Date.now(),
    };
    res.status(200).json(healthCheck);
  } catch (error) {
    console.log("Error occured while fetching health", error);
    return res.status(500).json({
      error: "Failed to fetch health",
      details: error,
    });
  }
});
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}/`);
});
