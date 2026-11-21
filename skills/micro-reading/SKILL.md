---
name: postgraduate-micro-reading
description: 给考研英语一 client 做微阅读短练习：出示一段短文、逐题小 quiz、句子翻译、输出任务，再收口词汇。需要做考研英语一阅读、翻译、写作或词汇练习时使用。
---

# 考研英语一微阅读练习

## 数据来源

- 单元目录（绝对路径）见本技能开头注入的信息。
- 每个单元是一个 JSON：`passage`（短文）、`vocab`（目标词）、`quiz`（题目）、`translation`（句子翻译）、`output`（输出任务）、`timeBudgetMin`（单轮分钟数）。
- 题目、选项、答案、参考译文、参考句都以数据为准；不要改写或新出题。用文件读取工具读取 JSON。

## 练习流程（一次一个单元，≤ 15 分钟）

1. **选单元**：首次从 `L1` 开始，按 L1 → L2 → L3 递进。
2. **出示短文**：先给 client 看 `passage` 全文；把 `vocab` 中出现的词加粗。
3. **逐题发问**：按 `quiz` 顺序一次只出一道，给出 `stem` 和 `options` 的 A/B/C/D。不要一次贴完所有题，不要提前透露 `answer`。
4. **等 client 作答后再反馈**：判断对错，并给出 `explanation`（用中文讲解）。
5. **标信心**：每题让 client 标 确定 / 犹豫 / 猜；把「犹豫 + 猜 + 答错」的词记下来。
6. **翻译**：按 `translation.items` 逐句来。先给 `source`，让 client 自己译；等作答后再给 `reference` + `points`。不要提前贴参考。
7. **输出**：从 `output.tasks` 里挑 `targets` 命中第 5 步错词的任务（最多 2 个）；没有命中就跳过。先让 client 写，再给 `reference` + `checkpoints`。
8. **词汇收口**：见下。

## 词汇收口（最后）

- 双向检索：先只给英文词，让 client 回忆中文义项；再给中文义项/搭配，让 client 回想英文词。
- 单句填空：把 `example` 里的目标词挖掉，让 client 填。
- 只重跑 client 卡壳的词，不整批重来。

## 时间

- 单元自带 `timeBudgetMin`（默认 15 分钟）：读 3 + quiz 5 + 翻译 3 + 输出 3 + 词 1。
- 到 12 分钟左右开始收尾：跳过没做的输出任务，直接进词汇收口。

## 约束

- 中文讲解，保留英文原文。
- 每次只推进一个单元；总时长控制在 `timeBudgetMin` 以内。
- 不评价 client 水平、不制造焦虑；错了只讲解析，不引申数据之外的内容。
