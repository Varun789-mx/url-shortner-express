import { prisma } from "../../lib/db";
import { nanoid } from "nanoid";
import dotenv from "dotenv"
dotenv.config();
import { Router } from "express";

const router = Router();

router.post("/create", async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(400).json({
            error: "UserId not found",
        })
    }
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
                authorId: userId,
            },
            select: {
                original_url: true,
                short_url: true,
            },
        });
        return res.status(201).json({
            message: "Short URL created successfully",
            original_url: result.original_url,
            short_url: `${process.env.MAIN_URL}/${result.short_url}`,
        });
    } catch (error) {
        console.log("Error occured while creating", error);
        return res.status(500).json({
            error: "Failed to create short URL",
            details: error,
        });
    }
});

export default router;