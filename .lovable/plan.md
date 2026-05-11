## 方案

把两段上传的 mp3 接入入场/离场动画：环境音作为持续氛围底，脚步声跟随入场镜头节奏。

### 1. 资源接入
- 复制到项目：
  - `user-uploads://A_light_ambient_soun_2-1778484651121.mp3` → `src/assets/audio/ambient-wind.mp3`
  - `user-uploads://Gentle_wind_rustling_3-1778485011814.mp3` → `src/assets/audio/footsteps.mp3`
- 用 Vite ES 模块方式 import，确保打包。

### 2. 新增 hook：`src/hooks/useAmbientAudio.ts`
- 通用 hook，封装：`new Audio(src)`、`loop`、`volume`、淡入 / 淡出（用 `setInterval` 在 N ms 内插值音量）、组件 unmount 自动停止与释放。
- 暴露 `play({ targetVolume, fadeMs })` / `fadeOut(ms)`。
- 处理浏览器自动播放策略：第一次 `play()` 失败时挂一次性 `pointerdown` 监听，用户首次交互后再启动（仪式入口本身就有点击交互，体验自然）。

### 3. `EntranceScene.tsx`
- 挂载时：
  - 环境音 `ambient-wind`：fadeIn 1500ms，目标音量 0.35，循环。
  - 脚步声 `footsteps`：延迟 ~600ms（与画面"开始走"对齐）后 fadeIn 800ms 至 0.5，循环；如果脚步音频片段较短，循环刚好。
- 当 `phase >= 3`（末段过渡黑场）开始时：
  - 脚步声 fadeOut 700ms（停下来）。
  - 环境音保持低音量延续（不在此处停，给场景过渡留连贯感）。
- 组件 unmount 时停脚步；环境音留给后续场景或在 ExitScene 中淡出。

### 4. 跨场景的环境音连续性
为了避免每次场景切换都重新淡入造成"断层"，环境音放在更高一级（`RitualOverlay` 或路由根）会更自然。但当前最小改动方案：
- 在 `EntranceScene` 启动环境音并把 `Audio` 实例挂到 `window.__ambient`（简单全局引用）。
- `ExitScene` 挂载时检查 `window.__ambient`，如有则 fadeOut 1200ms 并清掉；没有就不做事。
- 这样不需要大改组件树，也能保证"入场起 → 离场落"的全程氛围音。

（如果你希望更干净的架构，我可以改为放进 `RitualOverlay` 里用 Context 管，但代码改动会更大。）

### 5. ExitScene 联动
- 挂载时：
  - 调用全局环境音 fadeOut 1200ms。
  - 不再播脚步声（离场是镜头远去，已经不需要"走"的脚步节奏；如果你想保留几步渐弱的脚步，告诉我我加上）。

### 文件改动清单
- 新增：`src/assets/audio/ambient-wind.mp3`、`src/assets/audio/footsteps.mp3`
- 新增：`src/hooks/useAmbientAudio.ts`
- 编辑：`src/components/scenes/EntranceScene.tsx`（挂载播放 + phase 切换控制脚步）
- 编辑：`src/components/scenes/ExitScene.tsx`（环境音淡出）

### 不在范围
- 不改运镜/物理参数
- 不改 AI / 数据库 / 路由
- 不动其他场景视觉
