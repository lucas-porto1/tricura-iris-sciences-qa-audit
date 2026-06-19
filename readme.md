# Tricura Insurance Group QA Evaluation — Iris Sciences

This repository contains my QA evaluation submission for the **Tricura Insurance Group** technical assessment.

The evaluated application is the **Iris Sciences Operational Console**, an internal administration platform used to manage test sessions, subject records, chamber assignments, operational workflows, and reporting.

The goal of this evaluation was to audit the deployed Iris Sciences system as an independent QA reviewer by identifying defects, assessing severity, deciding which findings are regression-worthy, and providing automated regression coverage for selected issues.

## Contents

```text
.
├── artifacts/
│   ├── reward-disbursement-notice.pdf
│   └── reward-disbursement-notice.png
├── tests/
│   ├── api/
│   │   ├── audit.spec.ts
│   │   ├── authorization.spec.ts
│   │   ├── legacy-console.spec.ts
│   │   ├── qe-index.spec.ts
│   │   ├── sessions.spec.ts
│   │   └── subjects.spec.ts
│   ├── support/
│   │   ├── apiClient.ts
│   │   └── testData.ts
│   └── ui/
│       └── public-site.spec.ts
├── AUDIT.md
├── README.md
├── package.json
├── package-lock.json
├── playwright.config.ts
├── tsconfig.json
├── .env.example
└── .gitignore
```

## Deliverables

### Automated Test Suite

The automated tests are implemented using **Playwright + TypeScript**.

The suite focuses on findings classified as regression-worthy in `AUDIT.md`. The goal is not to provide a full happy-path test suite for the entire product, but to cover selected defects with clear business, security, or data-integrity impact.

The main automated coverage areas are:

* role-based authorization boundaries
* protected report export controls
* credential-bearing audit attachment exposure
* legacy console access control
* session lifecycle enforcement
* subject-record availability
* Quarterly Enrichment Index correctness
* selected UI smoke coverage for public-facing defects

Most regression coverage is API-level because the selected findings are primarily backend authorization, access control, or business-rule issues. API tests provide more direct and reliable validation for those risks than UI-only tests.

UI tests are intentionally limited to public-facing behavior where browser validation adds value, such as the homepage QE Index and public routes linked from the homepage.

Some tests are marked with `test.fail()` because they assert the expected corrected behavior for confirmed defects documented in `AUDIT.md`. These tests are intentionally included as regression coverage for known issues. If the application is fixed, those tests will become unexpected passes and the `test.fail()` annotation should be removed.

### Audit Memo

The full audit memo is available in:

```text
AUDIT.md
```

It includes:

* Quarterly Enrichment Index assessment
* bug list with severity, reproduction steps, and regression triage
* methodology summary
* notes on exploratory testing and excluded/triaged observations

### Reward Disbursement Notice

A reward disbursement notice was discovered during the engagement and is included under:

```text
artifacts/reward-disbursement-notice.pdf
artifacts/reward-disbursement-notice.png
```

## Prerequisites

Install the following before running the tests:

* Node.js 18+
* npm

## Setup

Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Create a local environment file:

```bash
cp .env.example .env
```

Update `.env` with the required values:

```env
BASE_URL=https://iris.revelarautomation.com
CASE_TOKEN=<your-case-token>
```

Do not commit `.env` or any private token values.

## Running Tests

Run the full automated suite:

```bash
npm test
```

Run only API tests:

```bash
npm run test:api
```

Run only UI tests:

```bash
npm run test:ui
```

Run tests in headed mode:

```bash
npm run test:headed
```

Run tests in debug mode:

```bash
npm run test:debug
```

Run TypeScript validation:

```bash
npm run typecheck
```

Generate and open the Playwright HTML report:

```bash
npm run report
```

## Test Strategy

The test strategy follows a risk-based approach.

Regression coverage was selected for findings that affect:

* access control
* privilege escalation
* sensitive internal documents
* core workflow integrity
* subject data availability
* calculation/reporting correctness
* selected high-value user-facing behavior

Not every observed behavior was automated. Minor visual issues, ambiguous observations, low-risk usability issues, and findings without a reliable automation oracle were documented or triaged in `AUDIT.md`, but intentionally excluded from the automated suite.

API tests were prioritized for backend authorization and workflow integrity. UI tests were kept intentionally small and focused on public-facing defects with clear pass/fail criteria.

## Notes for Reviewers

The test suite requires a valid case token provided for the assessment. The token should be configured locally through `.env` using the `CASE_TOKEN` variable.

The committed `.env.example` file documents the required configuration shape without exposing private values.

Local folders such as `node_modules/`, `playwright-report/`, and `test-results/` are intentionally ignored and should not be committed.
