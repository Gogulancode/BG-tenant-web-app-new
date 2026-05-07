import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "@/lib/api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        return await getNotifications();
      } catch {
        // Gracefully return empty array if notifications endpoint doesn't exist
        return [];
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Poll every minute
    retry: false, // Don't retry on failure
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      try {
        return await getUnreadNotificationCount();
      } catch {
        // Gracefully return 0 if endpoint doesn't exist
        return 0;
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    retry: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "All notifications marked as read" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark all as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
