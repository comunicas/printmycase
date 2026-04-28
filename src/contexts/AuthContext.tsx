import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { clarityIdentify, clarityTag } from "@/lib/clarity";

const getWelcomeEmailKey = (userId: string) => `welcome-email-sent:${userId}`;

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  referral_code: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const welcomeSentRef = useRef<Set<string>>(new Set());
  const welcomeInFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id || !user.email_confirmed_at || !user.email) return;

    const welcomeKey = getWelcomeEmailKey(user.id);
    if (
      window.sessionStorage.getItem(welcomeKey) === "1" ||
      welcomeSentRef.current.has(user.id) ||
      welcomeInFlightRef.current.has(user.id)
    ) {
      return;
    }

    let cancelled = false;
    welcomeInFlightRef.current.add(user.id);

    const sendWelcomeEmail = async () => {
      const messageId = `welcome-${user.id}`;
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "welcome-email",
          recipientEmail: user.email,
          messageId,
          idempotencyKey: messageId,
        },
      });

      if (cancelled) return;

      if (error) {
        console.error("Failed to trigger welcome email", error);
        welcomeInFlightRef.current.delete(user.id);
        return;
      }

      welcomeSentRef.current.add(user.id);
      welcomeInFlightRef.current.delete(user.id);
      window.sessionStorage.setItem(welcomeKey, "1");
    };

    void sendWelcomeEmail();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email, user?.email_confirmed_at]);

  useEffect(() => {
    let resolved = false;
    const finishLoading = () => {
      if (!resolved) {
        resolved = true;
        setLoading(false);
      }
    };

    // Safety net: never let the app stay stuck on the spinner.
    // If getSession hangs (e.g. Supabase auth lock contention across tabs),
    // we still release the loading state after 3s and treat the user as anonymous.
    const failsafe = window.setTimeout(() => {
      if (!resolved) {
        clarityTag("user_type", "anonymous");
        finishLoading();
      }
    }, 3000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          clarityIdentify(u.id, u.email);
          clarityTag("user_type", "logged_in");
        } else {
          clarityTag("user_type", "anonymous");
        }
        finishLoading();
      })
      .catch((err) => {
        console.warn("getSession failed, treating as anonymous:", err?.message || err);
        clarityTag("user_type", "anonymous");
        finishLoading();
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          clarityIdentify(u.id, u.email);
          clarityTag("user_type", "logged_in");
        } else {
          clarityTag("user_type", "anonymous");
        }
        // Auth state change also confirms we're past initialization.
        finishLoading();
      },
    );

    return () => {
      window.clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, phone, referral_code")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  const refetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, phone, referral_code")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    welcomeSentRef.current.clear();
    welcomeInFlightRef.current.clear();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
