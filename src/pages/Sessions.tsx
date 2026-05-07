import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Monitor,
  Smartphone,
  Loader2,
  LogOut,
  MapPin,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
  Session,
} from "@/hooks/useSessions";

function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  // Simple UA parsing
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  let browser = "Unknown";
  let os = "Unknown";

  if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/edge/i.test(ua)) browser = "Edge";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";

  return {
    device: isMobile ? "Mobile" : "Desktop",
    browser,
    os,
  };
}

function SessionCard({
  session,
  onRevoke,
  isRevoking,
}: {
  session: Session;
  onRevoke: () => void;
  isRevoking: boolean;
}) {
  const { device, browser, os } = parseUserAgent(session.userAgent || "");
  const isCurrent = session.isCurrent;

  return (
    <Card className={isCurrent ? "border-primary" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {device === "Mobile" ? (
              <Smartphone className="h-8 w-8 text-muted-foreground mt-1" />
            ) : (
              <Monitor className="h-8 w-8 text-muted-foreground mt-1" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {browser} on {os}
                </span>
                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current Session
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {session.ipAddress || "Unknown IP"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Expires: {format(new Date(session.expiresAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          {!isCurrent && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <LogOut className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will log out this device immediately. The user will need to sign in
                    again on that device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRevoke}
                    disabled={isRevoking}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isRevoking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Revoke
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Sessions() {
  const { data: sessions, isLoading, error } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    await revokeSession.mutateAsync(sessionId);
    setRevokingId(null);
  };

  const sessionList = Array.isArray(sessions) ? sessions : [];
  const otherSessions = sessionList.filter((s) => !s.isCurrent);

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
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load sessions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Active Sessions</h1>
        <p className="text-muted-foreground mt-1">
          Manage devices where you're currently signed in
        </p>
      </div>

      {/* Revoke All Button */}
      {otherSessions.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-destructive">Sign out everywhere else</h3>
                <p className="text-sm text-muted-foreground">
                  This will log you out from all devices except your current one
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out everywhere?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will revoke all sessions except your current one. You'll need to sign
                      in again on all other devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => revokeAllSessions.mutate()}
                      disabled={revokeAllSessions.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {revokeAllSessions.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Sign Out All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          {sessionList.length} Active Session{sessionList.length !== 1 ? "s" : ""}
        </h2>
        {sessionList.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active sessions found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {sessionList.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={() => handleRevokeSession(session.id)}
                isRevoking={revokingId === session.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
