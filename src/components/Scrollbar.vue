<template>
  <div>
    <transition name="fade">
      <div v-show="state.show" id="scrollbar" :class="{ 'on-drag': state.isOnDrag }" @click="handleClick">
        <div id="thumbContainer" :class="{ active: state.active }" :style="thumbStyle" @mouseenter="handleMouseenter"
          @mouseleave="handleMouseleave" @mousedown="handleDragStart" @click.stop>
          <div></div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowReactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  main?: HTMLElement | null,
}>();


defineOptions({ name: 'Scrollbar' });
const [userSelectNone] = defineModel<boolean>('userSelectNone')


const route = useRoute();

const state = shallowReactive({
  top: 0,
  thumbHeight: 0,
  active: false,
  show: false,

  onDragClientY: 0,
  isOnDrag: false,
})


let hideTimer: ReturnType<typeof setTimeout> | null = null;

const positions = ref({
  home: { scrollTop: 0, params: {} },
});

const thumbStyle = computed(() => ({
  transform: `translateY(${state.top}px)`,
  height: `${state.thumbHeight}px`,
}));

const main = computed(() => props.main);

useRouter().beforeEach((_to, _from, next) => {
  state.show = false;
  next();
});

function handleScroll(e: Event) {
  const target = e.target as HTMLElement;

  const clintHeight = target.clientHeight - 128;
  const scrollHeight = target.scrollHeight - 128;
  const scrollTop = target.scrollTop;
  let top = ~~((scrollTop / scrollHeight) * clintHeight);
  let thumbHeight = ~~((clintHeight / scrollHeight) * clintHeight);

  if (thumbHeight < 24) thumbHeight = 24;
  if (top > clintHeight - thumbHeight) {
    top = clintHeight - thumbHeight;
  }
  state.top = top;
  state.thumbHeight = thumbHeight;

  if (!state.show && clintHeight !== thumbHeight) state.show = true;
  setScrollbarHideTimeout();


  if (route.meta.savePosition) {
    positions[route.name as string] = { scrollTop, params: route.params };
  }
}

function handleMouseenter() {
  state.active = true;
}
function handleMouseleave() {
  state.active = false;
  setScrollbarHideTimeout();
}

function handleDragStart(e: MouseEvent) {
  state.onDragClientY = e.clientY;
  state.isOnDrag = true;

  userSelectNone.value = true;
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
}
function handleDragMove(e: MouseEvent) {
  if (!state.isOnDrag || !main.value) return;
  const clintHeight = main.value.clientHeight - 128;
  const scrollHeight = main.value.scrollHeight - 128;
  const clientY = e.clientY;
  const scrollTop = main.value.scrollTop;
  const offset = ~~(
    ((clientY - state.onDragClientY) / clintHeight) *
    scrollHeight
  );
  state.top = ~~((scrollTop / scrollHeight) * clintHeight);
  main.value.scrollBy(0, offset);
  state.onDragClientY = clientY;
}
function handleDragEnd() {
  state.isOnDrag = false;
  userSelectNone.value = false;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
}
function handleClick(e: MouseEvent) {
  let scrollTop: number;
  if (e.clientY < state.top + 84) {
    scrollTop = -256;
  } else {
    scrollTop = 256;
  }
  main.value?.scrollBy({
    top: scrollTop,
    behavior: 'smooth',
  });
}
function setScrollbarHideTimeout() {
  if (hideTimer !== null) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (!state.active) state.show = false;
    hideTimer = null;
  }, 4000);
}
function restorePosition() {
  if (
    !route.meta.savePosition ||
    positions[route.name as string] === undefined ||
    main.value === undefined
  ) {
    return;
  }
  main.value?.scrollTo({ top: positions[route.name as string].scrollTop });
}

defineExpose({
  handleScroll,
  restorePosition
});
</script>

<style lang="scss" scoped>
#scrollbar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 16px;
  z-index: 1000;

  #thumbContainer {
    margin-top: 64px;

    div {
      transition: background 0.4s;
      position: absolute;
      right: 2px;
      width: 8px;
      height: 100%;
      border-radius: 4px;
      background: rgba(128, 128, 128, 0.38);
    }
  }

  #thumbContainer.active div {
    background: rgba(128, 128, 128, 0.58);
  }
}

[data-theme='dark'] {
  #thumbContainer div {
    background: var(--color-secondary-bg);
  }
}

#scrollbar.on-drag {
  left: 0;
  width: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
