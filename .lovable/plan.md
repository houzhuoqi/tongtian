## 通天大圣灵签 — Web 高保真原型方案

> 注：本项目运行环境为 TanStack Start Web 应用（非微信原生小程序）。本原型在浏览器中以移动端竖屏比例呈现完整流程、状态机、UI 组件和占位视觉，可作为后续微信小程序开发的设计与逻辑参考。

---

### 一、整体架构

**单页面 + 状态机驱动场景切换**：所有"场景"（入场动画 / 墓前 / 签诗柜 / 离场）作为同一个全屏舞台中的视图层切换，避免路由跳转打断沉浸感。

```
src/routes/index.tsx        承载整个仪式舞台
src/lib/ritual-machine.ts   核心状态机（XState 风格的有限状态机）
src/lib/signs.ts            64 签数据（签号、签题、吉凶、繁体签诗、白话提示）
src/components/scenes/
  EntranceScene.tsx         入场动画（CSS 视差 + 雾气）
  TombScene.tsx             墓前场景（墓碑、香灰台、签筒）
  ShrineScene.tsx           签诗柜场景（签文展示）
  ExitScene.tsx             离场动画
src/components/ritual/
  WishPanel.tsx             请愿默念面板
  JiaoBeiThrow.tsx          阴阳筊投掷与判定
  SignShake.tsx             摇签按钮（动画 + 抽签）
  SignConfirm.tsx           签号三圣筊确认
  SignPoem.tsx              签文卷轴展示
  AiOracleChat.tsx          AI 解签对话（真实接入 Lovable AI）
  GratitudePanel.tsx        合掌 / 付费上香感谢
  PaywallSheet.tsx          付费占位弹窗（还愿 / 上香）
src/components/ui/
  RitualButton.tsx          暗金描边浮现式按钮
  RitualOverlay.tsx         半透明墨黑浮层
  IncenseParticles.tsx      香烟粒子（Canvas / CSS）
src/server/oracle.functions.ts  AI 解签 server function
```

---

### 二、核心状态机

每一步对应一个明确状态，转移由用户行为或筊结果驱动：

```text
ENTRANCE
  └─→ TOMB_IDLE                    (入场动画结束)
        ├─→ WISHING                ("请愿")
        │     └─→ JIAO_PERMIT      (默念完毕，开始掷筊问允)
        │           ├─ 圣筊 → SHAKING_SIGN
        │           ├─ 笑筊 → WISHING (重新稟明)
        │           └─ 阴筊 → EXITING (今日不可)
        ├─→ PAYWALL_REDEEM         ("付费还愿")
        │     └─→ POST_RITUAL
        │
SHAKING_SIGN                        (摇签按钮，生成签号)
  └─→ CONFIRM_SIGN                  (需连续 3 个圣筊)
        ├─ 累计 3 圣筊 → SHRINE_POEM
        ├─ 出现笑/阴筊 → SHAKING_SIGN (重摇)
        └─ 用户放弃 → EXITING

SHRINE_POEM                         (签诗柜场景)
  ├─→ AI_ORACLE                    ("解签助手")
  │     └─→ SHRINE_POEM            (返回签文)
  └─→ TOMB_GRATITUDE               ("解签完毕")

TOMB_GRATITUDE
  ├─→ GRATITUDE_PALMS              ("合掌感谢")
  └─→ PAYWALL_INCENSE              ("付费上香感谢")
        └─→ GRATITUDE_PALMS

GRATITUDE_PALMS / POST_RITUAL → POST_RITUAL_CHOICE
  ├─→ WISHING                      ("再次请愿")
  └─→ EXITING                      ("结束参拜")
        └─→ ENTRANCE (循环)
```

筊结果常量：`SHENG`（圣，一平一凹）、`XIAO`（笑，两平）、`YIN`（阴，两凸）。

---

### 三、各场景视觉与交互

**入场动画（约 6 秒）**
- 黑屏 → 竹林剪影渐显（CSS 多层视差） → 庙宇飞檐剪影从远到近（scale + translateY） → 红布条 SVG 飘动 → 雾气过场 → 墓前。
- 粒子层：香烟、浮尘（Canvas）。
- 底部"步入庙中"提示文案（暗金细体，淡入淡出）。

**墓前场景**
- 中央：石碑 SVG，竖排刻"通 / 天 / 大 / 聖"（繁体），字迹做斑驳遮罩。
- 前景：香灰台（插残香）+ 散落落叶。
- 背景：竹林模糊层 + 暗角晕影。
- 底部浮现状态相关按钮组（请愿 / 付费还愿 / 感谢 / 再次请愿 / 结束参拜）——按钮根据状态机切换。

**掷筊**
- 浮层中两枚月牙形阴阳筊 SVG，CSS 3D `rotateX/rotateY` 翻滚动画，停止后揭示结果。
- 结果卡：圣筊（暗金）/ 笑筊（暖橙）/ 阴筊（冷青），附释义。
- 签号确认：顶部计数 ●●○ 显示已得圣筊数。

**摇签**
- "摇签"按钮：长按或点击触发签筒晃动（CSS keyframes），1.2 秒后弹出签条，显示签号（如「第三十二籤 中吉」）。

**签诗柜场景**
- 切换为更暗、更窄的庙内构图：签柜木格背景，单张旧纸签条居中（米黄底 + 墨字 + 朱印章）。
- 竖排签诗四句 + 横排白话提示。
- 底部："解签助手" / "解签完毕"。

**AI 解签**
- 全屏对话浮层（保留场景背景虚化）。
- 顶栏："返回签文"。
- 消息流支持 Markdown 渲染（react-markdown）。
- 接入 Lovable AI Gateway（`google/gemini-3-flash-preview`），通过 `createServerFn` 调用，system prompt 注入当前签文上下文，引导以"庙祝"口吻、克制、白话+古意解释。
- 处理 429 / 402 错误并 toast 提示。

**感谢 / 付费**
- 合掌感谢：双手合十 SVG 浮现 + "心诚则灵" 默念文案。
- 付费占位弹窗（PaywallSheet）：
  - 还愿：金额 9.9 / 19.9 / 66 / 自定义；占位"模拟支付成功"按钮。
  - 上香感谢：1 支 / 3 支 / 9 支香选择，对应不同金额；同样模拟支付。
- 支付成功后写入本地 state（不持久化），继续流程。

**离场动画**
- 镜头反向：庙门 → 红布条 → 石阶 → 竹林山路渐远 → 黑屏 → "下次再来" 暗金题字 → 重置回入场。

---

### 四、视觉设计令牌（src/styles.css）

新增 oklch 暗色仪式主题：

```text
--background       近黑墨色（oklch ~0.12 微冷）
--foreground       旧纸米白（oklch ~0.88 微暖）
--ritual-gold      暗金（oklch ~0.72 0.12 85）   按钮描边、神性高光
--ritual-ember     香火橙红（oklch ~0.62 0.16 40）
--ritual-moss      苔绿（oklch ~0.45 0.05 145）
--ritual-stone     青灰石（oklch ~0.38 0.01 230）
--ritual-paper     旧纸黄（oklch ~0.82 0.06 80）
--ritual-ink       墨黑（oklch ~0.15 0.01 250）
--gradient-fog     竖向雾气渐变
--shadow-incense   暖橙发光（香火）
--shadow-altar     大范围底部暗角
```

字体：标题/碑文用 `"Noto Serif TC", "Ma Shan Zheng", serif`（繁体衬线，谷歌字体加载）；正文用 `"Noto Serif SC"`；UI 提示用细瘦衬线。绝不使用 Inter / 现代无衬线作为主字体。

动画：`fade-in`、`scale-in`、新增 `incense-rise`（粒子上升）、`bei-tumble`（筊翻转）、`scroll-unfurl`（签纸展开）、`gate-pass`（穿越遮罩转场）。

---

### 五、技术细节

- **AI 解签 server function**：`src/server/oracle.functions.ts`
  - 输入：`{ signNumber, signTitle, signPoem, userQuestion, history }`
  - 调用 Lovable AI Gateway，非流式（`supabase.functions.invoke` 不可用，本项目用 server fn + fetch），可选后续升级为 SSE。
  - 需启用 Lovable Cloud 以获得 `LOVABLE_API_KEY`。
- **签库**：内置 32~64 条示例签（含繁体签诗 + 吉凶 + 简短解），抽签为前端伪随机即可。
- **付费占位**：纯前端弹窗，无真实支付集成。
- **设备摇动**：本期不实现，仅按钮模拟，按钮带摇晃微动效暗示。
- **响应式**：以 390×844（iPhone 标准）为基准，桌面端在画布两侧加暗色空间并居中。

---

### 六、首期实现顺序

1. 启用 Lovable Cloud（为 AI 解签准备）。
2. 写入设计令牌、字体、全局暗色仪式主题。
3. 搭建状态机 + 主舞台容器 + 场景切换框架。
4. 实现入场 / 离场动画占位。
5. 实现墓前场景 + 请愿 + 掷筊 + 摇签 + 签号确认完整逻辑。
6. 实现签诗柜场景 + 签文展示。
7. 接入 AI 解签 server function + 对话 UI。
8. 实现感谢、付费占位弹窗、再次请愿 / 结束参拜分支。
9. 香烟粒子、雾气、暗角等氛围润色。
10. 全流程联调。

完成后即可在预览中走完一遍完整参拜仪式。
