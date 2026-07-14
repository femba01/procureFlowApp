import supabase from "./supabase";

export const getDepartments = async () => {
    const { data: departments, error } = await supabase.from('departments').select('*');
    if (error) {
        throw new Error(error.message);
    }
    return departments;
}