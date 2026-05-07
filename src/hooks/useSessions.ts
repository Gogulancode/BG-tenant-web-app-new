import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { getMySessions, revokeSession, revokeAllSessions } from "@/lib/api";

export interface Session {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: getMySessions,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({ title: "Session revoked", description: "Device has been logged out" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to revoke session",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast({
        title: "All sessions revoked",
        description: "All other devices have been logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to revoke sessions",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
