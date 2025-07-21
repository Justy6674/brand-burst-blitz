---
# 🗃️ FILED TODO - NO LONGER ACTIVE
**STATUS**: ✅ COMPLETED & FILED
**DATE FILED**: 2025-01-24
**ACTIVE TODO**: `PRODUCTION_READINESS_GAP_ANALYSIS_TODO.md`
**FILED IN**: `_FILED_TODOS_INDEX.md`
---
🗃️ **FILED - COMPLETED**
**FILED DATE**: 2024-01-XX
**REASON**: Healthcare Blog Embed Wizard completed - supersedes this generic blog wizard
**STATUS**: Replaced by HealthcareBlogEmbedWizard.tsx with full AHPRA compliance
**NEW IMPLEMENTATION**: src/components/blog/HealthcareBlogEmbedWizard.tsx

---

# Smart Blog Integration Wizard - Rebuild Todo

## 🚨 CRITICAL ISSUE
Current system shows ALL integration options to ALL users - completely broken UX that misleads users.

## 🎯 REBUILD OBJECTIVE
Create platform-aware wizard that ONLY shows what actually works for each platform.

---

## 📋 REBUILD STEPS

### 1. Platform Detection Component
**File**: `src/components/blog/PlatformDetector.tsx`
- Dropdown with all major platforms
- Platform capability mapping (embed vs copy-paste only)
- Auto-hide incompatible options

### 2. Platform Capability Matrix
**File**: `src/lib/platformCapabilities.ts`
```typescript
PLATFORM_CAPABILITIES = {
  'wordpress': { embed: true, api: true, copyPaste: true },
  'godaddy': { embed: false, api: false, copyPaste: true },
  'shopify': { embed: false, api: false, copyPaste: true },
  // etc...
}
```

### 3. Smart Integration Options
**File**: `src/components/blog/SmartIntegrationOptions.tsx`
- Shows ONLY compatible options based on selected platform
- Clear explanations WHY certain options aren't available
- Platform-specific instructions

### 4. Manual Export Tools (for locked platforms)
**File**: `src/components/blog/ManualExportTools.tsx`
- Copy HTML button
- Download images button  
- Copy SEO metadata
- Step-by-step platform guides

### 5. Platform-Specific Instructions
**File**: `src/components/blog/PlatformInstructions.tsx`
- Visual guides with screenshots
- Copy buttons for each step
- Platform-specific tips

---

## 🔧 DEV IMPLEMENTATION

### Phase 1: Core Logic (30 mins)
1. Create platform capabilities mapping
2. Build platform detector dropdown
3. Add conditional rendering logic

### Phase 2: Smart Options (45 mins)
1. Rebuild integration options component
2. Add platform-aware conditional display
3. Add clear "why not available" messaging

### Phase 3: Manual Tools (30 mins)
1. Build copy/paste export tools
2. Add download functionality
3. Create platform instruction components

### Phase 4: Replace Current System (15 mins)
1. Remove misleading components
2. Replace with smart wizard
3. Update routing/navigation

---

## 🧪 USER TESTING SCENARIOS

### Scenario A: WordPress User
- Sees: Embed, API, RSS, Manual options
- Gets: Working embed code + API instructions

### Scenario B: GoDaddy User  
- Sees: ONLY manual export options
- Gets: Clear explanation why embeds don't work
- Gets: Copy HTML + download images tools

### Scenario C: Shopify User
- Sees: Manual export + clear API limitations
- Gets: Copy/paste tools optimized for Shopify blog editor

---

## ⚡ IMMEDIATE ACTIONS NEEDED

1. **DELETE** current misleading `BlogIntegrationWizard`
2. **CREATE** platform-aware replacement
3. **TEST** with each platform type
4. **VERIFY** no false promises made

---

## 📊 SUCCESS METRICS

- ✅ Users never see integration options they can't use
- ✅ Clear explanation for platform limitations  
- ✅ Working copy/paste fallback for all platforms
- ✅ No confused support tickets about "broken" integrations

---

**PRIORITY**: CRITICAL - Current system actively damages user trust
**TIMELINE**: 2 hours max
**RISK**: High - Users abandoning due to false promises
