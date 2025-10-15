import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { UrlHandler } from "./presentation/handlers/url.handler";
import { loggerMiddleware } from "./presentation/middlewares/logger.middleware";
import { rateLimitMiddleware } from "./presentation/middlewares/rate-limit.middleware";

// Dependency Injection Setup
const _prisma = new PrismaClient();
const urlHandler = new UrlHandler();

const app = new Hono();

// Middlewares
app.use("*", loggerMiddleware);
app.use("*", rateLimitMiddleware);

// Routes
app.post("/shorten", (c) => urlHandler.shortenUrl(c));
app.get("/:code", (c) => urlHandler.redirectUrl(c));

export default app;
