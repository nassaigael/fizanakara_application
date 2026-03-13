# Fizanakara Frontend Restructuring Plan

Full analysis of the backend and frontend has been completed. This plan fixes all bugs, aligns the frontend with the backend API, removes redundancy, translates French to English, and restructures oversized files.

## User Review Required

> [!IMPORTANT]
> **Scope is large**: ~40+ files will be modified. The plan prioritizes correctness (fixing bugs and API mismatches) over the structural proposal in the request (e.g., creating `services/admin/admin.service.ts` directories). The existing flat service structure works well enough and splitting each into its own folder with types/hooks sub-files would create a lot of boilerplate for little gain. I will focus on making everything **work correctly** while cleaning up the code.

> [!WARNING]
> **French → English**: All French comments, toast messages, validation messages, and UI labels will be translated to English. This changes the user-facing text throughout the app. If you want to keep French for the UI (it looks like a Malagasy application), please let me know.

> [!CAUTION]
> **[usePayments.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/usePayments.ts) is broken**: It imports from a non-existent path `../lib/types/models/payment.models.types` and uses a non-existent `PaymentModel` type. This file will be deleted (its functionality is already duplicated in [useFinance.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useFinance.ts)).

---

## Backend API Reference (Read-Only)

| Controller | Prefix | Key Endpoints |
|---|---|---|
| [AdminsAuthController](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/api/src/main/java/mg/fizanakara/api/controllers/AdminsAuthController.java#30-198) | *(none)* | `POST /login`, `POST /register`, `POST /refresh`, `POST /forgot-password`, `POST /reset-password`, `GET /admins/me`, `PATCH /admins/me`, `GET /admins/all`, `DELETE /{id}` |
| [DistrictController](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/api/src/main/java/mg/fizanakara/api/controllers/DistrictController.java#17-76) | `/api/admins/districts` | CRUD + `DELETE /delete-all` |
| [TributeController](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/api/src/main/java/mg/fizanakara/api/controllers/TributeController.java#17-76) | `/api/admins/tributes` | CRUD + `DELETE /delete-all` |
| [PersonController](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/api/src/main/java/mg/fizanakara/api/controllers/PersonController.java#17-91) | `/api/admins/persons` | CRUD + `POST /{id}/promote` + children endpoints + `DELETE /delete-all` |
| [ContributionController](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/api/src/main/java/mg/fizanakara/api/controllers/ContributionController.java#20-71) | `/api/admins/contributions` | CRUD + `GET /person/{personId}/year/{year}` |
| [PaymentController](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/api/src/main/java/mg/fizanakara/api/controllers/PaymentController.java#16-56) | `/api/admins/payments` | CRUD + `GET /contribution/{contributionId}` |
| [HealthController](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/api/src/main/java/mg/fizanakara/api/controllers/HealthController.java#9-29) | *(none)* | `GET /health`, `GET /keep-alive` |

**Public routes** (no JWT): `/login`, `/forgot-password`, `/reset-password`, `/keep-alive`, `/health`

---

## Proposed Changes

### Critical Bug Fixes

#### [MODIFY] [auth.service.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/auth.service.ts)
- Fix [forgotPassword](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/auth.service.ts#21-24): `/api/forgot-password` → `/forgot-password`
- Fix [resetPassword](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/auth.service.ts#25-28): `/api/reset-password` → `/reset-password`

#### [MODIFY] [admin.services.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/admin.services.ts)
- Remove the pointless endpoint fallback loop in [create()](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/district.services.ts#15-19) — just call `/register`
- Remove all debug `console.log` calls and French comments

#### [DELETE] [usePayments.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/usePayments.ts)
- Broken import (`PaymentModel` does not exist). Functionality already exists in [useFinance.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useFinance.ts)

#### [MODIFY] [useAuth.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useAuth.ts)
- This entire file duplicates [AuthContext.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/context/AuthContext.tsx). Will be replaced to simply re-export from context
- Export `{ useAuth }` from `../context/AuthContext` for backward compatibility

---

### Types & Validators

#### [MODIFY] [index.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/types/index.ts)
- Remove duplicate [UpdateAdminRequest](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/types/index.ts#117-128) definition (lines 217-227 duplicate lines 117-127)
- Remove `AdminResponse.districtId` and `AdminResponse.tributeId` (not in backend [AdminResponseDto](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/api/src/main/java/mg/fizanakara/api/dto/admins/AdminResponseDto.java#10-42))
- Remove `ContributionResponse.isFullyPaid` and `ContributionResponse.paymentsCount` (not in backend DTO)
- Fix `LoginResponse.user` field names: backend returns `firstname`/`lastname` (lowercase). Actually, looking at the controller more carefully, the Map.of uses `"firstname"` with lowercase — need to match
- Remove [PersonResponse](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/types/index.ts#79-90) extending [PersonDto](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/types/index.ts#72-78) (response has different shape than input)
- Fix `PersonBase.imageUrl` — backend requires `@NotBlank` so it should not be optional
- Translate French comments to English

#### [MODIFY] [admin.validator.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/validators/admin.validator.ts)
- Translate French validation messages to English
- Make `imageUrl` required (matches backend `@NotBlank`)

#### [MODIFY] [finance.validator.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/validators/finance.validator.ts)
- Fix field names: `amountPayed` → `amountPaid`, `paymentStatus` → `status`
- Fix `contributionStatus` → `status` in `updateContributionSchema`
- Translate French messages to English

#### [MODIFY] [location.validator.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/validators/location.validator.ts)
- Translate French messages to English

#### [MODIFY] [member.validator.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/validators/member.validator.ts)
- Translate French messages to English

---

### Services Cleanup

#### [MODIFY] [axios.config.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/api/axios.config.ts)
- Remove all `console.log` / `console.error` debug logging
- Translate French comments to English
- Keep existing PUBLIC_ROUTES (they correctly match backend SecurityConfig)

#### [MODIFY] [district.services.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/district.services.ts)
- URLs are correct ✓ — no changes needed except removing any French comments

#### [MODIFY] [tribute.services.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/tribute.services.ts)
- URLs are correct ✓

#### [MODIFY] [member.services.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/member.services.ts)
- URLs are correct ✓

#### [MODIFY] [contribution.services.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/contribution.services.ts)
- URLs are correct ✓

#### [MODIFY] [payment.services.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/payment.services.ts)
- URLs are correct ✓

---

### Hooks Cleanup

#### [MODIFY] [useAdmin.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useAdmin.ts)
- Remove debug `console.log`/`console.error` calls
- Translate French toast messages to English
- Remove [getApiErrorMessage](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/helper/index.ts#214-230) import if unused after cleanup

#### [MODIFY] [useDistrict.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useDistrict.ts)
- Translate French toast messages to English

#### [MODIFY] [useTribute.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useTribute.ts)
- Translate French toast messages to English

#### [MODIFY] [useMembers.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useMembers.ts)
- Translate French toast messages to English

#### [MODIFY] [useFinance.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useFinance.ts)
- Translate French toast messages and comments to English

#### [MODIFY] [useForm.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useForm.ts)
- Translate French comments to English

---

### Pages Restructuring

#### [MODIFY] [Management.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Management.tsx) (686 lines → ~300)
- Extract [AdminsTab](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Management.tsx#291-385) into `components/superadmin/management/AdminsTab.tsx`
- Extract [LocationTab](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Management.tsx#395-466) into `components/superadmin/management/LocationTab.tsx`
- Extract [AdminModal](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Management.tsx#473-611) into `components/superadmin/management/AdminModal.tsx`
- Extract [LocationModal](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Management.tsx#620-685) into `components/superadmin/management/LocationModal.tsx`
- Translate all French text to English

#### [MODIFY] [Profile.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Profile.tsx) (386 lines → ~150)
- Extract [PasswordModal](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Profile.tsx#335-385) into `components/superadmin/profile/PasswordModal.tsx`
- Extract [InfoItem](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Profile.tsx#38-49) and [StatCard](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Dashboard.tsx#29-58) into shared components
- Translate all French text to English

#### [DELETE] [LocalisationManagement.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/LocalisationManagement.tsx)
- This page duplicates the districts/tributes tabs already in [Management.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Management.tsx)
- It is not referenced in the router ([App.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/routes/App.tsx)) so it's dead code

#### [MODIFY] [Dashboard.tsx (superadmin)](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Dashboard.tsx)
- Translate French text to English

#### [MODIFY] [Dashboard.tsx (admin)](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/admin/Dashboard.tsx)
- Replace inline SVG [AiOutlineCheckCircle](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/admin/Dashboard.tsx#226-240) with proper react-icons import
- Translate French text to English

#### [MODIFY] [Members.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/admin/Members.tsx)
- Translate French text to English

#### [MODIFY] [Finance.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/admin/Finance.tsx)
- Translate French text to English

#### [MODIFY] [Profile.tsx (admin)](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/admin/Profile.tsx)
- Translate French text to English

#### Auth pages: [Login.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/auth/Login.tsx), [ForgotPassword.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/auth/ForgotPassword.tsx), [ResetPassword.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/auth/ResetPassword.tsx)
- Translate French text to English

---

### Helpers & Constants

#### [MODIFY] [helper/index.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/helper/index.ts)
- Translate French comments and labels to English
- Translate French error messages to English

#### [MODIFY] [constant/constant.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/constant/constant.ts)
- Translate French labels (COTISATION_UI, SITUATIONS) to English

#### [MODIFY] [AuthContext.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/context/AuthContext.tsx)
- Translate French toast messages and comments to English
- Fix login response field mapping: `response.user.firstname` → needs proper mapping since backend sends lowercase keys

---

### Files to Delete

| File | Reason |
|---|---|
| [hooks/usePayments.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/usePayments.ts) | Broken import, duplicates [useFinance.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useFinance.ts) |
| [pages/superadmin/LocalisationManagement.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/LocalisationManagement.tsx) | Dead code, not in router, duplicates [Management.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Management.tsx) |
| [client/src/debug.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/debug.ts) | Debug file |
| Various [README.md](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/README.md) files in subdirectories | Cleanup ([components/README.md](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/components/README.md), [hooks/README.md](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/README.md), etc.) |

---

## Verification Plan

### Automated Tests

1. **TypeScript compilation check**:
```bash
cd /home/mekill404/Dev/projet/react_project/fizanakara_application/client && npx tsc --noEmit
```
This checks all TypeScript types without producing output. Must pass with zero errors.

2. **Vite production build**:
```bash
cd /home/mekill404/Dev/projet/react_project/fizanakara_application/client && npm run build
```
Verifies all imports resolve, no build errors.

### Manual Verification
- After making all changes, the user should start the dev server (`npm run dev`) and verify:
  1. Login page loads correctly
  2. Login succeeds and redirects to the correct dashboard
  3. SuperAdmin can navigate to Management, create/delete admins/districts/tributes
  4. Admin can view Dashboard, Members, Finance pages
  5. Profile page loads and edit form works
