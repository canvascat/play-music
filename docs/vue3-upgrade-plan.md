# YesPlayMusic Vue 3 升级方案与计划

## 一、可行性分析

### 1. 依赖现状
- 当前使用 Vue 2.6.x 及其生态（vue-router 3.x、vuex 3.x、vue-i18n 8.x 等）。
- 主要依赖均有 Vue 3 兼容版本，部分插件需替换或寻找替代品。
- 构建工具已用 Vite，升级阻力较小。

### 2. 主要升级难点
- **语法变更**：生命周期、响应式、插槽、事件、v-model、filters 等均有变动。
- **依赖升级**：vue-router、vuex、vue-i18n 等需升级到 4.x/9.x，部分插件如 vue-clipboard2 需寻找 Vue 3 替代品。
- **全局 API 变更**：如 Vue.use、Vue.component、Vue.prototype 等注册方式需调整。
- **第三方组件兼容性**：如 vue-slider-component、vue-gtag 等需确认 Vue 3 兼容性。
- **部分功能需重构**：如 filters、mixin、全局事件总线等。

### 3. 官方迁移支持
- 官方提供 [Migration Build](https://v3-migration.vuejs.org/migration-build.html) 兼容层，可平滑过渡。
- 推荐直接用 Vite + Vue 3，逐步替换 API，最后移除兼容层。

---

## 二、升级方案

### 方案一：Migration Build 渐进式迁移（推荐）
1. 依赖升级：将 vue 升级到 3.x，并引入 @vue/compat 兼容层。
2. 配置兼容模式：在 vite.config.js 中配置 vue 指向 @vue/compat，并启用兼容模式。
3. 依赖升级：升级 vue-router、vuex、vue-i18n 等到 Vue 3 兼容版本。
4. 批量修复兼容性警告：根据控制台警告逐步修复不兼容用法。
5. 逐步重构组件：优先重构核心组件，逐步迁移到 Vue 3 新 API。
6. 移除兼容层：所有警告修复后，切换到纯 Vue 3。

### 方案二：全量重构
- 直接新建 Vue 3 项目，迁移所有业务代码和组件，适合大规模重构或代码债较多时。

---

## 三、详细升级计划

### 1. 依赖与工具链升级
- [x] 升级 `vue` 到 `^3.x`，并安装 `@vue/compat`
- [x] 升级 `vue-router` 到 `^4.x`
- [x] 升级 `vuex` 到 `^4.x` 或迁移到 Pinia（官方推荐）
- [x] 升级 `vue-i18n` 到 `^9.x`
- [x] 替换 `@vitejs/plugin-vue2` 为 `@vitejs/plugin-vue`
- [ ] 检查并升级/替换所有第三方 Vue 相关依赖（如 `vue-clipboard2`、`vue-gtag`、`vue-slider-component`）
    - https://reka-ui.com/examples/slider-number-field

### 2. 配置兼容层
- [x] 在 `vite.config.js` 配置 `vue: '@vue/compat'`，并启用 compat mode
- [x] 参考官方配置示例，设置 compilerOptions

### 3. 入口文件重构
- [x] `main.js` 用 `createApp` 创建应用，插件注册方式调整
- [ ] `App.vue`、`router`、`store`、`i18n` 初始化方式调整

### 4. 组件与业务代码迁移
- [x] 批量修复 filters、mixin、全局事件总线等不兼容用法
- [ ] 组件语法迁移（生命周期、响应式、插槽、v-model 等）
- [ ] 插件注册、全局组件注册方式调整
- [ ] 重点功能（播放、登录、设置、歌词、歌单等）优先迁移

### 5. 样式与动画适配
- [ ] 检查 `<transition>`、`<keep-alive>` 等用法，升级为新语法
- [ ] 检查并修复相关 CSS 类名

### 6. 测试与修复
- [ ] 全面测试主流程，修复兼容性 bug
- [ ] 重点测试 Electron 端、移动端适配

### 7. 清理与优化
- [ ] 移除 @vue/compat 兼容层，切换到纯 Vue 3
- [ ] 优化代码结构，充分利用 Composition API

---

## 四、时间与人力预估

| 阶段         | 预计时间 | 说明                     |
| ------------ | -------- | ------------------------ |
| 依赖升级     | 1 天     | 包含调研和替换           |
| 兼容层配置   | 0.5 天   | vite.config.js 配置       |
| 入口重构     | 1 天     | main.js、App.vue 等      |
| 组件迁移     | 3-5 天   | 视组件数量和复杂度而定   |
| 插件适配     | 1 天     | 依赖库、Vite、Electron   |
| 测试与修复   | 2-3 天   | 全面测试与 bug 修复      |
| **总计**     | 8-11 天  | 需 1-2 人全职投入        |

---

## 五、参考资料

- [官方迁移指南](https://v3-migration.vuejs.org/)
- [Migration Build 兼容层](https://v3-migration.vuejs.org/migration-build.html)
- [Vue Router 4.x 文档](https://router.vuejs.org/)
- [Pinia 状态管理](https://pinia.vuejs.org/) 

## TODO 

- this.$parent.$refs