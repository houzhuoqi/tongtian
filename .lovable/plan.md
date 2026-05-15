## 背景

我在 `src/assets/` 下找到的 `bei-flat.png`（平面/背面）和 `bei-curve.png`（凸面/正面）就是 5月13号那张实物筊照片处理出来的。下面以这两张为基底来产出多角度视图。

如果你说的不是这张，请直接重新发一张图给我，我以新图为基底重做即可。

## 目标

围绕筊的"长轴"做翻转（这是真实掷筊时的主要翻动方向），产出 8 帧 22.5° 间隔的视图，覆盖 0°–157.5°。另外半圈（180°–337.5°）在动画中用同一组帧 + 翻转/反向播放复用，无需重复生成。

```text
帧序号    角度       看到的样子
00       0°        平面朝上（背面全貌）
01       22.5°     平面微倾，下沿露出一点厚度
02       45°       半侧面，开始能看到凸面的边缘
03       67.5°     接近侧立，主要是边缘 + 厚度
04       90°       完全侧立（edge 视图）
05       112.5°    凸面开始翻上来
06       135°      凸面大部分朝上
07       157.5°    凸面接近完全朝上
（180°）  对称等价于 00 翻转，复用即可
```

## 生成方式

用 `imagegen--edit_image`，以 `bei-curve.png` + `bei-flat.png` 同时作为输入，让模型理解"这是同一个木质红色筊的两面"，然后逐帧出 8 张：

- 输出尺寸：512×512，透明背景，居中，统一光照（顶光 + 暖色环境反弹），保持木纹斑驳和红漆掉色质感一致。
- 文件命名：`src/assets/bei/frame-00.png` … `frame-07.png`
- 每帧 prompt 模板大致：
  > "Same weathered red lacquered wooden crescent block (jiaobei) as in the reference photos, photographed from a fixed camera, the block rotated <X>° around its long horizontal axis. Plain transparent background, soft top-down studio light, consistent material and wear pattern across all frames."

8 帧会顺序生成（不并行，避免风格漂移）。生成完后我会拼一张 sprite 预览给你检查一致性。

## 确认环节（动画暂不动）

按你"等我看到多角度图后再决定"的要求，这一轮我**只产出图、不改动画代码**。预览出来后你告诉我：

1. 8 帧风格是否一致、是否需要重出某几帧
2. 动画走哪种路线（sprite 序列帧 / 仍用 CSS 3D 但替换贴图 / 其它）

确认后再单独提一个动画改造方案。

## 文件改动清单（本轮）

- 新增：`src/assets/bei/frame-00.png` … `frame-07.png`
- 新增（临时预览）：`/mnt/documents/bei-frames-preview.png`（拼图，方便你一眼对比）

## 不在范围

- 不修改 `JiaoBeiThrow.tsx` 或 `styles.css` 的动画
- 不删除现有 `bei-flat.png` / `bei-curve.png` / `bei-edge.png`（动画切换前还要靠它们）
- 不动音效、其它场景