import express from "express";
import dotenv from "dotenv";
import { prisma } from "../lib/db";
import { nanoid } from "nanoid";
import { uptime } from "node:process";
import { time } from "node:console";
import cors from "cors";

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.get("/:code", async (req, res) => {
  const code = req.params.code;
  try {
    const result = await prisma.link.findFirst({
      where: {
        short_url: code,
      },
      select: {
        original_url: true,
        short_url: true,
      },
    });
    if (!result) {
      return res.status(404).json({
        error: "Not-found",
      });
    }
    console.log(result);
    if (result?.original_url) {
      await prisma.link.updateMany({
        where: {
          short_url: result.short_url,
        },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
      //   res.redirect(result?.original_url);
      return res.status(200).json({
        original_url: result.original_url,
      });
    }
  } catch (error) {
    console.log("Error occured while fetching", error);
    return res.status(500).json({
      Error: error,
    });
  }
});

app.post("/api/create", async (req, res) => {
  const Data = await req.body.original_url;
  if (!Data) {
    return res.status(400).json({
      error: "original_url is required",
    });
  }
  try {
    const result = await prisma.link.create({
      data: {
        original_url: Data,
        short_url: nanoid(6),
        clicks: 0,
      },
      select: {
        original_url: true,
        short_url: true,
      },
    });
    return res.status(201).json({
      message: "Short URL created successfully",
      original_url: result.original_url,
      short_url: `http://localhost:${port}/${result.short_url}`,
    });
  } catch (error) {
    console.log("Error occured while creating", error);
    return res.status(500).json({
      error: "Failed to create short URL",
      details: error,
    });
  }
});

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
