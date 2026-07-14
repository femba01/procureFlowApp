import type { User } from "../types/auth";
import supabase from "./supabase";

export const getProfiles = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (error) {
        throw new Error(error.message);
    }
    return data as User;
}
