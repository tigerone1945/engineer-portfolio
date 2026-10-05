---
title: Amazon Bedrock AgentCore
slug: agentcore
summary: Production の Triage Agent を、AgentCore の6つの機能へ載せ替えるための境界・承認フロー・最小権限 IAM を設計・実装した拡張。実 AWS へのデプロイは未実施
order: 4
techStack: [Python, Amazon Bedrock AgentCore, Terraform, IAM, pytest]
---

# Amazon Bedrock AgentCore

## Overview

Production 段階の Triage Agent を、AI エージェント向けのマネージド実行基盤である Amazon Bedrock AgentCore（Runtime / Memory / Gateway / Identity / Observability / Evaluations）へ載せ替えられるようにした拡張です（EXTEND の段階）。

この段階で作ったのは、AgentCore の各機能とつなぐための**境界（インターフェース）と設計、承認フロー、最小権限の IAM、そしてそれらのテスト**です。既存の Build・PoC・Production のコードは変更していません。

**実際の AWS への AgentCore のデプロイは行っていません。** 課金が発生するため、現時点では行わないと決め、その判断を仕様書に記録しています。AgentCore の SDK クライアントもまだ組み込んでおらず、各機能は「契約（インターフェース）」と Fake を使ったテストで検証しています。

## Business Problem

Production では、実行環境（ECS Fargate）・Secret・監視を、自分で組み立てる構成にしていました。エージェントを業務で使い続けるには、次のことも必要になります。

- 外部システムにつながる Tool を、共有・統制できる形で扱う
- 副作用のある操作を、人間の承認なしに実行させない
- 会話の継続に必要な情報と、業務データの正本を混ぜない
- Agent 固有の実行記録を残し、品質を継続的に評価する

そのための土台を、既存の本番構成を壊さずに、段階的に用意することが目的です。

## Architecture

```text
Client
  ↓
AgentCore Runtime（接続は未実施）
  ↓
Runtime Adapter ── 既存の Classifier プロトコルを満たす境界層
  ↓
既存の Triage Agent / Pipeline（変更なし）
  ↓
PostgreSQL（業務データの正本）

境界層：
  ├─ Memory 境界 … Session Context / Long-term Memory を分離。業務データは扱わない
  ├─ Gateway … 外部接続が必要な Tool だけを対象にする
  ├─ Identity … 副作用のある Tool は、Human Approval のあとにだけ Credential を取得
  ├─ Observability … Agent 固有の実行記録。CloudWatch は置き換えず併用
  └─ Evaluations … 既存の eval・回帰テストとは別軸で評価
```

## Key Features

実装した範囲と、まだ行っていない範囲を、機能ごとに分けて示します。

### Runtime

- 実装：既存の Classifier プロトコルを満たす Runtime Adapter。ペイロード形式は暫定で、実際の形式が確認でき次第差し替える
- 未実施：実際の Runtime SDK の呼び出し

### Memory

- 実装：Session Context と Long-term Memory を分け、Memory へのアクセスを1か所に集約した境界
- 未実施：実際の Memory クライアントの接続

### Gateway

- 実装：Tool の棚卸し表（ローカル完結か、外部接続が必要か）、呼び出しのインターフェース、失敗時の再試行キュー
- 未実施：Gateway 経由で呼ぶ実際の Tool（チケット登録は従来どおりモック）

### Identity

- 実装：Workload Identity / Credential の取得と、Human Approval の非同期フロー（提案 → 承認 → 再開）
- 実装（Terraform）：専用ロール1つに、3つのアクションだけを、リソースを限定して許可
- 未実施：Workload Identity・Credential Provider の作成、`terraform apply`（`plan` までを確認）

### Observability

- 実装：実行記録を1つの窓口に集約し、個人情報をマスキングして記録
- 未実施：実際の Observability SDK への送信

### Evaluations

- 実装：8つの評価軸を定義し、うち4つは既存の評価結果から導出
- 未実施：残る4つ（Tool 選択、根拠の妥当性、Guardrail 順守、業務上の有用性）の判定ロジック

## Design Decisions

- **既存の Agent のコードは変えない。** Runtime Adapter が既存の `Classifier` プロトコルを満たす境界層になり、Runtime への依存をそこに閉じ込めました。Agent 本体を AgentCore の SDK に書き換える案は、既存テストの大半を作り直すことになるため採りませんでした。
- **業務データの正本は PostgreSQL のまま。** Memory には、会話の継続などの情報だけを置きます。業務データも Memory に置いて同期する案は、正本が2つになり、食い違ったときにどちらを信じるかが曖昧になるため採りませんでした。
- **全 Tool を一律に Gateway 化しない。** ルール判定や入力ガードレールのように、ローカルで決定論的に完結する Tool は、これまでどおりプロセス内で呼びます。不要なネットワークの往復と障害点を増やさないためです。
- **副作用のある Tool は、承認のあとにだけ Credential を取る。** 「Agent の提案 → 人間の承認 → Credential 取得 → Gateway → 外部 Tool」の順序を必ず通します。事前に Credential を取っておく案は、未承認のまま有効な時間帯が生じるため採りませんでした。
- **承認は非同期にし、記録は既存の Human Review と分ける。** 承認が長時間得られない場合に、Runtime の呼び出しを占有し続けないためです。既存の Human Review は問い合わせの分類修正専用のデータモデルで、Tool 実行の提案を表現できないため、別の記録先を設けました。
- **CloudWatch は置き換えず併用する。** インフラとアラームは CloudWatch、Agent 固有の実行記録は AgentCore Observability、と役割を分けました。Production で作ったアラーム設計を作り直さないためです。
- **評価は既存の回帰テストと別軸にする。** LLM による判定は確率的で、決定論的な回帰テストの合否基準に混ぜると、これまでの品質保証の意味が変わってしまうためです。
- **既存の ECS Fargate 構成を壊さない。** 変更は新規リソースの追加を中心にし、巻き戻せる状態を保ちました。

## Challenges

- 仕様書のレビューを4ラウンド行いました（チェック18項目のうち、1回目は7項目で見送り、4回目に17項目を満たして合格）。指摘を受けて、承認の記録を既存の Human Review のテーブルと分けたこと、承認を非同期の2段階（提案と再開）にしたこと、Memory へのアクセスを1か所に集約したことが、設計に反映されています。
- 既存の ECS タスクロールは、権限を一切持たない設計でした。AgentCore Identity は、アプリケーションのコードが初めて AWS の API を直接呼ぶ場面になります。そこで、既存のロールには権限を足さず、新しい専用ロールを用意し、必要なときだけ切り替える構成にしました。許可するのは3つのアクションに限り、`Resource: "*"` は使っていません。

## Improvements

- 実際の AWS への AgentCore のデプロイと、動作の確認（費用の上限は未確認のため、決めてから行います）
- 各機能への SDK クライアントの組み込み（現状は契約と Fake のみ）
- Gateway 経由で呼ぶ実際の Tool（チケット管理システム、通知、CRM など）
- Evaluations の残り4つの評価軸の判定ロジック
- ECS Fargate を残すか、AgentCore Runtime へ置き換えるかの判断

## Tech Stack

- Python / Pydantic
- Amazon Bedrock AgentCore（Runtime、Memory、Gateway、Identity、Observability、Evaluations。境界と設計を実装）
- Terraform / AWS IAM
- pytest 1438 件（PostgreSQL・実 LLM を使うものを除く。うち AgentCore 固有のテストが70件）と、mypy（30ファイル）が通る状態
- `terraform validate` と `terraform plan` が成功（ダミーの認証情報。`apply` は未実施）

## Repository

ソースコードは非公開です。詳細はご相談ください。
