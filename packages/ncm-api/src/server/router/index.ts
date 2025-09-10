import { Hono } from "hono";
import albumRouter from "./album";

const app = new Hono();

const routes = app.route("/album", albumRouter);

export default app;

export type AppType = typeof routes;
