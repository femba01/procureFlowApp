
import type { OrganisationSettings } from "../types/settings";
import supabase from "./supabase";

export const getOrganisationSettings = async (id: string) => {
  const {data, error} = await supabase.from('organizations').select('*').eq('id', id).single();
  if (error) {
    throw new Error(error.message);
  }
  return data as OrganisationSettings;
};
export const updateOrganisationSettings = async (input: OrganisationSettings) => {
  const {data, error} = await supabase.from('organizations').update(input).eq('id', input.id).single();
    
  if (
    input.managerApprovalThreshold > input.financeApprovalThreshold ||
    input.financeApprovalThreshold > input.executiveApprovalThreshold
  )
    throw new Error(
      "Approval thresholds must increase from manager to executive level",
    );

  if (error) {
        throw new Error(error.message);
    }
  return data as OrganisationSettings;
}
