/**
 * Supabase Edge Function: send-push
 * Phase 15: Web Push Notification Foundation
 * 
 * This function sends Web Push notifications to user subscriptions.
 * 
 * SECURITY:
 * - VAPID_PRIVATE_KEY must be set as an environment variable in Supabase
 * - This function should only be called by authenticated users or cron jobs
 * - Never log subscription data or VAPID keys
 * 
 * Required environment variables (set in Supabase Edge Function settings):
 * - VAPID_PRIVATE_KEY: The private VAPID key (from web-push generate-vapid-keys)
 * - VAPID_PUBLIC_KEY: The public VAPID key (for reference)
 * - VAPID_SUBJECT: The mailto: or https: subject line for VAPID
 * 
 * To deploy:
 * 1. supabase functions deploy send-push
 * 2. Set the environment variables in Supabase dashboard
 * 
 * For scheduled notifications (cron):
 * - Set up Supabase Cron job or use external scheduler
 * - Example cron schedule: every hour for reminder checks
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  url?: string;
}

interface SendPushRequest {
  userId: string;
  payload: PushPayload;
}

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:notifications@mawaeedak.app";

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Validate VAPID configuration
    if (!VAPID_PRIVATE_KEY || !VAPID_PUBLIC_KEY) {
      return new Response(
        JSON.stringify({ error: "VAPID keys not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { userId, payload }: SendPushRequest = await req.json();

    if (!userId || !payload?.title || !payload?.body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, payload.title, payload.body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role (Edge Function context)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (subError) {
      console.error("[send-push] Failed to fetch subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found for user", sent: 0 }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Construct push notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon ?? "/icons/icon-192.svg",
      badge: payload.badge ?? "/icons/icon-192.svg",
      tag: payload.tag ?? "mawaeedak-notification",
      data: {
        ...payload.data,
        url: payload.url ?? "/",
        timestamp: Date.now(),
      },
    });

    // Send push to each subscription
    let sentCount = 0;
    const results = [];

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        // Using web-push library (needs to be imported in Deno)
        // For Deno, we'll use native fetch with VAPID authentication
        const response = await forwardToPushService(pushSubscription, notificationPayload);
        
        if (response.ok) {
          sentCount++;
          results.push({ endpoint: sub.endpoint, status: "sent" });
        } else {
          // Check if subscription is expired
          if (response.status === 410) {
            // Delete expired subscription
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
            results.push({ endpoint: sub.endpoint, status: "expired_and_deleted" });
          } else {
            results.push({ endpoint: sub.endpoint, status: "failed", error: response.status });
          }
        }
      } catch (error) {
        console.error(`[send-push] Failed to send to ${sub.endpoint}:`, error);
        results.push({ endpoint: sub.endpoint, status: "error", error: String(error) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: subscriptions.length,
        results,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("[send-push] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

// Forward push notification to the push service (WebPush protocol)
async function forwardToPushService(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string
): Promise<Response> {
  // This is a simplified implementation
  // In production, use the web-push library or a proper push service
  // 
  // The actual implementation would use:
  // 1. Generate VAPID authentication header
  // 2. Send POST request to subscription.endpoint with encrypted payload
  // 3. Return the response from the push service
  
  // For now, return a placeholder response
  // Real implementation would use Deno deploy or Node.js web-push package
  
  console.log("[send-push] Would send to:", subscription.endpoint);
  
  return new Response(JSON.stringify({ message: "Push service not fully implemented in this skeleton" }), {
    status: 501,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * DEPLOYMENT DOCUMENTATION:
 * 
 * 1. Generate VAPID keys locally:
 *    npx web-push generate-vapid-keys
 * 
 * 2. Set environment variables in Supabase:
 *    - VAPID_PUBLIC_KEY: (from step 1, public key)
 *    - VAPID_PRIVATE_KEY: (from step 1, private key - keep secret!)
 *    - VAPID_SUBJECT: "mailto:your-email@example.com" or "https://your-domain.com"
 * 
 * 3. Deploy the function:
 *    supabase functions deploy send-push
 * 
 * 4. For scheduled reminders:
 *    - Create a Supabase Cron job that calls this function
 *    - Or use an external scheduler (Vercel Cron, etc.)
 *    - The cron should check for reminders due and send push notifications
 * 
 * 5. Frontend integration:
 *    - Use pushNotificationService.ts to subscribe users
 *    - Store subscriptions in push_subscriptions table
 *    - When user creates a reminder, call this function when it's due
 * 
 * Note: This is a skeleton implementation. Full push notification delivery
 * requires either:
 * - Using a service like OneSignal, Firebase Cloud Messaging, or
 * - Implementing the full WebPush protocol with encryption
 */
