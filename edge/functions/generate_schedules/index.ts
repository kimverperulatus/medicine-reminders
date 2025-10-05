// Follow this setup guide for TypeScript:
// https://deno.land/manual@v1.39.0/typescript/configuration

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

console.log("generate_schedules function started");

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active prescriptions
    const { data: prescriptions, error: prescriptionsError } = await supabaseClient
      .from("prescriptions")
      .select("*")
      .lte("start_date", new Date().toISOString())
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

    if (prescriptionsError) {
      throw prescriptionsError;
    }

    console.log(`Found ${prescriptions.length} active prescriptions`);

    // For each prescription, generate schedules for the next 14 days
    for (const prescription of prescriptions) {
      // Delete existing future schedules for this prescription
      const { error: deleteError } = await supabaseClient
        .from("schedules")
        .delete()
        .gte("scheduled_time", new Date().toISOString())
        .eq("prescription_id", prescription.id);

      if (deleteError) {
        console.error(`Error deleting schedules for prescription ${prescription.id}:`, deleteError);
        continue;
      }

      // Generate new schedules for the next 14 days
      const schedulesToInsert = [];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      for (let d = new Date(); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Skip if outside prescription period
        if (prescription.end_date && new Date(prescription.end_date) < d) {
          continue;
        }

        // Generate schedules based on frequency
        for (const time of prescription.times) {
          const [hours, minutes] = time.split(":").map(Number);
          const scheduledTime = new Date(d);
          scheduledTime.setHours(hours, minutes, 0, 0);

          // Skip if in the past
          if (scheduledTime < new Date()) {
            continue;
          }

          schedulesToInsert.push({
            prescription_id: prescription.id,
            scheduled_time: scheduledTime.toISOString(),
            status: "pending",
          });
        }
      }

      // Insert new schedules
      if (schedulesToInsert.length > 0) {
        const { error: insertError } = await supabaseClient
          .from("schedules")
          .insert(schedulesToInsert);

        if (insertError) {
          console.error(`Error inserting schedules for prescription ${prescription.id}:`, insertError);
        } else {
          console.log(`Inserted ${schedulesToInsert.length} schedules for prescription ${prescription.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ message: "Schedules generated successfully" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate_schedules:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});