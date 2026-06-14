/**
 * goalsGateway.ts — Phase 16 Production Hardening
 *
 * Unified data gateway for Goals.
 * - Supabase sync when user is logged in
 * - LocalStorage fallback for guests only
 * - Cloud failures are reported as failures, not silently converted to local success
 *
 * Schema: supabase/migrations/20250612000002_create_services_tables.sql
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, isSupabaseEnabled } from "../supabase";
import { isSupabaseMode } from "../dataSourceMode";

export type GoalType = "financial" | "non-financial";

export type Goal = {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number | null;
  requirements: string;
  currentProgress: number;
  deadline: string | null;
  createdAt: string;
  completedAt: string | null;
};

type GoalRow = {
  id: string;
  user_id: string;
  name: string;
  type: GoalType;
  target_amount: number | null;
  requirements: string | null;
  current_progress: number | null;
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
};

const GOALS_STORAGE_KEY = "mawaeedak_goals_v1";

type GoalsState = {
  goals: Goal[];
  isLoading: boolean;
  isError: boolean;
  isSynced: boolean;
};

function generateId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function loadLocalGoals(): Goal[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalGoals(goals: Goal[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // localStorage can fail in private mode or storage quota limits.
  }
}

function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    targetAmount: row.target_amount,
    requirements: row.requirements ?? "",
    currentProgress: Number(row.current_progress ?? 0),
    deadline: row.deadline,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

function toGoalInsert(goal: Omit<Goal, "id" | "createdAt" | "completedAt">, userId: string): Record<string, unknown> {
  return {
    user_id: userId,
    name: goal.name.trim(),
    type: goal.type,
    target_amount: goal.targetAmount,
    requirements: goal.requirements?.trim() || null,
    current_progress: goal.currentProgress,
    deadline: goal.deadline || null,
    completed_at: null,
  };
}

function toGoalUpdate(goal: Goal): Record<string, unknown> {
  return {
    name: goal.name.trim(),
    type: goal.type,
    target_amount: goal.targetAmount,
    requirements: goal.requirements?.trim() || null,
    current_progress: goal.currentProgress,
    deadline: goal.deadline || null,
    completed_at: goal.completedAt,
  };
}

function assertValidGoalInput(goal: Omit<Goal, "id" | "createdAt" | "completedAt"> | Goal): void {
  const name = goal.name.trim();
  if (!name) throw new Error("الرجاء إدخال اسم الهدف");

  if (goal.type === "financial") {
    if (goal.targetAmount === null || !Number.isFinite(goal.targetAmount) || goal.targetAmount <= 0) {
      throw new Error("المبلغ المستهدف يجب أن يكون أكبر من صفر");
    }
  }

  if (!Number.isFinite(goal.currentProgress) || goal.currentProgress < 0) {
    throw new Error("التقدم الحالي يجب أن يكون رقماً صحيحاً لا يقل عن صفر");
  }
}

function assertValidProgress(progress: number): void {
  if (!Number.isFinite(progress) || progress < 0) {
    throw new Error("التقدم الحالي يجب أن يكون رقماً صحيحاً لا يقل عن صفر");
  }
}

async function getCloudUserId(): Promise<string | null> {
  if (!isSupabaseEnabled || !supabase || !isSupabaseMode) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user?.id ?? null;
}

export function useGoalsGateway() {
  const userIdRef = useRef<string | null>(null);
  const [state, setState] = useState<GoalsState>({
    goals: [],
    isLoading: true,
    isError: false,
    isSynced: false,
  });

  const setGoals = useCallback((updater: Goal[] | ((goals: Goal[]) => Goal[]), persistLocal: boolean) => {
    setState((current) => {
      const nextGoals = typeof updater === "function" ? updater(current.goals) : updater;
      if (persistLocal) saveLocalGoals(nextGoals);
      return { ...current, goals: nextGoals };
    });
  }, []);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, isError: false }));

    try {
      const userId = await getCloudUserId();

      if (userId && supabase) {
        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        userIdRef.current = userId;
        setState({
          goals: (data ?? []).map((row) => toGoal(row as GoalRow)),
          isLoading: false,
          isError: false,
          isSynced: true,
        });
        return;
      }

      userIdRef.current = null;
      setState({
        goals: loadLocalGoals(),
        isLoading: false,
        isError: false,
        isSynced: false,
      });
    } catch (error) {
      console.error("[GoalsGateway] Load error:", error);
      userIdRef.current = null;
      setState({
        goals: [],
        isLoading: false,
        isError: true,
        isSynced: false,
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const add = useCallback(async (goalData: Omit<Goal, "id" | "createdAt" | "completedAt">): Promise<Goal | null> => {
    assertValidGoalInput(goalData);

    const userId = userIdRef.current;

    if (state.isSynced) {
      if (!userId || !supabase) {
        throw new Error("تعذر حفظ الهدف في السحابة: جلسة المستخدم غير متاحة");
      }

      const { data, error } = await supabase
        .from("goals")
        .insert(toGoalInsert(goalData, userId))
        .select("*")
        .single();

      if (error) {
        console.error("[GoalsGateway] Add cloud error:", error);
        setState((current) => ({ ...current, isError: true }));
        throw new Error("فشل حفظ الهدف في السحابة");
      }

      const createdGoal = toGoal(data as GoalRow);
      setGoals((goals) => [createdGoal, ...goals], false);
      return createdGoal;
    }

    const localGoal: Goal = {
      ...goalData,
      id: generateId(),
      name: goalData.name.trim(),
      requirements: goalData.requirements?.trim() ?? "",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setGoals((goals) => [localGoal, ...goals], true);
    return localGoal;
  }, [setGoals, state.isSynced]);

  const update = useCallback(async (goal: Goal): Promise<boolean> => {
    assertValidGoalInput(goal);

    const userId = userIdRef.current;

    if (state.isSynced) {
      if (!userId || !supabase) {
        throw new Error("تعذر تحديث الهدف في السحابة: جلسة المستخدم غير متاحة");
      }

      const { error } = await supabase
        .from("goals")
        .update(toGoalUpdate(goal))
        .eq("id", goal.id)
        .eq("user_id", userId);

      if (error) {
        console.error("[GoalsGateway] Update cloud error:", error);
        setState((current) => ({ ...current, isError: true }));
        throw new Error("فشل تحديث الهدف في السحابة");
      }

      setGoals((goals) => goals.map((item) => (item.id === goal.id ? goal : item)), false);
      return true;
    }

    setGoals((goals) => goals.map((item) => (item.id === goal.id ? goal : item)), true);
    return true;
  }, [setGoals, state.isSynced]);

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    const userId = userIdRef.current;

    if (state.isSynced) {
      if (!userId || !supabase) {
        throw new Error("تعذر حذف الهدف من السحابة: جلسة المستخدم غير متاحة");
      }

      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error("[GoalsGateway] Delete cloud error:", error);
        setState((current) => ({ ...current, isError: true }));
        throw new Error("فشل حذف الهدف من السحابة");
      }

      setGoals((goals) => goals.filter((goal) => goal.id !== id), false);
      return true;
    }

    setGoals((goals) => goals.filter((goal) => goal.id !== id), true);
    return true;
  }, [setGoals, state.isSynced]);

  const complete = useCallback(async (id: string): Promise<boolean> => {
    const completedAt = new Date().toISOString();
    const userId = userIdRef.current;

    if (state.isSynced) {
      if (!userId || !supabase) {
        throw new Error("تعذر إكمال الهدف في السحابة: جلسة المستخدم غير متاحة");
      }

      const { error } = await supabase
        .from("goals")
        .update({ completed_at: completedAt })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error("[GoalsGateway] Complete cloud error:", error);
        setState((current) => ({ ...current, isError: true }));
        throw new Error("فشل إكمال الهدف في السحابة");
      }

      setGoals((goals) => goals.map((goal) => (goal.id === id ? { ...goal, completedAt } : goal)), false);
      return true;
    }

    setGoals((goals) => goals.map((goal) => (goal.id === id ? { ...goal, completedAt } : goal)), true);
    return true;
  }, [setGoals, state.isSynced]);

  const updateProgress = useCallback(async (id: string, progress: number): Promise<boolean> => {
    assertValidProgress(progress);

    const userId = userIdRef.current;

    if (state.isSynced) {
      if (!userId || !supabase) {
        throw new Error("تعذر تحديث تقدم الهدف في السحابة: جلسة المستخدم غير متاحة");
      }

      const { error } = await supabase
        .from("goals")
        .update({ current_progress: progress })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error("[GoalsGateway] Update progress cloud error:", error);
        setState((current) => ({ ...current, isError: true }));
        throw new Error("فشل تحديث تقدم الهدف في السحابة");
      }

      setGoals((goals) => goals.map((goal) => (goal.id === id ? { ...goal, currentProgress: progress } : goal)), false);
      return true;
    }

    setGoals((goals) => goals.map((goal) => (goal.id === id ? { ...goal, currentProgress: progress } : goal)), true);
    return true;
  }, [setGoals, state.isSynced]);

  return {
    ...state,
    load,
    add,
    update,
    delete: deleteGoal,
    complete,
    updateProgress,
  };
}

