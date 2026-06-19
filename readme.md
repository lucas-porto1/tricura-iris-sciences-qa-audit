# Tricura Insurance Group QA Evaluation — Iris Sciences

This repository contains my QA evaluation submission for the **Tricura Insurance Group** technical assessment.

The evaluated application is the **Iris Sciences Operational Console**, an internal administration platform used to manage test sessions, subject records, chamber assignments, operational workflows, and reporting.

The goal of this evaluation was to audit the deployed Iris Sciences system as an independent QA reviewer by identifying defects, assessing severity, deciding which findings are regression-worthy, and providing automated regression coverage for selected issues.

The automated suite includes Playwright tests for confirmed defects found during the audit. Some tests intentionally use `test.fail()` because they assert the expected corrected behavior while the deployed application still contains those defects.

> [!IMPORTANT]
> Several tests in this repository intentionally use Playwright's `test.fail()` annotation.
> These tests validate confirmed defects found during the audit and assert the expected corrected behavior.
> They are expected failures while the deployed application still contains those defects.

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

## Important: Expected Failures

Several tests in this repository use Playwright's `test.fail()` annotation.

This is intentional.

The automated suite was written as regression coverage for confirmed defects found during the audit. These tests assert the **expected corrected behavior**, not the current broken behavior.

Because the deployed application still contains those defects, the related tests are expected to fail until the application is fixed.

In Playwright, tests marked with `test.fail()` are treated as **expected failures**. If the application is fixed and one of these tests starts passing, Playwright will report it as an **unexpected pass**. That is the signal that the defect was fixed and the `test.fail()` annotation should be removed.

This approach keeps the tests useful as future regression coverage while clearly documenting the current product defects.

## Prerequisites

Install the following before running the tests:

* Node.js 18+
* npm

## Setup

Clone the repository:

```bash
git clone https://github.com/lucas-porto1/tricura-iris-sciences-qa-audit
cd tricura-iris-sciences-qa-audit
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
