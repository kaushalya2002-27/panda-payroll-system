import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "../api/userApi"; // Ensure this import is correct

interface UseCurrentUserResult {
  user: User | undefined;
  status: "idle" | "loading" | "error" | "success" | "pending";
  isRefetching: boolean;
}

function useCurrentUser(): UseCurrentUserResult {
  const { data, status, isRefetching } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
  });

  return { user: data, status, isRefetching };
}

export default useCurrentUser;
