---
title: Triage AI Agent
slug: triage-agent
summary: 問い合わせの分類・優先度判定・担当部署への振り分けを行い、迷うケースは人間の確認へ回す業務向けAIエージェント
order: 1
github: https://github.com/tigerone1945/triage-agent
techStack: [Python, OpenAI Agents SDK, Structured Output, Guardrails, Tracing, Pydantic, uv, pytest, mypy]
---

# Triage AI Agent

## Overview

カスタマーサポートに届く問い合わせを、カテゴリ・優先度で分類し、担当部署へ振り分けるAIエージェントです。確信度が低いケースや、解約・返金・法務などの高リスクなケースは、自動処理せず人間の確認（Human Review）へ回します。

ローカルCLIで動く最初の段階（BUILD）であり、のちの PoC・Production・AgentCore へ発展させる土台です。題材はケーススタディとして設定した問い合わせトリアージ業務で、サンプルデータはすべて架空のものです。

## Business Problem

問い合わせを担当者が読み、手作業で分類・優先度判断・部署の選択・チケット登録をしている、という業務を想定しています。

- 振り分け担当者1〜2名がボトルネックになり、一次対応までの時間が延びる
- 担当者の経験によって、振り分け先や緊急度の判断がばらつく
- クレームや障害報告など緊急度の高い問い合わせが、他の問い合わせに埋もれる

```text
問い合わせ
   ↓
AI Agent（分類のみ）
   ├─ Category
   ├─ Priority
   └─ Confidence
        ↓
ルール（コード）が判定
   ├─ 条件に当てはまらない → 自動でチケット登録 → 担当部署
   └─ 当てはまる           → Human Review キュー → 人間が確定
```

## Key Features

- **分類は LLM、判断はコード。** LLM は分類（カテゴリ・優先度・確信度・要約）を返すだけです。登録するか人間に回すかは、決まったルールが決めます。問い合わせ本文にどんな指示が書かれていても、このルールは変わりません。
- **Human Review。** 次のいずれかに当てはまると、自動登録せず人間の確認へ回します。当てはまった理由はすべて記録します。
  - 高リスクキーワード（解約・返金・訴訟・法的措置・個人情報）を含む
  - クレーム性・法務関連である
  - カテゴリが未分類、日本語以外、複数カテゴリにまたがる
  - 確信度が閾値（0.7）未満である
  - 入力が短すぎる、または LLM の呼び出しがリトライ上限まで失敗した
- **入力ガードレール。** 短すぎる入力などは、LLM を呼ぶ前に止めます。
- **Structured Output。** 分類結果を Pydantic のスキーマで受け取ります。
- **Tracing。** OpenAI Agents SDK のトレースを有効にしています。本文などの機微な内容は、既定ではトレースに含めません。
- **設定の外出し。** 確信度の閾値・キーワード・カテゴリと担当部署のマスタを YAML で管理し、コードを変えずに調整できます。
- **評価。** ラベル付きデータで精度を測る `eval` コマンドがあります。

## Design Decisions

- **Agent の責務を分類だけに絞る。** Agent は Tools も Handoff も持たず、Structured Output を返すことだけを担います。業務判断を LLM に任せず、コードのルールにすることで、判断を説明・テストできるようにしました。
- **分類結果を信用しすぎない。** 低確信度・高リスク・クレーム性のケースは、人間へ戻す前提で設計しています。

## Tech Stack

- Python 3.13 / OpenAI Agents SDK
- Pydantic（入出力スキーマ）/ PyYAML（設定）
- uv（パッケージ管理）/ pytest・mypy（テスト・型チェック）
- 実行形態はローカルCLI。永続化は JSON / JSONL

## Repository

実装は [tigerone1945/triage-agent](https://github.com/tigerone1945/triage-agent) の `course04-build` ブランチ（タグ `course04-v1.0`）にあります。

## Related Contents

Udemy 講座・Kindle 書籍と共通の題材です（リンクは今後追加します）。
