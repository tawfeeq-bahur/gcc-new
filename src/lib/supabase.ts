import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Helper function for candidate operations (used by analyze-resume action)
export async function saveCandidateToSupabase(candidateData: any) {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .insert({
        full_name: candidateData.candidate_info.name,
        email: candidateData.candidate_info.email,
        phone: candidateData.candidate_info.phone,
        location: candidateData.candidate_info.location,
        candidate_info: candidateData.candidate_info,
        technical_dna: candidateData.technical_dna,
        gcc_readiness: candidateData.gcc_readiness,
        flight_risk: candidateData.flight_risk,
        skills_array: candidateData.skills_array,
        strengths: candidateData.strengths,
        gaps: candidateData.gaps,
        recommended_role: candidateData.recommended_role,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase save error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Supabase save error:", error);
    return { success: false, error: "Failed to save to database" };
  }
}

export async function getCandidates() {
  try {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return { data: null, error };
  }
}
