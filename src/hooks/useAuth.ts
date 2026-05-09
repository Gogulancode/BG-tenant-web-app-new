import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  loginUser,
  registerUser,
  enrollMfa,
  enableMfa,
  disableMfa,
  getCurrentUser,
} from "@/lib/api";
import { logout } from "@/lib/auth";
import { saveAuthSession } from "@/lib/auth-session";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (data) => {
      saveAuthSession(data);
      toast({ title: "Welcome back!", description: "Login successful" });
      navigate("/today");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: {
      name: string;
      email: string;
      password: string;
      businessType?: string;
    }) => registerUser(payload),
    onSuccess: (data) => {
      saveAuthSession(data);
      toast({ title: "Account created!", description: "Welcome aboard" });
      navigate("/today");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.clear();
    logout();
  };
}

// MFA Hooks
export function useEnrollMfa() {
  return useMutation({
    mutationFn: enrollMfa,
    onError: (error: Error) => {
      toast({
        title: "MFA enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useEnableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => enableMfa(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({ title: "MFA enabled", description: "Your account is now more secure" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to enable MFA",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDisableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => disableMfa(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({ title: "MFA disabled", description: "Two-factor authentication removed" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to disable MFA",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
