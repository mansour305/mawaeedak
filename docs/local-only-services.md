# Local-Only Services Documentation

**Last Updated**: 2026-06-12

---

## Overview

Some features in Mawaeedak currently store data locally (browser localStorage) rather than syncing to Supabase cloud. This document explains the current state, limitations, and sync path.

**UI Indicator**: Services that store locally show the banner: "💾 ملاحظة: محفوظ على هذا الجهاز فقط"

---

## Current Local-Only Services

### 1. Goals (احسب هدفك)

**Page**: `/services/goals`
**Storage Key**: `mawaeedak_goals_v1`
**File**: `artifacts/mawaeedak/src/features/services/GoalsPage.tsx`

**Data Structure**:
```typescript
interface Goal {
  id: string;
  name: string;
  type: "financial" | "non-financial";
  targetAmount: number | null;
  requirements: string;
  currentProgress: number;
  deadline: string | null;
  createdAt: string;
  completedAt: string | null;
}
```

**Limitations**:
- ❌ Data not synced across devices
- ❌ Data lost on browser cache clear
- ❌ No cloud backup
- ❌ No offline access on other devices

**Cloud Sync Status**:
- ✅ Supabase schema created (`goals` table)
- ✅ RLS policies defined
- ⏳ Sync integration pending

---

### 2. Cost Projects (حساب التكاليف)

**Page**: `/services/costs`
**Storage Key**: `mawaeedak_cost_projects_v1`
**File**: `artifacts/mawaeedak/src/features/services/CostsPage.tsx`

**Data Structure**:
```typescript
interface CostProject {
  id: string;
  name: string;
  items: CostItem[];
  createdAt: string;
  updatedAt: string;
}

interface CostItem {
  id: string;
  name: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "partial" | "fully_paid" | "scheduled";
  scheduledDate: string | null;
  notes: string;
  createdAt: string;
}
```

**Limitations**:
- ❌ Data not synced across devices
- ❌ Data lost on browser cache clear
- ❌ No cloud backup
- ❌ No export/import between devices

**Cloud Sync Status**:
- ✅ Supabase schema created (`cost_projects`, `cost_items` tables)
- ✅ RLS policies defined
- ⏳ Sync integration pending

---

### 3. Reminders (ذكرني)

**Page**: `/services/reminders`
**Storage Key**: `mawaeedak_reminders_v1`
**File**: `artifacts/mawaeedak/src/features/services/RemindersPage.tsx`

**Data Structure**:
```typescript
interface Reminder {
  id: string;
  title: string;
  dateType: "hijri" | "gregorian";
  date: string;
  time: string;
  remindBeforeValue: number;
  remindBeforeUnit: "minutes" | "hours" | "days";
  note: string;
  isActive: boolean;
  createdAt: string;
}
```

**Limitations**:
- ❌ Data not synced across devices
- ❌ Push notifications require deployment setup
- ❌ In-app notifications only (for now)

**Cloud Sync Status**:
- ✅ Supabase schema created (`reminders` table)
- ✅ RLS policies defined
- ⏳ Sync integration pending
- ⏳ Push notification deployment required

---

## Cloud-Synced Services

### Services with Supabase Sync

| Service | Status | Notes |
|---------|--------|-------|
| User Profile | ✅ Synced | Auto-created on signup |
| Financial Events | ✅ Synced | Salaries, aids, etc. |
| Appointments | ✅ Synced | Calendar events |
| Complaints | ✅ Synced | Supports guest submission |
| Notifications | ✅ Synced | In-app notifications |
| Daily Messages | ✅ Synced | Read-only for users |
| Official Prayer Times | ✅ Synced | Admin-managed |
| Push Subscriptions | ✅ Synced | Web Push setup |

---

## Local-to-Cloud Migration Path

### When User Logs In

```typescript
// Pseudocode for migration flow
async function migrateLocalToCloud(userId: string) {
  // 1. Check for local data
  const localGoals = loadGoalsFromLocalStorage();
  const localProjects = loadCostProjectsFromLocalStorage();
  const localReminders = loadRemindersFromLocalStorage();
  
  // 2. If user is logged in and cloud is available
  if (userId && isSupabaseEnabled) {
    // 3. Push local data to cloud
    for (const goal of localGoals) {
      await supabase.from('goals').upsert({ ...goal, user_id: userId });
    }
    
    // 4. Keep local copy as backup
    // (Or remove if sync is confirmed)
  }
}
```

### Implementation Status

- [ ] Migration trigger on login
- [ ] Conflict resolution strategy
- [ ] Progress indicator
- [ ] Error handling and retry
- [ ] Confirmation dialog

---

## Future Sync Implementation

### Phase 1: Basic Sync
- Save new data to Supabase when logged in
- Load from Supabase when available
- Keep localStorage as fallback

### Phase 2: Bidirectional Sync
- Sync changes in both directions
- Handle conflicts gracefully
- Real-time updates

### Phase 3: Offline Support
- Queue changes when offline
- Sync when connection restored
- Conflict resolution UI

---

## User Communication

### Current UI Banners

**Goals**:
> 💾 ملاحظة: محفوظ على هذا الجهاز فقط. المزامنة مع السحابة قادمة قريباً.

**Costs**:
> 💾 ملاحظة: محفوظ على هذا الجهاز فقط. المزامنة مع السحابة قادمة قريباً.

**Reminders**:
> 💾 ملاحظة: محفوظ على هذا الجهاز فقط. الإشعارات الداخلية فقط حالياً. إعداد الإشعارات الفورية قيد التطوير.

---

## Migration Strategy

### For New Users
1. Create account → Cloud storage from start
2. LocalStorage not used for primary data

### For Existing Users
1. Detect localStorage data on login
2. Show migration prompt: "هل تريد نقل بياناتك للسحابة؟"
3. If yes: Migrate data to Supabase
4. If no: Keep localStorage, sync new data only

### For Guest Users
1. Use localStorage freely
2. On signup: Prompt to migrate
3. On login: Sync with existing cloud data

---

## Technical Details

### Storage Keys

| Service | localStorage Key | Version |
|---------|------------------|---------|
| Goals | `mawaeedak_goals_v1` | 1 |
| Costs | `mawaeedak_cost_projects_v1` | 1 |
| Reminders | `mawaeedak_reminders_v1` | 1 |

### Data Format

All localStorage data is stored as JSON strings:
```json
// Example: Goals
[
  {
    "id": "goal_1234567890_abc123",
    "name": "شراء سيارة",
    "type": "financial",
    "targetAmount": 100000,
    "currentProgress": 25000,
    "deadline": "2026-12-31",
    "createdAt": "2026-06-12T00:00:00.000Z",
    "completedAt": null
  }
]
```

### Cleanup Strategy

When migrating to cloud:
1. Keep localStorage for 7 days as backup
2. Show confirmation that data is synced
3. Clear localStorage after confirmation
4. If errors, restore from localStorage

---

## Backup Recommendations

### For Users (Before Clearing Browser Data)

1. **Export Data**:
   - Navigate to each service (Goals, Costs, Reminders)
   - Copy the displayed data
   - Save to a safe location

2. **Take Screenshots**:
   - Screenshot of each service page
   - Include all important data

3. **Account Sync**:
   - Log in to sync data to cloud
   - Data will be available after re-login

---

## Status Summary

| Feature | Local Only | Cloud Sync | Migration Ready |
|---------|-----------|------------|-----------------|
| Goals | ✅ Yes | ⏳ Pending | ⏳ Pending |
| Costs | ✅ Yes | ⏳ Pending | ⏳ Pending |
| Reminders | ✅ Yes | ⏳ Pending | ⏳ Pending |
| Financial Events | ❌ No | ✅ Done | ✅ Done |
| Appointments | ❌ No | ✅ Done | ✅ Done |
| Complaints | ❌ No | ✅ Done | ✅ Done |

---

## Next Steps

1. **Implement sync hook** for Goals, Costs, Reminders
2. **Add migration prompt UI** on login
3. **Add export functionality** for backup
4. **Implement conflict resolution** for duplicates
5. **Add sync status indicator** in UI
