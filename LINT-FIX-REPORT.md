# Lint and Format Fix Report

## Issues Found

### 1. Formatting Issues (3 files)
```
packages/react-aria-components/stories/PreviewTrigger-NestedOverlay.example.tsx
packages/react-aria-components/test/PreviewTrigger.test.js
packages/react-aria/src/tooltip/useSafeArea.ts
```

### 2. Linting Warning
```
⚠ eslint(max-depth): Blocks are nested too deeply (5). Maximum allowed is 4.
Location: packages/react-aria/src/tooltip/useSafeArea.ts:117:11
```

## Fixes Applied

### Fix 1: Run Formatter
```bash
yarn format
```
✅ All 3 files formatted automatically

### Fix 2: Reduce Nesting Depth

**File:** `packages/react-aria/src/tooltip/useSafeArea.ts`

**Problem:** The nested if statements inside the for loop created 5 levels of nesting (max allowed: 4)

**Previous Code (5 levels):**
```typescript
if (overlayElement) {                                    // Level 2
  let allPopovers = document.querySelectorAll('.react-aria-Popover');
  for (let popover of allPopovers) {                     // Level 3
    if (popover === overlayElement) {
      continue;
    }
    
    let popoverRect = popover.getBoundingClientRect();
    if (popoverRect.width > 0 && popoverRect.height > 0 && rectContains(popoverRect, point)) { // Level 4
      let popoverId = popover.id;
      if (popoverId) {                                   // Level 5 ⚠️
        let trigger = overlayElement.querySelector(`[aria-controls="${popoverId}"]`);
        if (trigger) {                                   // Level 6 ⚠️⚠️
          return true;
        }
      }
    }
  }
}
```

**Refactored Code (4 levels max):**
```typescript
if (overlayElement) {                                    // Level 2
  let allPopovers = document.querySelectorAll('.react-aria-Popover');
  for (let popover of allPopovers) {                     // Level 3
    // Skip the current overlay itself (already checked above)
    if (popover === overlayElement) {
      continue;
    }

    let popoverRect = popover.getBoundingClientRect();
    // Check if this popover is visible and contains the pointer
    let isVisible = popoverRect.width > 0 && popoverRect.height > 0;
    if (!isVisible || !rectContains(popoverRect, point)) {
      continue;  // ✅ Early exit reduces nesting
    }

    // Check if this popover was triggered from within the parent overlay
    let popoverId = popover.id;
    if (!popoverId) {
      continue;  // ✅ Early exit reduces nesting
    }

    let trigger = overlayElement.querySelector(`[aria-controls="${popoverId}"]`);
    if (trigger) {                                       // Level 4 ✅
      return true;
    }
  }
}
```

## Refactoring Strategy

Used **guard clauses** (early returns/continues) to flatten the nesting:

1. **Combined condition check:**
   - Extracted `isVisible` variable
   - Used inverted condition with early `continue`

2. **Early exits:**
   - Changed `if (popoverId)` to `if (!popoverId) continue`
   - This eliminates one nesting level

3. **Preserved logic:**
   - Same behavior as before
   - All checks still performed in correct order
   - No functional changes

## Benefits of Refactoring

✅ **Compliance:** Max depth now 4 (was 5-6)  
✅ **Readability:** Clearer flow with guard clauses  
✅ **Maintainability:** Less indentation, easier to follow  
✅ **Performance:** Same (no overhead added)  

## Verification

### Nesting Level Count

**Before:**
- Function → if → for → if → if → if = **6 levels** ❌

**After:**
- Function → if → for → if = **4 levels** ✅

### Logic Verification

Both versions execute the same checks:
1. ✅ Skip if popover is the current overlay
2. ✅ Skip if popover is not visible or doesn't contain point
3. ✅ Skip if popover has no ID
4. ✅ Return true if trigger with aria-controls is found

### Commands to Verify Fix

```bash
# Format check
yarn format:check

# Lint check
yarn lint

# Or specifically:
oxlint packages/react-aria/src/tooltip/useSafeArea.ts
```

## Summary

**Files Modified:**
1. `packages/react-aria-components/stories/PreviewTrigger-NestedOverlay.example.tsx` - Auto-formatted
2. `packages/react-aria-components/test/PreviewTrigger.test.js` - Auto-formatted
3. `packages/react-aria/src/tooltip/useSafeArea.ts` - Refactored + auto-formatted

**Issues Resolved:**
- ✅ Formatting issues in 3 files
- ✅ Max-depth linting warning (reduced from 5/6 to 4)

**Behavior:**
- ✅ No functional changes
- ✅ Same test coverage
- ✅ Same performance characteristics
