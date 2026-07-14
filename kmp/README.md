# DND Book — Kotlin Multiplatform

KMP rewrite of the Expo React Native app (`mobile/`).

## Plan documents

| Document | Contents |
|----------|---------|
| [`../KMP_CONVERSION_PLAN.md`](../KMP_CONVERSION_PLAN.md) | Architecture decisions, module layout, schema, sync design, phased delivery |
| [`../KMP_PARITY_CHECKLIST.md`](../KMP_PARITY_CHECKLIST.md) | Screen-by-screen acceptance criteria |
| [`../UI_REVAMP_GAPS.md`](../UI_REVAMP_GAPS.md) | UI/UX improvements over the Expo app |

## Build

```bash
# From kmp/
./gradlew :androidApp:assembleDebug
```

Requirements: JDK 17+, Android SDK with API 26+ and latest build tools.

iOS: open `iosApp/` in Xcode 15+ on macOS. Requires a Mac; cannot be compiled on Windows.
