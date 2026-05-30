# Sehat — Phase 1 infrastructure (0 → ~5K users)

**Region:** `ap-south-1` (Mumbai). Single region. India data residency for DPDP Act.
**Principle:** serverless + Fargate. **No EKS in Phase 1** — it's operational overhead you
won't use at this scale. EKS arrives in Phase 2.

## Service map

| Concern | Service | Notes |
|---|---|---|
| SPA hosting + CDN | **S3 + CloudFront** | React build; `ACM` cert; `Route 53` DNS |
| Edge security | **AWS WAF** | on CloudFront + ALB — non-negotiable for a health app |
| API compute | **ECS Fargate** behind **ALB** | clean on-ramp to Phase-2 EKS |
| Container registry | **ECR** | |
| Report storage (PHI) | **S3** + **KMS** | versioned, access-logged, SSE-KMS |
| Pipeline orchestration | **Step Functions** | upload → extract → classify → AI |
| OCR / table extraction | **Amazon Textract** | |
| Medical entity extraction | **Amazon Comprehend Medical** | TEST_NAME / TEST_VALUE / TEST_UNIT |
| Insights + plan generation | **Amazon Bedrock (Claude)** | in-region; PHI stays resident |
| Glue / async steps | **Lambda** + **SQS** | scales to zero; decouples upload from processing |
| Relational data | **Aurora Serverless v2 (PostgreSQL)** | scales near-idle; Multi-AZ once paying |
| Activity / wearable events | **DynamoDB** | high-write; (Phase 2) |
| Auth | **Amazon Cognito** | HIPAA-eligible; MFA |
| Notifications | **Pinpoint** + **SNS** + **SES** | accountability nudges, family alerts (Phase 2) |
| Scheduling | **EventBridge Scheduler** | daily compliance checks (Phase 2) |
| Nearby food | **Amazon Location Service** or Google Places | the one spot a 3rd-party API may win |
| Secrets | **Secrets Manager** | DB creds, API keys |
| Audit / compliance | **CloudTrail**, **AWS Config**, **GuardDuty** | required for any compliance posture |
| Observability | **CloudWatch** + **X-Ray** | |
| CI/CD | **CodePipeline/CodeBuild** or GitHub Actions | → ECR → ECS |

## Compliance checklist (India, DPDP Act 2023)

- Blood reports = **sensitive personal data** → explicit consent, purpose limitation.
- Encrypt at rest (KMS) and in transit (TLS 1.2+).
- Right to erasure: `ON DELETE CASCADE` across the schema; S3 lifecycle + deletion on request.
- Audit every access to PHI (CloudTrail + app-level access logs).
- Data residency: keep everything in `ap-south-1`; do not call out-of-region AI APIs with PHI
  (this is *why* insights run on Bedrock in-region rather than an external endpoint).
- Ship hard disclaimers; always show the raw lab value beside any interpretation; advisory
  (never diagnostic) language. Sehat is **not** a registered medical device.

## Terraform

This connects to the modular multi-region pattern already in progress. Suggested Phase-1 modules:

```
infra/terraform/
├── network/        # VPC, subnets (public ALB, private app, isolated data), NAT
├── edge/           # CloudFront, WAF, ACM, Route 53
├── compute/        # ECS cluster, Fargate service, ALB, ECR
├── pipeline/       # Step Functions, Lambda, SQS, Textract/Comprehend/Bedrock IAM
├── data/           # Aurora Serverless v2, DynamoDB, KMS keys
├── identity/       # Cognito user pool + hosted UI
└── observability/  # CloudWatch, CloudTrail, Config, GuardDuty
```

Keep state remote (S3 backend + DynamoDB lock), one workspace per env (`dev`, `prod`).
