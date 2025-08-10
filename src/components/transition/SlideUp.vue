<template>
	<transition
		enter-from-class="translate-y-full"
		enter-to-class="translate-y-0"
		leave-from-class="translate-y-0"
		leave-to-class="translate-y-full"
		enter-active-class="transition-transform duration-300"
		leave-active-class="transition-transform duration-300"
	>
		<slot />
	</transition>
</template>
