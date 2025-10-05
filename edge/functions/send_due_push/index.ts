import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

console.log("send_due_push function started");

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get doses due in the next 30 minutes
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

    const { data: dueSchedules, error: schedulesError } = await supabaseClient
      .from("schedules")
      .select(`
        id,
        scheduled_time,
        prescriptions (
          medication_name,
          dosage,
          patients (
            user_id
          )
        )
      `)
      .eq("status", "pending")
      .gte("scheduled_time", now.toISOString())
      .lte("scheduled_time", thirtyMinutesLater.toISOString());

    if (schedulesError) {
      throw schedulesError;
    }

    console.log(`Found ${dueSchedules.length} doses due soon`);

    // For each due dose, send push notification
    for (const schedule of dueSchedules) {
      const patientUserId = schedule.prescriptions?.patients?.user_id;
      if (!patientUserId) continue;

      // Get user's push tokens
      const { data: devices, error: devicesError } = await supabaseClient
        .from("devices")
        .select("expo_push_token")
        .eq("user_id", patientUserId);

      if (devicesError) {
        console.error(`Error fetching devices for user ${patientUserId}:`, devicesError);
        continue;
      }

      // Send push notification to each device
      for (const device of devices) {
        if (!device.expo_push_token) continue;

        try {
          const response = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: device.expo_push_token,
              title: "Medication Reminder",
              body: `Time to take ${schedule.prescriptions?.medication_name} (${schedule.prescriptions?.dosage})`,
              data: { scheduleId: schedule.id },
            }),
          });

          const result = await response.json();
          console.log("Push notification result:", result);
        } catch (error) {
          console.error("Error sending push notification:", error);
        }
      }
    }

    return new Response(
      JSON.stringify({ message: "Push notifications sent successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send_due_push:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});