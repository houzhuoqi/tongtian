
## 目标

参考用户上传的实物筊杯照片，把"阴阳筊"重做成**暖红色 + 旧木磨损**质感，并让入口、神龛、墓地、出口等场景的整体氛围更"旧"——冷色基调中突出筊杯这一抹暖红，形成强烈对比。

---

## 一、筊杯贴图重做（核心）

参考图特征：
- 弯月形（半月牙）剖面
- **朱砂红 / 暗红漆**，已斑驳掉漆，露出底下的木胎与白底
- 表面有划痕、磨损、油垢、岁月包浆
- 边缘破损不规整，能看到木纹断面
- 哑光、不反光，非常"旧"

重新生成三张贴图（覆盖现有 `bei-curve.png` / `bei-flat.png` / `bei-edge.png`），统一风格：

1. **bei-curve.png（凸面/俯视）**
   - 半月形朱红漆面，中央漆色较饱满，两端磨损露白/露木
   - 顶部一道高光线，但不刺眼
   - 通体哑光、有手感的旧

2. **bei-flat.png（平面/底面）**
   - 平面朝上：能看到木胎质感更多，边沿一圈红漆残留
   - 中间油润的深色包浆

3. **bei-edge.png（侧面/厚度）**
   - 月牙厚度剖面，能看到一层红漆 + 木胎的夹层
   - 翻转过半圈时短暂出现，强化立体厚度

生成参数：
- 模型：`google/gemini-3-pro-image-preview`（贴图细节关键，值得用 pro）
- 透明背景 PNG
- 风格关键词：weathered cinnabar red lacquer, worn wood grain, chipped paint edges, matte aged patina, museum artifact photography, top-down studio light, isolated on white

---

## 二、调整筊杯落地的视觉与投影

`JiaoBeiThrow.tsx` 中：
- 把投影颜色从纯黑（`bg-black/70`）改成更柔的暖灰：`oklch(0.18 0.02 40 / 0.55)`，更贴合旧地面
- 尘粒颜色从米黄改成偏冷的青灰 `oklch(0.62 0.02 220 / 0.6)`，让暖红筊杯在冷尘雾中更突出
- `ImpactRing` 由金色波纹改成**朱红波纹** `oklch(0.55 0.15 30 / 0.5)`，与筊杯主色呼应
- `BeiStill`(idle 预览) 加一层非常微弱的暖红 `drop-shadow`（光晕），暗示它是"活的暖色"

---

## 三、统一全场景"旧"氛围

只动呈现层（颜色/滤镜/叠加层），不动业务逻辑。

1. **`src/styles.css` 设计令牌**
   - 新增/调整：
     - `--aged-overlay`: 一层全局淡褐色叠层 `oklch(0.35 0.04 60 / 0.08)`，模拟旧照片色偏
     - `--bei-red`: `oklch(0.52 0.16 30)`（旧朱砂红）
     - `--bei-red-glow`: `oklch(0.62 0.18 32 / 0.4)`
   - 现有金色 `--gold` 不动，保持仪式感

2. **`EntranceScene.tsx` / `ExitScene.tsx` / `ShrineScene.tsx` / `TombScene.tsx`**
   - 在最顶层加一个不可点击的 `aged-overlay` div：
     - 极轻的褐黄叠加（`mix-blend-mode: multiply`）
     - 极轻的颗粒感（用现有 noise/gradient，不引入新资源）
     - 四角微暗角（vignette）`radial-gradient` 让中心更亮、四周更旧
   - 入口/墓地场景的暖光光晕（之前已加）颜色微调，与新的 `--bei-red` 成系列

3. **`SignPoemView` / 签筒** 等其他红色元素
   - 顺手把签条/印章红色统一到 `--bei-red`，避免出现多种"红"打架

---

## 四、技术细节

文件改动清单：
- 重新生成：`src/assets/bei-curve.png`、`src/assets/bei-flat.png`、`src/assets/bei-edge.png`
- 编辑：`src/components/ritual/JiaoBeiThrow.tsx`（投影/尘粒/波纹颜色）
- 编辑：`src/styles.css`（新令牌 + aged overlay 工具类）
- 编辑：`src/components/scenes/EntranceScene.tsx`、`ExitScene.tsx`、`ShrineScene.tsx`、`TombScene.tsx`（追加 vignette + aged overlay 层）
- 不动：`src/lib/jiaobei.ts`（业务逻辑）、Supabase / 路由 / 服务端函数

QA：
- 生成贴图后用 `code--view` 逐张目检（透明背景、磨损可见、不糊）
- 在 idle 预览、抛掷中、落地三态下分别截图比对，确认"暖红 vs 冷场"对比成立
- 检查全场景叠加层不影响交互（`pointer-events: none`、`z-index` 在内容之下、UI 之上的合适位置）

---

## 不在范围

- 不改抛掷物理参数（已经调过）
- 不改运镜/步频（已经调过）
- 不改 AI / 数据库 / 路由
