---
title: Triage AI Agent
slug: triage-agent
summary: 問い合わせ分類・優先度判定・ルーティングを行う業務向けAIエージェント
order: 1
github: https://github.com/tigerone1945/triage-agent
techStack: [Python, OpenAI Agents SDK, Structured Output, Function Tools, Guardrails, Handoff, Tracing]
---

# Triage AI Agent

## Overview

問い合わせ内容をAIで解析し、カテゴリ分類・優先度判定・ガードレール・担当部門へのルーティング・Human Review・ハンドオフ・トレーシングを行う業務向けAIエージェントです。

## Business Problem

担当者が問い合わせを読み、内容を分類し、優先度を判断し、担当部署を選んでいました。

```text
問い合わせ
   ↓
AI Agent
   ├─ Category
   ├─ Priority
   ├─ Guardrail
   └─ Routing
        ↓
Human Review
        ↓
担当部署
```

## Tech Stack

- Python
- OpenAI Agents SDK
- Structured Output
- Function Tools
- Guardrails
- Handoff
- Tracing
