import { Hono } from "hono";
import request from "../../util/request";
import { AlbumListArea, type AlbumDetailResponse } from "../../types";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import { getCookie } from "hono/cookie";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const albumRouter = new Hono()
	.get("/:id", async (c) => {
		const { id } = c.req.param();
		const cookie = getCookie(c);
		const { body, status } = await request<AlbumDetailResponse>(`/api/v1/album/${id}`, { cookie });
		c.status(status as StatusCode);
		return c.json(body);
	})
	.put("/unsub/:id", async (c) => {
		const { id } = c.req.param();
		const cookie = getCookie(c);
		const { body, status } = await request<AlbumDetailResponse>(`/api/album/unsub/${id}`, {
			cookie,
		});
		c.status(status as StatusCode);
		return c.json(body);
	})
	.put("/sub/:id", async (c) => {
		const { id } = c.req.param();
		const cookie = getCookie(c);
		const { body, status } = await request<AlbumDetailResponse>(`/api/album/sub/${id}`, { cookie });
		c.status(status as StatusCode);
		return c.json(body);
	})
	.get(
		"/sublist",
		zValidator("query", z.object({ limit: z.number().default(25), offset: z.number().default(0) })),
		async (c) => {
			const { limit, offset } = c.req.valid("query");
			const cookie = getCookie(c);
			const { body, status } = await request<AlbumDetailResponse>(`/api/album/sublist`, {
				cookie,
				data: { limit, offset },
			});
			c.status(status as StatusCode);
			return c.json(body);
		},
	)
	.get(
		"/new",
		zValidator(
			"query",
			z.object({
				limit: z.number().default(30),
				offset: z.number().default(0),
				area: z.enum(AlbumListArea).default(AlbumListArea.all),
			}),
		),
		async (c) => {
			const { limit, offset, area } = c.req.valid("query");
			const cookie = getCookie(c);
			const data = { limit, offset, area };
			const { body, status } = await request<AlbumDetailResponse>(`/api/album/new`, {
				cookie,
				data,
			});
			c.status(status as StatusCode);
			return c.json(body);
		},
	)
	.get("/dynamic/:id", zValidator("param", z.object({ id: z.string() })), async (c) => {
		const { id } = c.req.param();
		const cookie = getCookie(c);
		const { body, status } = await request<AlbumDetailResponse>(`/api/album/detail/dynamic`, {
			cookie,
			data: { id },
		});
		c.status(status as StatusCode);
		return c.json(body, status as ContentfulStatusCode);
	});

export default albumRouter;
