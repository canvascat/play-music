import store from "@main/store";
import { procedure } from "@main/tipc";
import { BrowserWindow } from "electron";
import { fetchCookies } from "@main/ncm/cookie";
import user_account from "@main/ncm/func/user_account";

export const account = procedure.handle(async () => {
	const res = await user_account();
	return res.body;
});

export const signin = procedure.handle(async function () {
	const window = BrowserWindow.fromId(this.senderId);
	if (!window) throw new Error("Window not found");
	const cookies = await fetchCookies(window, true);
	store.set("cookies", cookies);
});
