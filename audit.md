# Audit Memo — Iris Sciences Operational Console

## Quarterly Enrichment Index

The public homepage displays the Quarterly Enrichment Index as:

```text
87.4%
```

The authenticated dashboard displays a different value labelled as canonical:

```text
31.0%
```

However, the legacy methodology records and IFR-71-Q3 evidence indicate that both displayed values are incorrect. The corrected Quarterly Enrichment Index identified during the audit is:

```text
84.7%
```

This value was not inferred from the public homepage or from the modern dashboard. It was identified through the legacy IFR-71-Q3 records, where the evidence transcript indicates that the Q3 index was corrected to `84.7`.

The related legacy protocols explain why the modern values appear unreliable:

* `PROTOCOL-1 — Calibration discipline` states that the Q3-1971 reweight uses `M(C-Δ-7) = 0.4`.
* `PROTOCOL-2 — Reweight authority` states that formula reweights require Principal Investigator sign-off and that provisional weights remain valid until the next IFR is filed.
* `PROTOCOL-3 — Attendance gate` states that redacted attendance rows count toward the cycle-close gate but are not made public.
* `PROTOCOL-4 — Exclusion ledger` states that excluded session IDs are filed under `/api/v1/legacy/exclusions` and are not removed after filing.

These rules indicate that the correct QE calculation depends on legacy reweighting, PI-authorized methodology, redacted attendance data, and the legacy exclusion ledger.

**Displayed public value:** `87.4%`
**Displayed dashboard value:** `31.0%`
**Correct legacy-adjusted value:** `84.7%`

**Result:** Both the public homepage and dashboard values should be treated as incorrect.

---

## Bug List

### Finding 1 — QE Index does not match the legacy-corrected methodology value

**Severity:** Medium

**Regression-worthy:** Yes

**Preferred automation layer:** API/UI

**Rationale:**

The Quarterly Enrichment Index is the system’s primary published performance indicator. The public homepage displays `87.4%`, the dashboard displays `31.0%`, and the legacy-corrected IFR-71-Q3 value is `84.7%`. This creates inconsistent reporting across public, authenticated, and legacy surfaces.

**Steps to reproduce:**

1. Open the public homepage:

   ```text
   https://iris.revelarautomation.com/
   ```

2. Observe the public Quarterly Enrichment Index:

   ```text
   87.4%
   ```

3. Log in to the admin area.

4. Open the Dashboard page.

5. Observe the dashboard value:

   ```text
   Quarterly Enrichment Index (Canonical): 31.0%
   ```

6. Access the legacy operator console.

7. Authenticate using the recovered Chief Scientist access.

8. Read the methodology protocols:

   ```text
   read protocol-1
   read protocol-2
   read protocol-3
   read protocol-4
   ```

9. Review the IFR-71-Q3 evidence transcript.

10. Observe that the corrected Q3 index is identified as:

```text
84.7%
```

**Expected result:**

The public homepage and authenticated dashboard should display the corrected methodology-backed Quarterly Enrichment Index.

**Actual result:**

The homepage displays `87.4%`, the dashboard displays `31.0%`, and the legacy-corrected value is `84.7%`.

**Triage decision:**

Regression-worthy. This is a primary reporting metric and a key evaluation objective.

---

### Finding 2 — Test Subject can access administrative dashboard metrics

**Severity:** High

**Regression-worthy:** Yes

**Preferred automation layer:** API

**Rationale:**

The Test Subject role is documented as being able to view only its own subject record and session history. The admin dashboard exposes operational metrics and system-wide data outside that scope.

**Steps to reproduce:**

1. Log in as `Test Subject`.

2. Open:

   ```text
   /admin/dashboard
   ```

3. Observe operational metrics, including:

   ```text
   Subjects enrolled
   Sessions in QE roll-up
   Open incidents
   Chambers online
   Pending approvals
   Quarterly Enrichment Index
   ```

4. Observe that pending approvals and recent activity are also visible on the dashboard.

**Expected result:**

A Test Subject should not access administrative dashboard metrics or system-wide operational data.

**Actual result:**

The Test Subject role can access admin dashboard metrics, pending approval information, and recent activity.

**Triage decision:**

Regression-worthy. This is a role-based authorization issue and should be enforced server-side.

---

### Finding 3 — Test Subject can access chamber list, legacy chamber details, and legacy console surface

**Severity:** High

**Regression-worthy:** Yes

**Preferred automation layer:** API/UI

**Rationale:**

Chamber list visibility is documented as a Junior Test Coordinator capability, not a Test Subject capability. The Test Subject role can access chamber data and reach the legacy chamber/console surface.

**Steps to reproduce:**

1. Log in as `Test Subject`.

2. Open:

   ```text
   /admin/chambers
   ```

3. Observe that the chamber list is visible.

4. Observe multiple chamber entries, including:

   ```text
   C-01
   C-02
   C-03
   ...
   C-12
   C-Δ-7
   ```

5. Open the legacy chamber entry:

   ```text
   C-Δ-7
   ```

6. Reach the legacy console surface from the legacy chamber.

**Expected result:**

A Test Subject should not access chamber lists, chamber details, or the legacy console surface.

**Actual result:**

The Test Subject role can access chamber operational data and reach the legacy console surface.

**Triage decision:**

Regression-worthy. This is a clear role-boundary issue and a path into a sensitive legacy surface.

---

### Finding 4 — Test Subject can access report export controls

**Severity:** High

**Regression-worthy:** Yes

**Preferred automation layer:** API

**Rationale:**

The role matrix assigns methodology and export controls to the Director of Enrichment. A Test Subject should not access report export controls.

**Steps to reproduce:**

1. Log in as `Test Subject`.

2. Open the reports page or call the export endpoint directly:

   ```text
   /api/admin/reports/export
   ```

3. Observe that the export surface is accessible.

**Expected result:**

A Test Subject should not access report export controls.

**Actual result:**

The Test Subject role can access the report export endpoint.

**Triage decision:**

Regression-worthy. Export controls are privileged functionality and should be enforced server-side.

---

### Finding 5 — Audit attachment exposes Director onboarding credentials

**Severity:** High

**Regression-worthy:** Yes

**Preferred automation layer:** API

**Rationale:**

Director credentials are not provided during intake. During the audit, a lower-privileged user was able to discover an audit attachment containing temporary Director credentials. Those credentials remained valid and allowed Director access.

**Steps to reproduce:**

1. Log in using an intake-provided lower-privileged role, such as `Test Subject`.

2. Open the Audit page or call:

   ```text
   /api/admin/audit
   ```

3. Locate the onboarding audit entry for `J. Robertson`.

4. Observe the attachment path:

   ```text
   /assets/audit/onboarding-robertson-20260312.pdf
   ```

5. Open the PDF attachment.

6. Observe that the PDF contains temporary Director credentials.

7. Use the exposed credentials to log in as Director.

8. Confirm that Director-level access is granted.

**Expected result:**

Lower-privileged users should not be able to discover or download credential-bearing internal onboarding attachments. Temporary privileged credentials should also be rotated or invalidated.

**Actual result:**

The audit API exposes an onboarding PDF containing valid Director credentials.

**Triage decision:**

Regression-worthy. This is a privileged credential exposure and direct privilege escalation risk.

---

### Finding 6 — Test Subject can access the legacy console endpoint

**Severity:** High

**Regression-worthy:** Yes

**Preferred automation layer:** API

**Rationale:**

The legacy console is reachable from the legacy chamber surface. Since Test Subject should not access chamber data, it should also not be able to call the legacy console endpoint directly.

**Steps to reproduce:**

1. Log in as `Test Subject`.

2. Call the console endpoint directly:

   ```text
   POST /api/console
   ```

3. Send a basic console command, such as:

   ```text
   help
   ```

4. Observe that the console responds successfully.

**Expected result:**

A Test Subject should not be able to access the legacy console endpoint.

**Actual result:**

The Test Subject role can call the legacy console endpoint directly.

**Triage decision:**

Regression-worthy. UI restrictions alone would not be sufficient; backend access to the console endpoint must also be enforced.

---

### Finding 7 — Undocumented Chief Scientist access recoverable through legacy operator interface

**Severity:** High

**Regression-worthy:** Yes

**Preferred automation layer:** API/UI

**Rationale:**

The legacy interface exposes enough information for a user to reconstruct and authenticate as an undocumented privileged role, granting full access.

**Steps to reproduce:**

1. Open the legacy operator interface.

2. Run:

   ```text
   help
   ```

3. Run:

   ```text
   list operators
   ```

4. Read the archived operator record:

   ```text
   read op-007
   ```

5. Observe that the interface indicates the Halberg record can be restored.

6. Run:

   ```text
   restore halberg
   ```

7. Observe restored Chief Scientist information and the hint referencing:

   ```text
   IFR-71-Q3 §VII
   ```

8. In IFR-71-Q3, reconstruct the PI key from the section designations:

   ```text
   Preamble
   Historical Cycle Background
   Instrument Calibration & Weighting
   Note on Subject S-014
   Evidence Transcript
   Attendance & Sign-off
   Signatory Key Generation
   ```

9. The reconstructed key is:

   ```text
   phineas
   ```

10. Authenticate using:

```text
login halberg phineas
```

11. Observe:

```text
Authentication accepted. Full access granted.
```

12. Confirm the authenticated user:

```text
whoami
```

13. Observe:

```text
P. HALBERG · CHIEF SCIENTIST · SESSION OPEN.
```

**Expected result:**

Undocumented privileged access should not be recoverable through legacy records or unauthenticated/low-privileged console commands.

**Actual result:**

The legacy operator interface exposes a path to recover Chief Scientist access and grants full privileged access.

**Triage decision:**

Regression-worthy. This is a privileged access recovery issue through a legacy surface.

---

### Finding 8 — Session lifecycle accepts invalid state transitions

**Severity:** High

**Regression-worthy:** Yes

**Preferred automation layer:** API

**Rationale:**

The candidate brief states that sessions must follow an orderly lifecycle before outcome data is recorded. The API allows sessions to be completed from invalid states.

**Steps to reproduce:**

1. Log in as Director.

2. Create a new session.

3. Attempt to complete the session directly while it is still:

   ```text
   pending-approval
   ```

4. Approve a new session.

5. Attempt to complete the approved session before starting it.

6. Reject a new session.

7. Attempt to complete the rejected session.

8. Cancel a new session.

9. Attempt to complete the cancelled session.

**Expected result:**

The API should block invalid lifecycle transitions. A session should not be completed unless it has followed the required lifecycle progression.

**Actual result:**

The API allows sessions to be completed from invalid states, including `pending-approval`, `approved`, `rejected`, and `cancelled`.

**Triage decision:**

Regression-worthy. This is a core workflow and data-integrity defect.

---

### Finding 9 — Subjects endpoint returns 500 and prevents subject list access

**Severity:** Medium

**Regression-worthy:** Yes

**Preferred automation layer:** API

**Rationale:**

Subject records are part of the documented operational surface, and the Junior Test Coordinator role is allowed to view subject lists. Returning `500 Internal Server Error` prevents authorized users from accessing subject records and indicates backend instability in a core admin data surface.

**Steps to reproduce:**

1. Log in as `Junior Test Coordinator`.

2. Call the subjects endpoint:

   ```text
   GET /api/admin/subjects
   ```

3. Observe that the request returns:

   ```text
   500 Internal Server Error
   ```

4. Open the Subjects page:

   ```text
   /admin/subjects
   ```

5. Observe that the UI cannot display subject records.

**Expected result:**

The subjects endpoint should return `200 OK` and provide the subject list to authorized roles.

**Actual result:**

The subjects endpoint returns `500 Internal Server Error`, and the Subjects page cannot load subject records.

**Triage decision:**

Regression-worthy. This affects an authorized role’s ability to access a documented subject-record surface and should be covered with API-level regression testing.

---

### Finding 10 — Approval queue is visible to Test Subject

**Severity:** Medium

**Regression-worthy:** No

**Preferred automation layer:** N/A

**Rationale:**

The approval workflow is documented as role-restricted. During testing, the Test Subject role could view the approval queue. However, the observed issue was limited to visibility of approval cards and UI metadata. Higher-risk authorization issues were selected for direct regression coverage first, including dashboard access, chambers access, report export controls, legacy console access, and credential-bearing audit attachment exposure.

**Steps to reproduce:**

1. Log in as `Test Subject`.

2. Open:

   ```text
   /admin/approvals
   ```

3. Observe that approval cards are visible.

4. Observe incomplete requester metadata:

   ```text
   requested by
   ```

5. Observe that approve/reject button labels or hover text may be misleading.

**Expected result:**

The Test Subject role should not see approval queue data.

**Actual result:**

The Test Subject role can view approval queue items.

**Triage decision:**

Valid defect, but not selected for dedicated automated regression coverage. The authorization risk overlaps with broader admin access-control findings that were prioritized for API-level testing, while the metadata and tooltip issues are lower-impact UI defects.

---

### Finding 11 — Test Subject may be able to view sessions outside its own history

**Severity:** Medium

**Regression-worthy:** No

**Preferred automation layer:** N/A

**Rationale:**

The role matrix states that Test Subject should view only its own subject record and session history. During manual testing, the sessions endpoint returned records for multiple `subject_id` values while authenticated as Test Subject. However, the API response does not explicitly expose which subject record belongs to the authenticated Test Subject.

**Steps to reproduce:**

1. Log in as `Test Subject`.

2. Open:

   ```text
   /admin/sessions
   ```

3. Observe a session table containing multiple `subject_id` values and different session states.

**Expected result:**

The Test Subject role should only see its own session history.

**Actual result:**

The sessions endpoint appears to return broader session data than the Test Subject role should need.

**Triage decision:**

Documented as an authorization concern, but not selected for automated regression coverage because the authenticated user-to-subject mapping was not exposed clearly enough to make a precise pass/fail assertion.

---

### Finding 12 — Report exports return incorrect or incomplete data

**Severity:** Medium

**Regression-worthy:** No

**Preferred automation layer:** N/A

**Rationale:**

Report generation is a documented workflow. During manual testing, report exports appeared to return inconsistent data, including legacy data in a current-quarter context and incomplete current-quarter coverage. However, content-level report validation requires a stable source dataset or independent expected-results oracle.

**Steps to reproduce:**

1. Log in as a privileged user.

2. Open:

   ```text
   /admin/reports
   ```

3. Export the available report.

4. Review the exported contents.

5. Observe that the data appears inconsistent with the expected current-quarter report.

**Expected result:**

Reports should export complete, accurate, current-quarter observation data.

**Actual result:**

The exported report appears to contain incorrect or incomplete data.

**Triage decision:**

Valid manual finding, but not selected for content-level automated regression coverage. The suite instead prioritizes report export authorization, which has a clearer and more reliable pass/fail oracle in the assessment environment.

---

### Finding 13 — Public homepage program and subject links return application 404 errors

**Severity:** Low

**Regression-worthy:** Yes, as limited UI smoke coverage

**Preferred automation layer:** UI

**Rationale:**

The public homepage exposes navigation links for program and subject discovery. These links are directly visible to users and should not lead to application-level error pages. Although this is lower risk than authorization and lifecycle defects, it is a simple and stable UI smoke scenario that confirms core public navigation does not break.

**Steps to reproduce:**

1. Open:

   ```text
   https://iris.revelarautomation.com/
   ```

2. Click:

   ```text
   Explore programs
   ```

3. Observe that it routes to:

   ```text
   /programs
   ```

   and displays:

   ```text
   Unexpected Application Error!
   404 Not Found
   ```

4. Return to the homepage.

5. Click:

   ```text
   All programs
   ```

6. Observe that it routes to:

   ```text
   /programs
   ```

   and displays:

   ```text
   Unexpected Application Error!
   404 Not Found
   ```

7. Return to the homepage.

8. Click:

   ```text
   All subjects
   ```

9. Observe that it routes to:

   ```text
   /spotlight
   ```

   and displays:

   ```text
   Unexpected Application Error!
   404 Not Found
   ```

**Expected result:**

Public navigation links should open valid public pages without rendering application-level 404 errors.

**Actual result:**

The homepage links for programs and subjects route to pages that render `Unexpected Application Error!` and `404 Not Found`.

**Triage decision:**

Regression-worthy as limited UI smoke coverage. This is not a high-severity defect, but it is a stable public-facing route check with low automation cost and clear pass/fail criteria.

---

### Finding 14 — Public report links are inactive

**Severity:** Low

**Regression-worthy:** No

**Preferred automation layer:** N/A

**Rationale:**

The public homepage suggests that audited annual reports are available for download, but the report links do not appear to download files or open report assets. This is a valid public-facing issue, but it has lower risk than the selected authorization, privilege, lifecycle, subject availability, and QE Index findings.

**Steps to reproduce:**

1. Open:

   ```text
   https://iris.revelarautomation.com/
   ```

2. Open the homepage reports section.

3. Click public report items.

4. Observe that they do not download files or open report assets.

**Expected result:**

Public report links should open or download the related reports.

**Actual result:**

The report links do not perform a meaningful download or navigation action.

**Triage decision:**

Valid defect, but not selected for automated regression coverage because the selected UI smoke coverage focuses on broken public routes with clearer and more stable assertions.

---

### Finding 15 — Admin global search is not functional

**Severity:** Low

**Regression-worthy:** No

**Preferred automation layer:** N/A

**Rationale:**

The global search bar appears across multiple admin pages, but does not return or filter results. This is a usability issue rather than a high-risk defect.

**Steps to reproduce:**

1. Log in to the admin area.

2. Use the global search bar on the Dashboard page.

3. Search for known subjects, chambers, or sessions.

4. Repeat the same test on:

   ```text
   Subjects
   Chambers
   Sessions
   Approvals
   Reports
   Audit
   ```

5. Observe that the search does not work across pages.

**Expected result:**

The search bar should return or filter matching subjects, chambers, and sessions.

**Actual result:**

The search bar does not perform a functional search.

**Triage decision:**

Valid usability issue, but not selected for automated regression coverage.

---

## Reward Disbursement Notice

A reward disbursement notice was discovered during the legacy interface investigation and is included with this submission.

Included files:

```text
artifacts/reward-disbursement-notice.pdf
artifacts/reward-disbursement-notice.png
```

This item is treated as a required submission artifact rather than a product defect.

---

## Not Included as Defects / Triage Notes

### Potential SQL Injection scanner alert

OWASP ZAP reported a potential SQL Injection issue on the login endpoint. I manually tested Boolean-based payloads and direct API requests against both `role_id` and `password`.

Manual validation did not confirm:

* authentication bypass
* SQL error exposure
* unauthorized access
* meaningful response manipulation

**Decision:** Excluded as a likely false positive.

### Session creation validation concerns

During exploratory testing, the session creation API accepted some questionable inputs, such as old scheduled dates and payloads that did not include apparatus allocation. I did not select these as primary regression findings because the OpenAPI schema for session creation does not expose an apparatus field, and the brief does not define a precise validation rule for past scheduled dates.

**Decision:** Documented as exploratory context, but not selected as a main defect or regression target.

### Session creation UI/API contract

The UI session creation flow appeared to depend on a session ID that was not clearly generated by the frontend. This may indicate a UI/API contract issue, but I did not prioritize it over confirmed lifecycle transition defects.

**Decision:** Not selected for regression coverage.

### Audit log general visibility and filtering

The audit log exposes broad activity and the severity filter appeared unreliable. However, the brief does not explicitly define audit log visibility rules. I therefore prioritized the confirmed credential-bearing attachment exposure rather than treating general audit visibility as the primary defect.

**Decision:** General audit visibility/filtering was triaged lower than the credential attachment exposure.

### Gray subject/heritage images on the homepage

The public homepage contains gray images for subjects and heritage content. I did not include this as a defect because there was not enough evidence that the images were broken rather than intentionally styled placeholders.

**Decision:** Excluded unless the images return failed network requests or broken assets.

### Legacy chamber styling

The legacy chamber uses a different font/style. I did not include this as a defect because the legacy console appears intentionally styled differently.

**Decision:** Excluded as likely intentional design.

---

## Methodology

I approached this assessment as a risk-based QA audit. I first reviewed the candidate brief, role matrix, documented workflows, available credentials, public pages, API documentation, and the Quarterly Enrichment Index requirement. From there, I focused on the areas with the highest potential impact: authorization, privileged access, session lifecycle rules, report/export controls, audit attachment exposure, subject data availability, and QE Index correctness.

My initial testing focused on the provided roles: Test Subject and Junior Test Coordinator. I checked what each role could access through the UI and API, including browser network calls, API responses, cookies, local storage, session storage, and admin routes. This helped identify several authorization issues, such as Test Subject access to admin dashboard data, chamber information, report export controls, and the legacy console path.

I then tested the main documented workflows: creating sessions, approving and rejecting sessions, completing sessions, viewing subject records, and exporting reports. The most important workflow issue was session lifecycle enforcement. The API allowed sessions to be completed from states where completion should not be allowed, including `pending-approval`, `approved` before start, `rejected`, and `cancelled`. I also found that the subject list endpoint returned `500 Internal Server Error` for an authorized role, which prevented access to subject records.

Since the brief allowed exploration beyond the documented workflows, I also reviewed the audit data and the legacy operator console. The audit API exposed an onboarding attachment containing valid Director credentials. The legacy console also exposed a path to restore a Chief Scientist record and authenticate as an undocumented privileged role.

For the QE Index objective, I compared the public homepage value, the authenticated dashboard value, and the legacy methodology records. The homepage displayed `87.4%`, the dashboard displayed `31.0%`, and the legacy IFR-71-Q3 evidence identified `84.7%` as the corrected value. I treated `84.7%` as the correct legacy-adjusted value.

I also used OWASP ZAP as supporting input, but I did not include scanner findings without manual validation. A potential SQL Injection alert was excluded because manual testing did not confirm authentication bypass, SQL error exposure, unauthorized access, or meaningful response manipulation.

Given more time, I would expand authorization coverage across all admin endpoints, add a full session lifecycle transition matrix, define a reliable source of truth for report export validation, and add stable UI coverage for the most important user-facing flows.

---

## Regression Coverage Decision Summary

| Finding                                                                 | Severity |     Regression-worthy | Preferred Layer | Reason                                                                                                                              |
| ----------------------------------------------------------------------- | -------- | --------------------: | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| QE Index mismatch against legacy-corrected value                        | Medium   |                   Yes | API/UI          | The QE Index is a key published metric, and the public, dashboard, and legacy values do not match                                   |
| Test Subject can access admin dashboard metrics                         | High     |                   Yes | API             | A low-privileged user can access operational admin data outside the documented role scope                                           |
| Test Subject can access chambers and legacy chamber details             | High     |                   Yes | API/UI          | Chamber data is an operational surface that should not be available to Test Subject users                                           |
| Test Subject can access report export controls                          | High     |                   Yes | API             | Report exports are privileged functionality and should be blocked server-side for low-privileged users                              |
| Audit attachment exposes Director credentials                           | High     |                   Yes | API             | A lower-privileged user can discover and download an internal document containing valid Director credentials                        |
| Test Subject can access legacy console endpoint                         | High     |                   Yes | API             | The legacy console remains accessible through the backend even though the related chamber surface is restricted                     |
| Chief Scientist access recoverable through legacy console               | High     |                   Yes | API/UI          | The legacy console exposes a path to recover and use an undocumented privileged account                                             |
| Invalid session lifecycle transitions accepted                          | High     |                   Yes | API             | Sessions can be completed without following the required lifecycle, which breaks core workflow integrity                            |
| Subjects endpoint returns 500 and prevents subject list access          | Medium   |                   Yes | API             | An authorized role cannot retrieve subject records because the backend returns an internal server error                             |
| Public homepage program and subject links return application 404 errors | Low      | Yes, limited UI smoke | UI              | Public routes linked from the homepage should not render application-level 404 errors                                               |
| Approval queue visible to Test Subject                                  | Medium   |                    No | N/A             | This is a valid access-control concern, but the selected authorization tests already cover higher-impact restricted surfaces        |
| Test Subject may view sessions outside own history                      | Medium   |                    No | N/A             | The behavior suggests possible overexposure, but the user-to-subject relationship was not clear enough for a precise automated test |
| Report export data appears incorrect/incomplete                         | Medium   |                    No | N/A             | The exported data appears suspicious, but content validation would need a reliable expected dataset                                 |
| Public report links are inactive                                        | Low      |                    No | N/A             | This is a valid public UI issue, but it has lower risk and a less valuable oracle than the selected route-level UI smoke checks     |
| Admin global search not functional                                      | Low      |                    No | N/A             | This is a usability issue with lower business and security impact than the selected regression targets                              |
