---
title: Production AI Agent
slug: production-agent
summary: PoCのAIエージェントをAWS上で運用できる構成へ発展させたプロジェクト
order: 3
techStack: [Python, FastAPI, PostgreSQL, Docker, AWS, Terraform]
---

# Production AI Agent

## Overview

PoCとして動作したAIエージェントを、AWS上で運用できる構成へ発展させたプロジェクトです。

## Architecture

```text
Client
  ↓
Application
  ↓
FastAPI
  ↓
AI Agent
  ↓
PostgreSQL

Infrastructure
  ├─ AWS
  ├─ Docker
  └─ Terraform
```

## Tech Stack

- Python
- FastAPI
- PostgreSQL
- Docker
- AWS
- Terraform
