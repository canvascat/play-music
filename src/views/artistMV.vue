<template>
  <div v-show="show">
    <h1 class="text-4xl mt-9 mb-4.5 flex items-center">
      <img
        class="h-11 w-11 rounded-full mr-3"
        :src="resizeImage(artist.img1v1Url, 1024)"
        loading="lazy"
      />{{ artist.name }}'s Music Videos
    </h1>
    <MvRow :mvs="mvs" subtitle="publishTime" />
    <div class="flex justify-center">
      <ButtonTwoTone v-show="hasMore" color="grey" v-on:click="loadMVs">{{
        $t('explore.loadMore')
      }}</ButtonTwoTone>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from "vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import * as api from "@/api";
import NProgress from "nprogress";
import ButtonTwoTone from "@/components/ButtonTwoTone.vue";
import MvRow from "@/components/MvRow.vue";
import { resizeImage } from "@/utils/filters";

// 定义接口
interface Artist {
	id: number;
	name: string;
	img1v1Url: string;
	[key: string]: any;
}

interface MvItem {
	id: number;
	name: string;
	imgurl16v9?: string;
	cover?: string;
	coverUrl?: string;
	publishTime?: string;
	[key: string]: any;
}

const route = useRoute();

// 响应式数据
const id = ref(0);
const show = ref(false);
const hasMore = ref(true);
const artist = ref<Artist>({
	id: 0,
	name: "",
	img1v1Url: "",
});
const mvs = ref<MvItem[]>([]);

// 路由更新处理
onBeforeRouteUpdate((to, _from, next) => {
	id.value = Number(to.params.id);
	loadData();
	next();
});

// 生命周期
onMounted(() => {
	id.value = Number(route.params.id);
	loadData();
});

onActivated(() => {
	if (Number(route.params.id) !== id.value) {
		id.value = Number(route.params.id);
		mvs.value = [];
		artist.value = {
			id: 0,
			name: "",
			img1v1Url: "",
		};
		show.value = false;
		hasMore.value = true;
		loadData();
	}
});

// 方法
const loadData = () => {
	setTimeout(() => {
		if (!show.value) NProgress.start();
	}, 1000);
	api.artist.getArtist(id.value).then((data) => {
		artist.value = data.artist;
	});
	loadMVs();
};

const loadMVs = () => {
	api.artist.artistMv({ id: id.value, limit: 100, offset: mvs.value.length }).then((data) => {
		mvs.value.push(...data.mvs);
		hasMore.value = data.hasMore;
		NProgress.done();
		show.value = true;
	});
};
</script>
