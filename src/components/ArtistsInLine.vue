<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  artists: any[];
  exclude: string;
  prefix: string;
}>();

const filteredArtists = computed(() => {
  return props.artists.filter(a => a.name !== props.exclude);
});

const computedPrefix = computed(() => {
  if (filteredArtists.value.length !== 0) return props.prefix;
  else return '';
});
</script> 

<template>
  <span class="artist-in-line">
    {{ computedPrefix }}
    <span v-for="(ar, index) in filteredArtists" :key="index">
      <router-link v-if="ar.id !== 0" :to="`/artist/${ar.id}`">{{
        ar.name
      }}</router-link>
      <span v-else>{{ ar.name }}</span>
      <span v-if="index !== filteredArtists.length - 1" class="ml-[1px] mr-[4px] relative top-[0.5px]"
        >,</span
      >
    </span>
  </span>
</template>
