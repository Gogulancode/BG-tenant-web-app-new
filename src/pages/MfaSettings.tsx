import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, ShieldCheck, ShieldOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { useCurrentUser, useEnrollMfa, useEnableMfa, useDisableMfa } from "@/hooks/useAuth";

const codeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

type CodeFormValues = z.infer<typeof codeSchema>;

export default function MfaSettings() {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const enrollMfa = useEnrollMfa();
  const enableMfa = useEnableMfa();
  const disableMfa = useDisableMfa();

  const [enrollmentData, setEnrollmentData] = useState<{
    secret: string;
    qrCodeUrl: string;
  } | null>(null);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  const enableForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const disableForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const handleStartEnrollment = async () => {
    const result = await enrollMfa.mutateAsync();
    if (result) {
      setEnrollmentData({
        secret: result.secret,
        qrCodeUrl: result.qrCodeUrl || result.otpauthUrl,
      });
    }
  };

  const handleEnableMfa = async (values: CodeFormValues) => {
    await enableMfa.mutateAsync(values.code);
    setEnrollmentData(null);
    enableForm.reset();
  };

  const handleDisableMfa = async (values: CodeFormValues) => {
    await disableMfa.mutateAsync(values.code);
    setShowDisableDialog(false);
    disableForm.reset();
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const mfaEnabled = user?.mfaEnabled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Two-Factor Authentication</h1>
          <p className="text-muted-foreground mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {mfaEnabled ? (
              <ShieldCheck className="h-8 w-8 text-green-500" />
            ) : (
              <Shield className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <CardTitle>MFA Status</CardTitle>
              <CardDescription>
                {mfaEnabled
                  ? "Two-factor authentication is enabled"
                  : "Two-factor authentication is not enabled"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {mfaEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your account is protected with two-factor authentication. You'll need to enter a
                code from your authenticator app when signing in.
              </p>
              <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Disable MFA
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will make your account less secure. Enter your current authenticator
                      code to confirm.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Form {...disableForm}>
                    <form onSubmit={disableForm.handleSubmit(handleDisableMfa)}>
                      <FormField
                        control={disableForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authenticator Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="000000"
                                maxLength={6}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          type="submit"
                          disabled={disableMfa.isPending}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {disableMfa.isPending && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          )}
                          Disable MFA
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : enrollmentData ? (
            <div className="space-y-6">
              {/* Step 1: Scan QR Code */}
              <div className="space-y-4">
                <h3 className="font-semibold">Step 1: Scan QR Code</h3>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img
                    src={enrollmentData.qrCodeUrl}
                    alt="MFA QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    Or enter this code manually:
                  </p>
                  <code className="px-3 py-1 bg-muted rounded text-sm font-mono">
                    {enrollmentData.secret}
                  </code>
                </div>
              </div>

              {/* Step 2: Verify Code */}
              <div className="space-y-4">
                <h3 className="font-semibold">Step 2: Verify Code</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app to verify setup
                </p>
                <Form {...enableForm}>
                  <form
                    onSubmit={enableForm.handleSubmit(handleEnableMfa)}
                    className="space-y-4"
                  >
                    <FormField
                      control={enableForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verification Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="000000"
                              maxLength={6}
                              className="max-w-[200px] text-center text-lg tracking-widest"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={enableMfa.isPending}
                      >
                        {enableMfa.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Enable MFA
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEnrollmentData(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enable two-factor authentication to add an extra layer of security to your
                account. You'll need an authenticator app like Google Authenticator or Authy.
              </p>
              <Button onClick={handleStartEnrollment} disabled={enrollMfa.isPending}>
                {enrollMfa.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Shield className="h-4 w-4 mr-2" />
                Enable MFA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Two-factor authentication (2FA) adds a second layer of protection to your account.
            When enabled, you'll need both your password and a time-based code from your
            authenticator app to sign in.
          </p>
          <p>
            <strong>Recommended apps:</strong> Google Authenticator, Authy, Microsoft
            Authenticator, 1Password
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
