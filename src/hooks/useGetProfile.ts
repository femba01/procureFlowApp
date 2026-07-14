import { useAppStore } from "../store/store";

export const useGetProfile = () => {
  const profile = useAppStore((state) => state.user);
  const authReady = useAppStore((state) => state.authReady);

  return { profile, isLoading: !authReady };
};
