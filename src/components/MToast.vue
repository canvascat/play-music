<script setup lang="ts">
import { ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui'
import { ref } from 'vue'

const open = ref(false)
const timerRef = ref(0)



function handleClick() {
  open.value = false
  window.clearTimeout(timerRef.value)
  timerRef.value = window.setTimeout(() => { 
    open.value = true
  }, 100)
}
</script>

<template>
  <ToastProvider>
    <ToastRoot
      v-model:open="open"
      class="bg-white rounded-lg shadow-sm border p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
    >
      <ToastTitle class="[grid-area:_title] mb-[5px] font-medium text-slate12 text-sm">
        Scheduled: Catch up
      </ToastTitle>
      <ToastDescription as-child>
        <span
          class="[grid-area:_description] m-0 text-slate11 text-xs leading-[1.3]"
      
        >
          <slot></slot>
        </span>
      </ToastDescription>

    </ToastRoot>
    <ToastViewport class="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
  </ToastProvider>
</template>