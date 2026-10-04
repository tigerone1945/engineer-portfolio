---
title: Production AI Agent
slug: production-agent
summary: PoCのAIエージェントを、Docker・PostgreSQL・Terraformで、AWS上で運用できる構成へ発展させたプロジェクト
order: 3
github: https://github.com/tigerone1945/triage-agent
techStack: [Python, FastAPI, Streamlit, PostgreSQL, Docker, AWS, Terraform]
---

# Production AI Agent

## Overview

PoC として動作した Triage Agent を、AWS 上で運用できる構成へ発展させたプロジェクトです（OPERATE の段階）。Agent の判断ロジックは変えず、実行環境（コンテナ・AWS）、永続化（SQLite → PostgreSQL）、Secret とログの扱いを変えています。

構成は Terraform のコードとして定義しています。`terraform validate`・`terraform plan`（49 リソースの作成を確認）、`docker compose` によるローカル確認、自動テストで検証しました。実際の AWS 環境への `terraform apply`（課金が発生します）は、このポートフォリオの時点では行っていません。

## Business Problem

PoC は、ローカルの1プロセスと SQLite ファイルで動いていました。複数のコンテナから同じデータを扱う、API キーやパスワードをコードや環境変数に平文で置かない、障害を検知できる、同じ環境を再現できる、といった運用上の要件を満たしていません。

## Architecture

```text
Browser（許可した送信元IPのみ）
  ↓
ALB（パブリックサブネット）
  ↓
ECS Fargate：Streamlit（画面）
  ↓ Cloud Map（VPC内の名前解決）
ECS Fargate：FastAPI（API）→ Pipeline
  ↓
Amazon RDS for PostgreSQL（プライベートサブネット）

横断：
  ├─ ECR … コンテナイメージ（タグ変更不可）
  ├─ Secrets Manager … OPENAI_API_KEY・DB接続情報
  ├─ CloudWatch Logs / アラーム … ログ集約と起動失敗・異常終了の検知
  └─ Terraform … 上記すべてをコードで管理
```

## Key Features

- API と画面を、それぞれ Docker イメージにして ECS（Fargate）で稼働（非 root で実行）
- 永続化を RDS for PostgreSQL へ移行。テーブルの内容と呼び出し側のインターフェースは変えず、接続文字列だけで SQLite と切り替え可能
- `OPENAI_API_KEY` と DB 接続情報を Secrets Manager で管理し、タスク定義へ注入
- ログを CloudWatch Logs へ集約し、タスクの停止を EventBridge 経由で通知
- ECS・RDS・ALB・VPC・IAM などを Terraform で定義。デプロイ・再起動・ロールバックの手順を README に記載
- ローカルでは `docker compose`（API・画面・PostgreSQL の3コンテナ）で構成を確認できる

## Design Decisions

- **なぜ SQLite から PostgreSQL へ。** SQLite は複数プロセスからの同時書き込みに向きません。複数のコンテナから同じデータへ安全にアクセスするため、RDS for PostgreSQL に移しました。ORM は使わず、接続の切り替えは保存層の薄い層で行い、影響範囲を `storage.py` に閉じました。
- **なぜ Docker 化したか。** ローカルと AWS で同じものを動かすためです。ベースは公式の `python:3.13-slim` にしました。Alpine は一部パッケージのビルドで問題が起きやすく、distroless はデバッグしにくいため見送りました。
- **なぜ Terraform か。** `plan` で変更内容を確認しながら、同じ構成を再現できるようにするためです。アプリの更新（イメージの push と `image_tag` の変更）と、インフラの更新は別の手順にし、ECR はタグ変更不可にして、ロールバック時に以前のイメージが残るようにしました。
- **Secret の扱い。** 値は Terraform に書かず、Secrets Manager の入れ物だけを作ります。RDS のマスターパスワードは RDS 自身に生成させ、IAM はリソース ARN を指定した最小権限にしました。
- **公開範囲。** 画面だけを ALB 経由にし、許可する送信元 IP は既定値のない Terraform 変数で指定します。API は ALB を通さず、VPC 内からのみ到達できます。認証は設けていないため、公開範囲はネットワーク側で絞っています。
- **ログ・監視。** ロググループの保持日数は変数にしてコストを抑えます。ECS には「実行中タスク数」を直接出すメトリクスが既定でないため、Container Insights を有効にし、タスク停止は EventBridge のイベントで検知します。

## Challenges

- 設計レビューで、プライベートサブネットのタスクが ECR・Secrets Manager・CloudWatch Logs・OpenAI の API に到達できないことが見つかりました。OpenAI は AWS のサービスではなく VPC エンドポイントが使えないため、NAT ゲートウェイを追加しました。続くレビューで、セキュリティグループの送信ルールを明示しないと経路が成立しない点も是正しました。
- README の手順をそのまま実行すると、必須変数の不足で `terraform plan` が止まる箇所を、受け入れ確認で見つけて修正しました。

## Improvements

- 実際の AWS へのデプロイと、運用しながらの確認
- ALB の TLS 化（ACM 証明書・ドメイン）。現状は HTTP のみ
- NAT ゲートウェイの複数 AZ 化（現状は単一 AZ）
- Terraform の状態をリモートバックエンドで管理（現状はローカル）
- CI/CD（現状は手動の `terraform apply` とイメージの push）
- 複数ユーザー向けの認証・認可

## Tech Stack

- Python / FastAPI / Streamlit
- PostgreSQL（Amazon RDS）
- Docker / Amazon ECR
- AWS：ECS（Fargate）、ALB、VPC、Cloud Map、Secrets Manager、CloudWatch、EventBridge、IAM
- Terraform
- 自動テスト 1368 件（PostgreSQL・実 LLM を使うものを除く）と mypy が通る状態

## Repository

実装は [tigerone1945/triage-agent](https://github.com/tigerone1945/triage-agent) の `course06-operate` ブランチにあります。

## Related Contents

Udemy 講座・Kindle 書籍と共通の題材です（リンクは今後追加します）。
