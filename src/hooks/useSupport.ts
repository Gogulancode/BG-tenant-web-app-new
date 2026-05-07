import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  getSupportTickets,
  createSupportTicket,
  getSupportTicket,
  addTicketComment,
  updateTicketStatus,
} from "@/lib/api";

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  message: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export function useSupportTickets() {
  return useQuery({
    queryKey: ["supportTickets"],
    queryFn: getSupportTickets,
    staleTime: 60 * 1000,
  });
}

export function useSupportTicket(ticketId: string) {
  return useQuery({
    queryKey: ["supportTicket", ticketId],
    queryFn: () => getSupportTicket(ticketId),
    enabled: !!ticketId,
    staleTime: 30 * 1000,
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { subject: string; message: string; priority?: string }) =>
      createSupportTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      toast({ title: "Ticket created", description: "Support will respond soon" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      addTicketComment(ticketId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supportTicket", variables.ticketId] });
      toast({ title: "Comment added" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      updateTicketStatus(ticketId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      queryClient.invalidateQueries({ queryKey: ["supportTicket", variables.ticketId] });
      toast({ title: "Status updated" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
