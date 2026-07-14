import { useQuery } from "@tanstack/react-query";
import { getProfiles } from "../api/profilesApi";

export const useGetProfile = () => {
    const { data: profile, isLoading } = useQuery({
        queryKey: ["profiles"],
        queryFn: () => getProfiles("9f908fa2-038f-47b3-b715-6cd8100f5170"),
    });
    if (profile) {
        return { profile, isLoading };
    }
    return { profile, isLoading };
}
