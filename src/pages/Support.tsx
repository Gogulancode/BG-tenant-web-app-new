import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Plus,
  Search,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle,
  Circle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useSupportTickets,
  useSupportTicket,
  useCreateSupportTicket,
  useAddTicketComment,
  TicketComment,
  SupportTicket,
} from "@/hooks/useSupport";

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  priority: z.enum(["low", "medium", "high"]),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const STATUS_CONFIG = {
  open: { icon: Circle, color: "text-blue-500", label: "Open", variant: "default" as const },
  in_progress: {
    icon: Clock,
    color: "text-yellow-500",
    label: "In Progress",
    variant: "secondary" as const,
  },
  resolved: {
    icon: CheckCircle,
    color: "text-green-500",
    label: "Resolved",
    variant: "outline" as const,
  },
  closed: {
    icon: AlertCircle,
    color: "text-gray-500",
    label: "Closed",
    variant: "outline" as const,
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", variant: "outline" as const },
  medium: { label: "Medium", variant: "secondary" as const },
  high: { label: "High", variant: "destructive" as const },
};

function TicketCard({
  ticket,
  onClick,
  isSelected,
}: {
  ticket: SupportTicket;
  onClick: () => void;
  isSelected: boolean;
}) {
  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = status.icon;

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
              <span className="font-medium truncate">{ticket.subject}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant={priority.variant}>{priority.label}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketDetail({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const addComment = useAddTicketComment();
  const [comment, setComment] = useState("");

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    await addComment.mutateAsync({ ticketId, message: comment });
    setComment("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-8 text-muted-foreground">Ticket not found</div>
    );
  }

  const status = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
  const priority =
    PRIORITY_CONFIG[ticket.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{ticket.subject}</h3>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant={priority.variant}>{priority.label}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Created {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>

      {/* Comments */}
      {ticket.comments && ticket.comments.length > 0 && (
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {ticket.comments.map((c: TicketComment) => (
              <div key={c.id} className="p-3 bg-background border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{c.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{c.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Add Comment */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="flex-1"
        />
        <Button
          onClick={handleAddComment}
          disabled={!comment.trim() || addComment.isPending}
          size="icon"
        >
          {addComment.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function Support() {
  const { data: tickets, isLoading, error } = useSupportTickets();
  const createTicket = useCreateSupportTicket();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", message: "", priority: "medium" },
  });

  const handleSubmit = async (values: TicketFormValues) => {
    const payload = {
      subject: values.subject,
      message: values.message,
      priority: values.priority,
    };
    await createTicket.mutateAsync(payload);
    setDialogOpen(false);
    form.reset();
  };

  const ticketList = Array.isArray(tickets) ? tickets : [];
  const filteredTickets = ticketList.filter((ticket: SupportTicket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <MessageSquare className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load support tickets</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support</h1>
          <p className="text-muted-foreground mt-1">Get help from our support team</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you as soon as possible
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the issue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your issue in detail..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTicket.isPending}>
                    {createTicket.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Submit Ticket
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List & Detail */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Tickets ({filteredTickets.length})
          </h2>
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tickets found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket: SupportTicket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  isSelected={selectedTicketId === ticket.id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicketId ? (
                <TicketDetail
                  ticketId={selectedTicketId}
                  onClose={() => setSelectedTicketId(null)}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a ticket to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
