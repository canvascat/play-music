import { randomInt } from "node:crypto";

/**
 * 生成随机中国IP地址
 */
export default function generateRandomChineseIP(): string {
	const chinaIPPrefixes = ["116.25", "116.76", "116.77", "116.78"];

	const randomPrefix = chinaIPPrefixes[randomInt(chinaIPPrefixes.length)];
	return `${randomPrefix}.${generateIPSegment()}.${generateIPSegment()}`;
}

/**
 * 生成一个随机IP地址段
 */
function generateIPSegment() {
	return randomInt(1, 255 + 1);
}
