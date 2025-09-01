import { constants, publicEncrypt } from "node:crypto";

// 从PEM公钥中提取密钥长度
function getKeySize(pem: string): number {
	// 去掉PEM头尾、空白和换行
	const base64 = pem
		.replace(/-----BEGIN [^-]+-----/, "")
		.replace(/-----END [^-]+-----/, "")
		.replace(/\s+/g, "");

	// 解码base64得到DER格式
	const der = Buffer.from(base64, "base64");

	// 解析DER结构获取密钥长度
	// 对于RSA公钥，密钥长度通常在第二个字节开始
	let offset = 0;
	if (der[offset] === 0x30) {
		// SEQUENCE
		offset++;
		if (der[offset] & 0x80) {
			// 长度超过127字节
			const lenBytes = der[offset] & 0x7f;
			offset += lenBytes + 1;
		} else {
			offset += der[offset] + 1;
		}

		// 跳过BITSTRING标签和长度
		if (der[offset] === 0x03) {
			// BITSTRING
			offset++;
			if (der[offset] & 0x80) {
				const lenBytes = der[offset] & 0x7f;
				offset += lenBytes + 1;
			} else {
				offset += der[offset] + 1;
			}

			// 跳过未使用的位数
			offset++;

			// 现在应该到达RSA公钥的模数
			if (der[offset] === 0x02) {
				// INTEGER (modulus)
				offset++;
				let modulusLen;
				if (der[offset] & 0x80) {
					const lenBytes = der[offset] & 0x7f;
					modulusLen = 0;
					for (let i = 0; i < lenBytes; i++) {
						modulusLen = (modulusLen << 8) | der[offset + 1 + i];
					}
					offset += lenBytes + 1;
				} else {
					modulusLen = der[offset];
					offset++;
				}
				return modulusLen;
			}
		}
	}

	// 如果解析失败，返回默认值
	return 128; // 默认1024位
}

// 把短明文左侧补 0x00 到指定长度
function pad(buf: Buffer, size: number): Buffer {
	if (buf.length > size) throw new Error("Plaintext too long");
	return Buffer.concat([Buffer.alloc(size - buf.length, 0x00), buf]);
}

/**
 * 网易云音乐RSA加密
 * @param plain - 要加密的字符串
 * @param publicKeyPem - RSA公钥（PEM格式）
 * @returns 加密后的十六进制字符串
 */
export default function rsaEncrypt(
	plain: string,
	publicKeyPem: string,
): string {
	const input = Buffer.from(plain, "utf8"); // 明文
	const keySize = getKeySize(publicKeyPem); // 动态获取密钥长度

	const encrypted = publicEncrypt(
		{
			key: publicKeyPem,
			padding: constants.RSA_NO_PADDING,
		},
		pad(input, keySize), // 明文长度必须 == 密钥字节数
	);
	return encrypted.toString("hex"); // 转成 hex
}
