import { Hono } from "hono";
import albumRouter from "./album";
import artistRouter from "./artist";

const app = new Hono();

const routes = app.route("/album", albumRouter).route("/artist", artistRouter);

export default app;

export type AppType = typeof routes;
