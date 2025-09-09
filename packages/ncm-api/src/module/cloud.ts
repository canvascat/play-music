// import md5 from "md5";
// import * as mm from "music-metadata";
// import uploadPlugin from "../plugins/songUpload";
// import type { RequestBaseConfig } from "../types/module";
// import { createOption } from "../util/option";
// import request from "../util/request";

// /**
//  * ### 云盘上传
//  *
//  * 说明 : 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传 mp3 formData(name 为'songFile'),可上传歌曲到云盘
//  *
//  * 支持命令行调用,参考 module_example 目录下`song_upload.js`
//  *
//  * **接口地址 :** `/cloud`
//  *
//  * **调用例子 :** `/cloud`
//  *
//  */
// export default async function cloud(
// 	query: {
// 		songFile: {
// 			name: string;
// 			data: Buffer;
// 		};
// 	},
// ){
// 	let ext = "mp3";
// 	// if (query.songFile.name.indexOf('flac') > -1) {
// 	//   ext = 'flac'
// 	// }
// 	if (query.songFile.name.includes(".")) {
// 		ext = query.songFile.name.split(".").pop();
// 	}
// 	query.songFile.name = Buffer.from(query.songFile.name, "latin1").toString(
// 		"utf-8",
// 	);
// 	const filename = query.songFile.name
// 		.replace("." + ext, "")
// 		.replace(/\s/g, "")
// 		.replace(/\./g, "_");
// 	const bitrate = 999000;
// 	if (!query.songFile) {
// 		return Promise.reject({
// 			status: 500,
// 			body: {
// 				msg: "请上传音乐文件",
// 				code: 500,
// 			},
// 		});
// 	}
// 	if (!query.songFile.md5) {
// 		// 命令行上传没有md5和size信息,需要填充
// 		query.songFile.md5 = md5(query.songFile.data);
// 		query.songFile.size = query.songFile.data.byteLength;
// 	}
// 	const res = await request(
// 		`/api/cloud/upload/check`,
// 		{
// 			bitrate: String(bitrate),
// 			ext: "",
// 			length: query.songFile.size,
// 			md5: query.songFile.md5,
// 			songId: "0",
// 			version: 1,
// 		},
// 		"eapi",
// 	);
// 	let artist = "";
// 	let album = "";
// 	let songName = "";
// 	try {
// 		const metadata = await mm.parseBuffer(
// 			query.songFile.data,
// 			query.songFile.mimetype,
// 		);
// 		const info = metadata.common;

// 		if (info.title) {
// 			songName = info.title;
// 		}
// 		if (info.album) {
// 			album = info.album;
// 		}
// 		if (info.artist) {
// 			artist = info.artist;
// 		}
// 		// if (metadata.native.ID3v1) {
// 		//   metadata.native.ID3v1.forEach((item) => {
// 		//     // console.log(item.id, item.value)
// 		//     if (item.id === 'title') {
// 		//       songName = item.value
// 		//     }
// 		//     if (item.id === 'artist') {
// 		//       artist = item.value
// 		//     }
// 		//     if (item.id === 'album') {
// 		//       album = item.value
// 		//     }
// 		//   })
// 		//   // console.log({
// 		//   //   songName,
// 		//   //   album,
// 		//   //   songName,
// 		//   // })
// 		// }
// 		// console.log({
// 		//   songName,
// 		//   album,
// 		//   songName,
// 		// })
// 	} catch (error) {
// 		console.log(error);
// 	}
// 	const tokenRes = await request(
// 		`/api/nos/token/alloc`,
// 		{
// 			bucket: "",
// 			ext: ext,
// 			filename: filename,
// 			local: false,
// 			nos_product: 3,
// 			type: "audio",
// 			md5: query.songFile.md5,
// 		},
// 		"eapi",
// 	);

// 	if (res.body.needUpload) {
// 		const uploadInfo = await uploadPlugin(query);
// 		// console.log('uploadInfo', uploadInfo.body.result.resourceId)
// 	}
// 	// console.log(tokenRes.body.result)
// 	const res2 = await request(
// 		`/api/upload/cloud/info/v2`,
// 		{
// 			md5: query.songFile.md5,
// 			songid: res.body.songId,
// 			filename: query.songFile.name,
// 			song: songName || filename,
// 			album: album || "未知专辑",
// 			artist: artist || "未知艺术家",
// 			bitrate: String(bitrate),
// 			resourceId: tokenRes.body.result.resourceId,
// 		},
// 		"eapi",
// 	);
// 	// console.log({ res2, privateCloud: res2.body.privateCloud })
// 	// console.log(res.body.songId, 'songid')
// 	const res3 = await request(
// 		`/api/cloud/pub/v2`,
// 		{
// 			songid: res2.body.songId,
// 		},
// 		"eapi",
// 	);
// 	// console.log({ res3 })
// 	return {
// 		status: 200,
// 		body: {
// 			...res.body,
// 			...res3.body,
// 			// ...uploadInfo,
// 		},
// 		cookie: res.cookie,
// 	};
// }
