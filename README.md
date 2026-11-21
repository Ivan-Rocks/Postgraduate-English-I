# Postgraduate English I

考研英语一（科目代码 201）的微阅读练习数据与工具。与 [K-12-English](../K-12-English) 业务隔离：**数据隔离、schema 共享、repo 分开**。本 repo 只放考研英语一自己的内容，不引用 K-12 的词表或教材映射。

## 现状

- 面向一个词汇量薄弱、模考约 30/100、大量靠猜的 client，先做"deescalate"：缩小单元、缩小范围、保证高频次成功。
- 主干是**微阅读单元（passage）**，不是教材单元：一段短文 + 目标词汇 + 小 quiz + 句子翻译 + 输出任务。词汇不是孤立背的，是从刚读过的段落里抽出来练的。
- 首批 L1 样例是 [l1-library.json](data/units/l1-library.json)、[l1-office.json](data/units/l1-office.json)、[l1-secondhand.json](data/units/l1-secondhand.json)：60–120 词短文 + 5 个目标词 + 4 道 quiz + 句子翻译 + 输出任务，单轮控制在 15 分钟内。

## 目录

| 位置 | 内容 |
| --- | --- |
| [data/README.md](data/README.md) | 单元模型、字段、题型、L1/L2/L3 阶梯 |
| [data/units/](data/units/) | 微阅读单元，一个 JSON 一个单元 |
| [scripts/validate-units.mjs](scripts/validate-units.mjs) | 校验所有单元是否符合 schema |
| `integrations/dsh/` | DSH 插件：Host 半边提供单元数据，Client 半边在输入框上方显示常驻卡片 |

## 使用

Node.js 22 或更新版本，无第三方依赖。

```powershell
npm test
# 或
node scripts/validate-units.mjs
```

## 插件

练习入口是 DSH 插件，插件与数据同 repo，放 `integrations/dsh/`（与 K-12-English 的 `integrations/dsh/` 同模式）。

- **Host 半边**（`index.js`）：注册 `postgraduate-micro-reading` skill；并通过 `webServer` 暴露 `GET /postgraduate-english-i/units`，把 `data/units/*.json` 以 JSON 交给浏览器。
- **Client 半边**（`client.js`）：在对话输入框上方（`conversation.input.dock`）常驻一张「短文 + 当前题目」卡片，点选项会把作答填进输入框，按 Enter 发送给 agent 判题。
- 两种形态读的是同一份 `data/units/*.json`。

## 状态

- 数据结构为 schema 版本 2（含 `translation` / `output` / `timeBudgetMin`），样例为自编、内部使用、状态 `draft`，尚未人工核对。
- 版权：真题与外刊原文不可整篇进库；当前用自编短文起步。
