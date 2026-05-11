import { useGetMyProfile } from "@/lib/api/hooks/useUsers";

export const useMyProfile = () => {
  const { data, isLoading } = useGetMyProfile();

  return {
    data,
    isLoading,
  };
};
