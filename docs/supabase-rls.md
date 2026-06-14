# Supabase RLS (Row Level Security) Documentation

**Last Updated**: 2026-06-12

---

## Overview

Mawaeedak uses Supabase Row Level Security (RLS) to enforce data access policies at the database level. This ensures users can only access their own data, and admins have appropriate elevated access.

**Security Principle**: No trust in frontend role checks alone. All data access is enforced server-side.

---

## RLS Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────►│   Supabase      │────►│   PostgreSQL    │
│   (React/Vite)  │     │   (Auth + RLS)  │     │   (RLS Policies)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
   API Request            Auth Check            Policy Check
   with Anon Key          (auth.uid())          (user_id match)
```

---

## Tables and Policies

### 1. user_profiles

**Purpose**: User profile and role information

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users can view own profile | SELECT | `auth.uid() = user_id` |
| Users can update own profile | UPDATE | `auth.uid() = user_id` |
| Admins can view all profiles | SELECT | `role IN ('admin', 'super_admin', 'owner')` |
| Admins can update all profiles | UPDATE | `role IN ('admin', 'super_admin', 'owner')` |

**Triggers**:
- Auto-create profile on user signup (`handle_new_user`)

---

### 2. financial_events

**Purpose**: User financial schedules (salaries, aids, etc.)

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users manage own financial events | ALL | `auth.uid() = user_id` |

**Indexes**:
- `idx_financial_events_user` — For user queries
- `idx_financial_events_type` — For type filtering
- `idx_financial_events_next_date` — For date queries

---

### 3. appointments

**Purpose**: User calendar appointments

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users manage own appointments | ALL | `auth.uid() = user_id` |

---

### 4. trips

**Purpose**: User travel plans

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users manage own trips | ALL | `auth.uid() = user_id` |

---

### 5. complaints

**Purpose**: User feedback and complaints

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can create complaints | INSERT | `auth.uid() IS NULL OR auth.uid() = user_id` |
| Users view own complaints | SELECT | `auth.uid() = user_id OR role IN ('admin', 'super_admin', 'owner')` |
| Admins manage complaints | ALL | `role IN ('admin', 'super_admin', 'owner')` |

---

### 6. notifications

**Purpose**: In-app notifications

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users view own notifications | SELECT | `auth.uid() = user_id` |
| Users manage own notifications | UPDATE/DELETE | `auth.uid() = user_id` |

---

### 7. push_subscriptions

**Purpose**: Web Push notification subscriptions

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users manage own subscriptions | ALL | `auth.uid() = user_id` |

**Indexes**:
- `idx_push_subscriptions_user` — For user queries
- `idx_push_subscriptions_endpoint` — For uniqueness

**Cleanup Function**:
- `cleanup_expired_subscriptions()` — Removes invalid subscriptions

---

### 8. goals

**Purpose**: User goals (financial or non-financial)

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users manage own goals | ALL | `auth.uid() = user_id` |

**Indexes**:
- `idx_goals_user_id` — For user queries
- `idx_goals_completed` — For active goal filtering

---

### 9. cost_projects

**Purpose**: Cost tracking projects

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users manage own projects | ALL | `auth.uid() = user_id` |

---

### 10. cost_items

**Purpose**: Individual items within cost projects

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users manage own items | ALL | `auth.uid() = user_id` |

**Indexes**:
- `idx_cost_items_project_id` — For project queries
- `idx_cost_items_user_id` — For user queries

---

### 11. reminders

**Purpose**: User reminders (Hijri/Gregorian support)

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Users manage own reminders | ALL | `auth.uid() = user_id` |

**Indexes**:
- `idx_reminders_user_id` — For user queries
- `idx_reminders_active` — For active reminder filtering
- `idx_reminders_scheduled` — For scheduled notifications

---

### 12. audit_logs

**Purpose**: Admin action audit trail

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Admins view audit logs | SELECT | `role IN ('admin', 'super_admin', 'owner')` |
| System inserts audit logs | INSERT | `auth.uid() IS NOT NULL` |

---

### 13. system_health_logs

**Purpose**: System health monitoring

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can view health logs | SELECT | `true` |
| Users can insert health logs | INSERT | `auth.uid() IS NOT NULL` |
| Admins can manage health logs | UPDATE | `auth.uid() IS NOT NULL` |

---

### 14. feature_health_logs

**Purpose**: Feature health monitoring

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can view feature logs | SELECT | `true` |
| Users can insert feature logs | INSERT | `auth.uid() IS NOT NULL` |

---

### 15. app_versions

**Purpose**: App version registry

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can view app versions | SELECT | `true` |
| Admins can manage app versions | ALL | `auth.uid() IS NOT NULL` |

---

## Public Tables (No User Restriction)

### official_prayer_times

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can view | SELECT | `true` |

**Note**: Only admins can insert/update this table.

---

### official_financial_dates

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can view | SELECT | `true` |

**Note**: Only admins can insert/update this table.

---

### daily_messages

**RLS Policies**:
| Policy | Action | Condition |
|--------|--------|-----------|
| Anyone can view | SELECT | `true` |

**Note**: Only admins can insert/update this table.

---

## Role Hierarchy

```
owner
  └── super_admin
       └── admin
            └── user
```

**Permissions**:
- **user**: Can only access own data
- **admin**: Can view all users' data, manage complaints
- **super_admin**: Full admin access except owner-only actions
- **owner**: Full access including role management

---

## Security Best Practices

1. **No Frontend Role Trust**: Always enforce permissions server-side
2. **Least Privilege**: Each table has minimum required policies
3. **RLS by Default**: All user tables have RLS enabled
4. **Audit Trail**: Admin actions logged in audit_logs
5. **Secret Protection**: Service role key only in Edge Functions
6. **Input Validation**: Sanitize all user inputs at API level

---

## Testing RLS Policies

### 1. As Regular User

```sql
-- Should only see own data
SELECT * FROM goals WHERE user_id = auth.uid();
```

### 2. As Admin

```sql
-- Should see all data
SELECT * FROM goals;
```

### 3. As Guest

```sql
-- Should fail (unless table allows public access)
SELECT * FROM goals;
```

---

## Troubleshooting RLS Issues

### "Permission denied"

Check:
1. User is authenticated (`auth.uid()` returns valid UUID)
2. Policy condition matches user's data
3. RLS is enabled on the table

### "Unexpected empty results"

Check:
1. Data exists in database
2. User has correct role
3. Policy conditions are correct

### "Insert failed"

Check:
1. User has INSERT policy
2. WITH CHECK condition passes
3. Required fields are provided
