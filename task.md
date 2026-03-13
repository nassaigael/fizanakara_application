# Fizanakara Frontend Restructuring

## Phase 1: Analysis (Complete)
- [x] Analyze backend controllers, DTOs, enums, models, SecurityConfig
- [x] Analyze frontend services, hooks, types, pages, validators, helpers
- [x] Identify all issues and mismatches

## Phase 2: Planning
- [/] Write implementation plan with all corrections and file changes
- [ ] Get user approval on implementation plan

## Phase 3: Critical Bug Fixes
- [ ] Fix URL mismatches in [auth.service.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/auth.service.ts) (`/api/forgot-password` → `/forgot-password`, `/api/reset-password` → `/reset-password`)
- [ ] Fix broken import in [usePayments.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/usePayments.ts) (references non-existent `PaymentModel` type)
- [ ] Remove duplicate [UpdateAdminRequest](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/types/index.ts#217-228) type in [lib/types/index.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/types/index.ts)
- [ ] Remove duplicate [useAuth](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/context/AuthContext.tsx#170-175) hook in [hooks/useAuth.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useAuth.ts) (keep only [context/AuthContext.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/context/AuthContext.tsx))
- [ ] Fix `LoginResponse.user` field mapping (`firstname` → `firstName`)
- [ ] Fix [finance.validator.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/lib/validators/finance.validator.ts) field names (`amountPayed` → `amountPaid`, `paymentStatus` → `status`)

## Phase 4: Service Layer Restructuring
- [ ] Clean up [axios.config.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/api/axios.config.ts) (remove French comments, debug console.logs)
- [ ] Clean up [admin.services.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/services/admin.services.ts) (remove endpoint fallback loop, fix delete URL)
- [ ] Clean up all services (remove console.logs, French comments)

## Phase 5: Hooks Restructuring
- [ ] Remove duplicate [usePayments.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/usePayments.ts) (functionality already in [useFinance.ts](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/hooks/useFinance.ts))
- [ ] Translate all French toast messages to English in hooks
- [ ] Remove debug console.logs from hooks

## Phase 6: Types & Validators
- [ ] Clean duplicate types, remove `ContributionResponse.isFullyPaid`, `ContributionResponse.paymentsCount` (not in backend DTO)
- [ ] Update Zod validators to match backend DTOs exactly
- [ ] Translate French validation messages to English

## Phase 7: Pages Restructuring
- [ ] Break up [Management.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/Management.tsx) (686 lines) into smaller components
- [ ] Break up [Profile.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/admin/Profile.tsx) (386 lines) into smaller components
- [ ] Translate all French UI text to English
- [ ] Remove [LocalisationManagement.tsx](file:///home/mekill404/Dev/projet/react_project/fizanakara_application/client/src/pages/superadmin/LocalisationManagement.tsx) (duplicates Management tab)

## Phase 8: Component Cleanup
- [ ] Extract reusable Modal component from inline modals
- [ ] Clean up admin Dashboard.tsx duplicate SVG icon

## Phase 9: Helpers & Constants Cleanup
- [ ] Translate French helper labels to English
- [ ] Clean up duplicate theme definitions (styles/theme.ts vs lib/constant/constant.ts)

## Phase 10: Verification
- [ ] Run `tsc` build to verify zero TypeScript errors
- [ ] Run `vite build` to verify production build
- [ ] Verify all services match backend endpoints

## Phase 11: Documentation
- [ ] Create comprehensive README.md
- [ ] Write analysis report / walkthrough
