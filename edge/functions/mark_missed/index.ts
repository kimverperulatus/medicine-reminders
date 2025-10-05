import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

console.log("mark_missed function started");

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get doses that should have been taken but weren't (past due)
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

    const { data: missedSchedules, error: schedulesError } = await supabaseClient
      .from("schedules")
      .select(`
        id,
        scheduled_time,
        patient_id,
        prescriptions (
          medication_name,
          patients (
            user_id
          )
        )
      `)
      .eq("status", "pending")
      .lt("scheduled_time", fiveMinutesAgo.toISOString());

    if (schedulesError) {
      throw schedulesError;
    }

    console.log(`Found ${missedSchedules.length} missed doses`);

    // Mark each as missed and create intake logs
    for (const schedule of missedSchedules) {
      // Update schedule status
      const { error: updateError } = await supabaseClient
        .from("schedules")
        .update({ status: "missed" })
        .eq("id", schedule.id);

      if (updateError) {
        console.error(`Error updating schedule ${schedule.id}:`, updateError);
        continue;
      }

      // Create intake log
      const { error: logError } = await supabaseClient
        .from("intake_logs")
        .insert({
          schedule_id: schedule.id,
          patient_id: schedule.patient_id,
          status: "missed",
          taken_at: null,
        });

      if (logError) {
        console.error(`Error creating intake log for schedule ${schedule.id}:`, logError);
      }

      // Call n8n webhook for missed dose tracking
      try {
        const webhookUrl = Deno.env.get("N8N_MISSED_DOSE_WEBHOOK");
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              scheduleId: schedule.id,
              patientId: schedule.patient_id,
              medicationName: schedule.prescriptions?.medication_name,
              scheduledTime: schedule.scheduled_time,
            }),
          });
        }
      } catch (error) {
        console.error("Error calling n8n webhook:", error);
      }
    }

    return new Response(
      JSON.stringify({ message: "Missed doses marked successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in mark_missed:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});