import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import request from "../../util/request";
import type {
	ArtistAlbumResponse,
	ArtistDetailResponse,
	ArtistMVResponse,
	LikedArtistsResponse,
} from "../../types";
import type { StatusCode } from "hono/utils/http-status";

const artistRouter = new Hono()
	.get(
		"/album/:id",
		zValidator(
			"param",
			z.object({
				id: z.string(),
				limit: z.number().default(30),
				offset: z.number().default(0),
			}),
		),
		async (c) => {
			const { id, limit, offset } = c.req.valid("param");
			const data = { limit, offset };
			const cookie = getCookie(c);
			const { body, status } = await request<ArtistAlbumResponse>(`/api/artist/albums/${id}`, {
				cookie,
				data,
			});
			c.status(status as StatusCode);
			return c.json(body);
		},
	)
	.get(
		"/mv/:id",
		zValidator("param", z.object({ id: z.string() })),

		zValidator("query", z.object({ limit: z.number().default(30), offset: z.number().default(0) })),
		async (c) => {
			const { id } = c.req.valid("param");
			const { limit, offset } = c.req.valid("query");
			const data = { limit, offset };
			const cookie = getCookie(c);
			const res = await request<ArtistMVResponse>(`/api/artist/mvs/${id}`, {
				cookie,
				data,
			});
			c.status(res.status as StatusCode);
			return c.json(res.body);
		},
	)
	.put(
		"/sub/:id",
		zValidator("query", z.object({ action: z.enum(["sub", "unsub"]).default("sub") })),
		async (c) => {
			const { id } = c.req.param();
			const { action } = c.req.valid("query");
			const cookie = getCookie(c);
			const data = { artistId: id, artistIds: `[${id}]` };
			const res = await request<ArtistMVResponse>(`/api/artist/${action}`, { cookie, data });
			c.status(res.status as StatusCode);
			return c.json(res.body);
		},
	)
	.get(
		"/sublist",
		zValidator("query", z.object({ limit: z.number().default(25), offset: z.number().default(0) })),
		async (c) => {
			const { limit, offset } = c.req.valid("query");
			const cookie = getCookie(c);
			const data = { limit, offset, total: true };
			const { body, status } = await request<LikedArtistsResponse>(`/api/artist/sublist`, {
				cookie,
				data,
			});
			c.status(status as StatusCode);
			return c.json(body);
		},
	)
	/** 获取歌手单曲 */
	.get(
		"/:id",
		zValidator("param", z.object({ id: z.string() })),
		zValidator("query", z.object({ limit: z.number().default(25), offset: z.number().default(0) })),
		async (c) => {
			const { id } = c.req.valid("param");
			const { limit, offset } = c.req.valid("query");
			const cookie = getCookie(c);
			const data = { limit, offset };
			const { body, status } = await request<ArtistDetailResponse>(`/api/artist/${id}`, {
				cookie,
				data,
			});
			c.status(status as StatusCode);
			return c.json(body);
		},
	);

export default artistRouter;
