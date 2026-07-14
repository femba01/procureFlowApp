import type { User } from "../types/types";
import supabase from "./supabase";

export const getProfiles = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
        throw new Error(error.message);
    }
    return data as User;
}