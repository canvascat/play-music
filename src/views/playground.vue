<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { IconNext } from "@/components/icon";
import ButtonIcon from "@/components/ButtonIcon.vue";
</script>

<template>
	<div>
		<h1>Playground</h1>
		<ButtonIcon>
			<IconNext class="size-6" />
		</ButtonIcon>
		<div class="flex gap-2 p-4 bg-red-500 rounded-lg">
			<Button variant="ghost" size="icon" class="hover:bg-accent/28"
				><IconNext class="size-6"
			/></Button>
			<Button variant="default" size="icon" class="hover:bg-red-500"
				><IconNext class="size-6"
			/></Button>
			<Button variant="outline" size="icon" class="hover:bg-red-500"
				><IconNext class="size-6"
			/></Button>
			<Button variant="secondary" size="icon" class="hover:bg-red-500"
				><IconNext class="size-6"
			/></Button>
			<Button variant="destructive" size="icon"><IconNext class="size-6" /></Button>
		</div>

		<Button variant="ghost" size="icon"><IconNext class="size-6" /></Button>
		<Button variant="default" size="icon"><IconNext class="size-6" /></Button>
		<Button variant="outline" size="icon"><IconNext class="size-6" /></Button>
		<Button variant="secondary" size="icon"><IconNext class="size-6" /></Button>
		<Button variant="destructive" size="icon"><IconNext class="size-6" /></Button>
	</div>
</template>

<style scoped lang="scss"></style>
