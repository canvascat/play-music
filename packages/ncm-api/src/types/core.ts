export interface Track {
	id: number;
	name: string;
	ar: Artist[];
	artists?: Artist[];
	al: Album;
	dt: number;
	pop: number;
	st: number;
	rt?: string;
	fee: number;
	v: number;
	crbt?: string;
	cd: string;
	cf: string;
	alia: string[];
	ftype: number;
	djId: number;
	copyright: number;
	s_id: number;
	mark: number;
	originCoverType: number;
	single: number;
	noCopyrightRcmd?: any;
	rtype: number;
	rurl?: string;
	mst: number;
	cp: number;
	mv: number;
	publishTime: number;
	tns?: string[];
	no?: number; // 音轨号
	pc?: {
		nickname: string;
		uid: number;
		pcid: string;
		cid: string;
		sn: number;
		br: number;
		alg: string;
	};
	// 扩展字段
	matched?: boolean;
	reason?: string;
	privilege?: TrackPrivilege;
	rtUrls?: any[];
	freeTrialPrivilege?: {
		resConsumable: boolean;
		userConsumable: boolean;
	};
	chargeInfoList?: any[];
	playable?: boolean;
}

export interface TrackUrl {
	/** 歌曲ID */
	id: number;
	/** 歌曲播放链接 */
	url: string;
	/** 比特率 */
	br: number;
	/** 文件大小（字节） */
	size: number;
	/** 文件MD5值 */
	md5: string;
	/** 响应状态码 */
	code: number;
	/** 链接过期时间（秒） */
	expi: number;
	/** 音频格式 */
	type: string;
	/** 音量增益 */
	gain: number;
	/** 峰值音量 */
	peak: number;
	/** 音量增益（关闭状态） */
	closedGain: number;
	/** 峰值音量（关闭状态） */
	closedPeak: number;
	/** 付费类型 */
	fee: number;
	/** 未知字段 */
	uf: any;
	/** 是否已付费 */
	payed: number;
	/** 歌曲标记 */
	flag: number;
	/** 是否可以扩展 */
	canExtend: boolean;
	/** 免费试听信息 */
	freeTrialInfo: any;
	/** 音质等级 */
	level: string;
	/** 编码类型 */
	encodeType: string;
	/** 声道布局 */
	channelLayout: any;
	/** 免费试听权限 */
	freeTrialPrivilege: {
		/** 资源是否可消费 */
		resConsumable: boolean;
		/** 用户是否可消费 */
		userConsumable: boolean;
		/** 试听类型 */
		listenType: any;
		/** 无法试听的原因 */
		cannotListenReason: any;
		/** 播放原因 */
		playReason: any;
		/** 免费限制标签类型 */
		freeLimitTagType: any;
	};
	/** 免费时间试听权限 */
	freeTimeTrialPrivilege: {
		/** 资源是否可消费 */
		resConsumable: boolean;
		/** 用户是否可消费 */
		userConsumable: boolean;
		/** 试听类型 */
		type: number;
		/** 剩余试听时间 */
		remainTime: number;
	};
	/** URL来源 */
	urlSource: number;
	/** 版权来源 */
	rightSource: number;
	/** 播客控制 */
	podcastCtrp: any;
	/** 特效类型 */
	effectTypes: any;
	/** 时长（毫秒） */
	time: number;
	/** 消息 */
	message: any;
	/** 音质混淆 */
	levelConfuse: any;
	/** 音乐ID */
	musicId: string;
	/** 伴奏 */
	accompany: any;
	/** 采样率 */
	sr: number;
	/** 音频效果 */
	auEff: any;
}

export interface CloudDiskTrack {
	addTime: number;
	album: string;
	artist: string;
	bitrate: number;
	cover: number;
	coverId: string;
	fileName: string;
	fileSize: number;
	lyricId: string;
	matchType: string;
	pcId: number;
	privateCloud: any;
	simpleSong: Track;
	songId: number;
	songName: string;
	version: number;
}

export interface Artist {
	id: number;
	name: string;
	tns?: string[];
	alias?: string[];
	picUrl?: string;
	img1v1Url?: string;
	briefDesc?: string;
	albumSize?: number;
	musicSize?: number;
	mvSize?: number;
	followed?: boolean;
	trans?: string;
	picId?: number;
	img1v1?: number;
	transNames?: string[];
}

export interface Album {
	id: number;
	name: string;
	pic: number;
	picUrl: string;
	tns?: string[];
	pic_str?: string;
	alia?: string[];
	transNames?: string[];
	artist: Artist;
	artists?: Artist[];
	publishTime: number;
	size?: number;
	copyrightId?: number;
	status?: number;
	picId?: number;
	mark: number;
	tags?: string;
	company?: string;
	briefDesc?: string;
	commentThreadId?: string;
	blurPicUrl?: string;
	companyId?: number;
	subType?: string;
	description: string;
	alias?: string[];
	artists_credits?: any;
	songs?: Track[];
	type: string;
}

export interface Playlist {
	id: number;
	name: string;
	coverImgUrl: string;
	creator: User;
	subscribed: boolean;
	trackCount: number;
	userId: number;
	playCount: number;
	bookCount: number;
	specialType: number;
	officialPlaylistType?: any;
	copywriter?: string;
	description?: string;
	tags?: string[];
	createTime: number;
	updateTime: number;
	subscribedCount: number;
	shareCount: number;
	commentCount: number;
	privacy: number;
	newImported: boolean;
	anonimous: boolean;
	totalDuration: number;
	cloudTrackCount: number;
	highQuality: boolean;
	trackUpdateTime: number;
	trackNumberUpdateTime: number;
	adType: number;
	algTags?: any;
	tracks?: Track[];
	trackIds?: TrackId[];
	englishTitle?: string;
	updateFrequency?: string;
}

export interface TrackId {
	id: number;
	v: number;
	t: number;
	at: number;
	alg?: string;
	uid?: number;
	rcmdReason?: string;
	sc?: any;
	f?: any;
	sr?: any;
}

export interface User {
	userId: number;
	nickname: string;
	signature?: string;
	description?: string;
	avatarUrl: string;
	backgroundUrl?: string;
	province: number;
	city: number;
	gender: number;
	followeds: number;
	follows: number;
	playlistCount: number;
	playlistBeSubscribedCount: number;
	accountStatus: number;
	vipType: number;
	djStatus: number;
	mutual: boolean;
	followed: boolean;
	remarkName?: string;
	authStatus: number;
	detailDescription?: string;
	experts?: any;
	expertTags?: any;
	djStatusChange?: number;
	vipLogs?: any;
	authority: number;
	anchor: boolean;
	avatarImgId: number;
	backgroundImgId: number;
	userType: number;
	createTime: number;
	userName: string;
	avatarImgIdStr?: string;
	backgroundImgIdStr?: string;
	avatarDetail?: any;
	defaultAvatar: boolean;
}

export interface TrackPrivilege {
	/** 歌曲ID */
	id: number;
	/** 付费类型 */
	fee: number;
	/** 是否已付费 */
	payed: number;
	/** 实际付费状态 */
	realPayed: number;
	/** 状态 */
	st: number;
	/** 播放权限 */
	pl: number;
	/** 下载权限 */
	dl: number;
	/** 特殊权限 */
	sp: number;
	/** 版权权限 */
	cp: number;
	/** 子权限 */
	subp: number;
	/** 是否可分享 */
	cs: boolean;
	/** 最大比特率 */
	maxbr: number;
	/** 免费权限 */
	fl: number;
	/** PC权限 */
	pc: any;
	/** 是否显示提示 */
	toast: boolean;
	/** 标记 */
	flag: number;
	/** 是否付费大爆炸 */
	paidBigBang: boolean;
	/** 是否预售 */
	preSell: boolean;
	/** 播放最大比特率 */
	playMaxbr: number;
	/** 下载最大比特率 */
	downloadMaxbr: number;
	/** 最大比特率等级 */
	maxBrLevel: string;
	/** 播放最大比特率等级 */
	playMaxBrLevel: string;
	/** 下载最大比特率等级 */
	downloadMaxBrLevel: string;
	/** 播放权限等级 */
	plLevel: string;
	/** 下载权限等级 */
	dlLevel: string;
	/** 免费权限等级 */
	flLevel: string;
	/** 资源状态 */
	rscl: any;
	/** 免费试听权限 */
	freeTrialPrivilege: {
		/** 资源是否可消费 */
		resConsumable: boolean;
		/** 用户是否可消费 */
		userConsumable: boolean;
		/** 试听类型 */
		listenType: number;
		/** 无法试听的原因 */
		cannotListenReason: number;
		/** 播放原因 */
		playReason: any;
		/** 免费限制标签类型 */
		freeLimitTagType: any;
	};
	/** 版权来源 */
	rightSource: number;
	/** 收费信息列表 */
	chargeInfoList: Array<{
		/** 比特率 */
		rate: number;
		/** 收费URL */
		chargeUrl: any;
		/** 收费消息 */
		chargeMessage: any;
		/** 收费类型 */
		chargeType: number;
	}>;
	/** 响应码 */
	code: number;
	/** 消息 */
	message: any;
	/** 播放权限等级 */
	plLevels: any;
	/** 下载权限等级 */
	dlLevels: any;
	/** 是否忽略缓存 */
	ignoreCache: any;
	/** 背景数据 */
	bd: any;
}

export interface MV {
	id: number;
	name: string;
	artistId: number;
	artistName: string;
	briefDesc?: string;
	desc?: string;
	cover: string;
	coverId: number;
	playCount: number;
	subCount: number;
	shareCount: number;
	commentCount: number;
	duration: number;
	nType: number;
	publishTime: string;
	brs: MVBr[];
	artists: Artist[];
	commentThreadId: string;
	videoGroup: any[];
}

export interface MVBr {
	size: number;
	br: number;
	point: number;
}

// 搜索相关类型
export interface SearchResult {
	songs?: {
		songs: Track[];
		songCount: number;
	};
	albums?: {
		albums: Album[];
		albumCount: number;
	};
	artists?: {
		artists: Artist[];
		artistCount: number;
	};
	playlists?: {
		playlists: Playlist[];
		playlistCount: number;
	};
	mvs?: {
		mvs: MV[];
		mvCount: number;
	};
}

// 歌词用户信息类型
export interface LyricUser {
	id: number;
	status: number;
	demand: number;
	userid: number;
	nickname: string;
	uptime: number;
}

// 歌词内容类型
export interface LyricContent {
	version: number;
	lyric: string;
}

// 歌词类型
export interface LyricLine {
	time: number;
	rawTime: string;
	content: string;
}

/**
 * 歌词数据接口
 * 包含原歌词、翻译歌词、音译歌词等多种类型的歌词数据
 */
export interface Lyric {
	/** 是否显示歌词 */
	sgc: boolean;
	/** 是否显示翻译 */
	sfy: boolean;
	/** 是否显示音译 */
	qfy: boolean;
	/** 翻译歌词的用户信息 */
	transUser: LyricUser;
	/** 原歌词的用户信息 */
	lyricUser: LyricUser;
	/** 原歌词内容 */
	lrc: LyricContent;
	/** 音译歌词内容（韩文等） */
	klyric?: LyricContent;
	/** 翻译歌词内容 */
	tlyric?: LyricContent;
	/** 罗马音歌词内容 */
	romalrc?: LyricContent;
	/** 日文歌词内容（罗马音） */
	yrc?: LyricContent;
	/** 日文歌词内容 */
	ytlf?: LyricContent;
}

// 分页类型
export interface PaginationParams {
	limit?: number;
	offset?: number;
}

/**
 * 歌单分类项类型
 * 包含歌单分类的基本信息
 */
export interface PlaylistCategory {
	/** 分类名称 */
	name: string;
	/** 资源数量 */
	resourceCount: number;
	/** 图片ID */
	imgId: number;
	/** 图片URL */
	imgUrl: string | null;
	/** 分类类型 */
	type: number;
	/** 分类类别 */
	category: number;
	/** 资源类型 */
	resourceType: number;
	/** 是否热门 */
	hot: boolean;
	/** 是否活动 */
	activity: boolean;
}
