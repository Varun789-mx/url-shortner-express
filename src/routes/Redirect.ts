import { prisma } from "../../lib/db";
import dotenv from "dotenv"
import { Router } from "express";


dotenv.config();
const router = Router();

router.get("/:code", async (req, res) => {
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

export default router;

