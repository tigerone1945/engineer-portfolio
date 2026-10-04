---
title: PoC AI Agent
slug: poc-agent
summary: Triage AgentをStreamlit・FastAPI・SQLiteで、ブラウザから使えるPoCアプリケーションへ発展させたプロジェクト
order: 2
techStack: [Python, Streamlit, FastAPI, SQLite, OpenAI Agents SDK, httpx]
---

# PoC AI Agent

## Overview

ローカルCLIで動いていた Triage Agent に、ブラウザから使える画面（Streamlit）と API（FastAPI）を加え、永続化を SQLite へ移した PoC です（VALIDATE の段階）。Agent の判断ロジック（分類・Human Review の判定・振り分け）は、前の段階から変えていません。

## Business Problem

CLI だけでは、振り分け担当者が実際の業務の流れで使えるか、結果を見て納得できるかを確かめられません。この段階の目的は、業務利用を想定した画面から問い合わせを入れ、結果と履歴を確認できる形にして、要件を検証することです。

## Architecture

```text
Browser
  ↓
Streamlit（問い合わせ / 履歴 の2タブ）
  ↓ httpx
FastAPI（4エンドポイント）
  ├─ POST /triage
  ├─ GET  /history
  ├─ GET  /history/{request_id}
  └─ GET  /health
  ↓
Pipeline（Triage Agent と同じ判断ロジック）
  ↓
SQLite（output/triage.db。追記のみ）
```

## Key Features

- ブラウザから問い合わせを入力し、分類結果・優先度・担当部署・Human Review の理由を確認できる
- 処理履歴の一覧と詳細の閲覧
- API は4つのエンドポイントだけに限定
- 永続化を JSON / JSONL から SQLite（1ファイル・追記のみ）へ移行。呼び出し側のコードは変えずに済むよう、保存層を `storage.py` に集約
- 前の段階の CLI（`run` / `review` / `eval`）はそのまま使える

## Design Decisions

- **Agent のコードを変えない。** 変更は画面・API・保存層に閉じ、判断ロジックと既存のテストは維持しました。
- **Human Review の確定は CLI のまま。** 画面・API には承認・修正の手段を設けていません。認証を設けない PoC で、承認操作を公開しないための判断です。
- **ローカル専用に限定。** API の接続先は `127.0.0.1` / `localhost` 以外を拒否し、Streamlit もローカル専用・テレメトリなしの設定にしています。
- **ORM は使わない。** Pydantic を入出力の唯一の正とし、保存層は薄く保ちます。

## Improvements

認証・PostgreSQL・Docker・クラウド配置は、この段階では意図的に扱っていません。次の Production で扱います。

## Tech Stack

- Python / OpenAI Agents SDK
- FastAPI + uvicorn（API）/ Streamlit（画面）/ httpx（画面から API の呼び出し）
- SQLite
- テストは pytest（画面は `streamlit.testing.v1.AppTest`、API は `TestClient` を使い、ブラウザや実サーバーは不要）

## Repository

ソースコードは非公開です。詳細はご相談ください。

## Related Contents

Udemy 講座・Kindle 書籍と共通の題材です（リンクは今後追加します）。
