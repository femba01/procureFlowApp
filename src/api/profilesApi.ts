import type { User } from "../types/auth";
import supabase from "./supabase";

export const getProfiles = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('auth_user_id', userId).single();
    if (error) {
        throw new Error(error.message);
    }
    return data as User;
}

export const getAllUsers = async (organizationId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('organization_id', organizationId);
    if (error) {
        throw new Error(error.message);
    }
    return data as User[];
}

export interface ProfileOption {
  id: string;
  name: string;
}

export const getOrganizationProfileOptions = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("organization_id", organizationId)
    .order("name");

  if (error) throw new Error(error.message);
  return data as ProfileOption[];
};
