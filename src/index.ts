import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { errorHandler } from "./api/middlewares/error.handler";
import { UrlHandler } from "./api/url.handler";
import { UrlRepository } from "./repositories/url.repository";
import { UrlService } from "./services/url.service";

const app = new Hono();

// Dependency Injection Setup
const prisma = new PrismaClient();
const urlRepository = new UrlRepository(prisma);
const urlService = new UrlService(urlRepository);
const urlHandler = new UrlHandler(urlService);

// Middlewares
app.use("*", errorHandler);

// Routes
app.post("/shorten", (c) => urlHandler.shortenUrl(c));
app.get("/:code", (c) => urlHandler.redirectUrl(c));

export default app;
