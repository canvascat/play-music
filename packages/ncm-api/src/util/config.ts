import randomIP from "./random-ip";

let cnIp: string;
let deviceId: string;
export const getCnIp = () => (cnIp ??= randomIP());

export async function getDeviceId() {
	return (deviceId ??= "313CD3C6D39148E94A6CD885B40E7C489AC9504078A7513928CE");
}

export const resourceTypeMap = {
	"0": "R_SO_4_",
	"1": "R_MV_5_",
	"2": "A_PL_0_",
	"3": "R_AL_3_",
	"4": "A_DJ_1_",
	"5": "R_VI_62_",
	"6": "A_EV_2_",
	"7": "A_DR_14_",
};

export const APP_CONF = {
	apiDomain: "https://interface.music.163.com",
	domain: "https://music.163.com",
	encrypt: true,
	encryptResponse: false,
};

/**
 * 生成网易云音乐客户端ID
 */
export const WNMCID = (function () {
	const characters = "abcdefghijklmnopqrstuvwxyz";
	let randomString = "";
	for (let i = 0; i < 6; i++)
		randomString += characters.charAt(
			Math.floor(Math.random() * characters.length),
		);
	return `${randomString}.${Date.now().toString()}.01.0`;
})();

/**
 * 操作系统映射配置
 */
export const osMap: Record<
	string,
	{
		os: string;
		appver: string;
		osver: string;
		channel: string;
	}
> = {
	pc: {
		os: "pc",
		appver: "3.0.18.203152",
		osver: "Microsoft-Windows-10-Professional-build-22631-64bit",
		channel: "netease",
	},
	linux: {
		os: "linux",
		appver: "1.2.1.0428",
		osver: "Deepin 20.9",
		channel: "netease",
	},
	android: {
		os: "android",
		appver: "8.20.20.231215173437",
		osver: "14",
		channel: "xiaomi",
	},
	iphone: {
		os: "iPhone OS",
		appver: "9.0.90",
		osver: "16.2",
		channel: "distribution",
	},
};
