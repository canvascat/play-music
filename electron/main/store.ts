import Store from "electron-store";

interface StoreType {
	cookie?: string;
	cookies?: Electron.Cookie[];
}

const store = new Store<StoreType>({
	name: "ncm",
});

export default store;
