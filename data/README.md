# 微阅读单元（unit）

考研英语一练习的主干是**微阅读单元**：一段短文 + 挂在它上面的目标词汇 + 小 quiz，再加句子翻译与输出任务，形成「读 → 做 → 译 → 写 → 词」的闭环。词汇、题目、翻译和输出都引用同一段话，不孤立存在。

## 阶梯（deescalate 的路径）

| 级 | 篇幅 | 内容 | quiz 题量 |
| --- | --- | --- | --- |
| L1 | 60–120 词，1 段，题材熟悉 | 高频词 + 熟词僻义 | 3–4 题 |
| L2 | 150–250 词，2 段，出现长难句 | 长难句切分 + 逻辑词 | 4 题 |
| L3 | 300–400 词，真题风格 | 学术/评论，同义替换 | 5 题 |

一步步靠近真考的 400–500 词真题，而不是一上来被真题打懵。

## 单元字段

一个单元是一个 JSON 文件，放在 `data/units/`，schema 版本为 2。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `schemaVersion` | number | 固定 2 |
| `id` | string | 稳定 ID，如 `l1-library` |
| `level` | string | `L1` / `L2` / `L3` |
| `title` | string | 单元标题 |
| `topic` | string | 主题标签 |
| `wordCount` | number | 段落词数 |
| `timeBudgetMin` | number | 单轮时长上限（分钟），建议 15 |
| `timePlan` | object | 可选，各环节预算：`read` / `quiz` / `translation` / `output` / `vocab` |
| `passage` | string | 短文正文 |
| `source` | object | `origin`（self-written / licensed）、`license`、`status`（draft / verified） |
| `vocab` | array | 目标词汇，见下 |
| `quiz` | array | 小 quiz，见下 |
| `translation` | object | 句子翻译，见下 |
| `output` | object | 输出任务，见下 |

### vocab 项

| 字段 | 说明 |
| --- | --- |
| `word` | 词或短语 |
| `pos` | 词性 |
| `gloss` | 该语境下的一个中文义项（不塞多义项） |
| `collocation` | 一个高频搭配 |
| `example` | 一句自编例句 |

### quiz 项

| 字段 | 说明 |
| --- | --- |
| `id` | 题目 ID |
| `type` | 题型，见下表 |
| `target` | 可选，题干指向的词/短语 |
| `stem` | 题干（中文） |
| `options` | 3–5 个选项，每项 `key` + `text` |
| `answer` | 正确选项的 `key` |
| `explanation` | 中文解析（为什么对、定位到原文） |

### translation 对象

| 字段 | 说明 |
| --- | --- |
| `instructions` | 可选，中文作答要求 |
| `items` | 句子数组，非空 |

translation item：

| 字段 | 说明 |
| --- | --- |
| `id` | 句子 ID |
| `source` | 英文原句（应出自 `passage`） |
| `reference` | 参考译文 |
| `points` | 可选，1–3 条采分点 |

### output 对象

| 字段 | 说明 |
| --- | --- |
| `instructions` | 可选，中文作答要求 |
| `tasks` | 任务数组，非空 |

output task：

| 字段 | 说明 |
| --- | --- |
| `id` | 任务 ID |
| `kind` | `sentence`（单词造句）/ `scenario`（场景描述）/ `rewrite`（仿写改译） |
| `targets` | 目标词数组，取自 `vocab` |
| `prompt` | 中文指令 |
| `hint` | 可选，搭配或结构提示 |
| `reference` | 可选，参考句（作答后再看） |
| `checkpoints` | 可选，自检点 |

## 题型与考研阅读 Part A 的对应

| `type` | 考什么 | 对应 Part A 题型 |
| --- | --- | --- |
| `main-idea` | 段落主旨 | 主旨题 |
| `vocabulary-in-context` | 词在语境中的义项（熟词僻义） | 词义题 |
| `reference` | 代词/短语指代 | 细节/指代 |
| `logic-link` | 句间逻辑关系 | 逻辑/衔接 |
| `detail` | 定位具体信息 | 细节题 |
| `inference` | 推断 | 推理题 |
| `attitude` | 作者态度 | 态度题 |

## 练习层约定

- 单轮 ≤ 15 分钟，顺序：读 → quiz → 翻译 → 输出 → 词汇收口。
- 每题作答标 **确定 / 犹豫 / 猜**；错题与「犹豫 + 猜」的词进入输出环节——只有 `output.tasks[].targets` 命中这些词的才做，没有命中就跳过。
- 翻译：先自己译，再看 `reference` + `points`。
- 输出：先自己写，再看 `reference` + `checkpoints`；以 `targets` 里没把握的词为主。
- 词汇收口：从 `vocab` 抽词做双向检索（词→义、义→词）+ 单句填空。
- 跨天间隔 1/3/7 复习。
