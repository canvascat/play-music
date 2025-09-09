import store from "@main/store";
import { fetchCookies } from "ncm-api/electron";

export const getCookies = async () => {
	let cookies = store.get("cookies");
	if (cookies) return cookies;
	cookies = await fetchCookies();
	store.set("cookies", cookies);
	return cookies;
};
