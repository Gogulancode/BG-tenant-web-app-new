import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellOff,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  Notification,
} from "@/hooks/useNotifications";

const NOTIFICATION_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  action: Zap,
};

const NOTIFICATION_COLORS = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  action: "text-primary",
};

function getNotificationIcon(type: string) {
  return NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || Info;
}

function getNotificationColor(type: string) {
  return NOTIFICATION_COLORS[type as keyof typeof NOTIFICATION_COLORS] || "text-blue-500";
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const Icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  return (
    <div
      className={`p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`font-medium ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
            </div>
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onMarkRead}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const { data: notifications, isLoading, error } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notificationList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationList.filter((n: Notification) => !n.isRead).length;

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
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Stay updated on your accountability progress</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            {markAllRead.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notificationList.length === 0 ? (
            <div className="p-12 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! Notifications will appear here.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              {notificationList.map((notification: Notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markRead.mutate(notification.id)}
                />
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
