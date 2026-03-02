import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes — only set user & loading here
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile whenever user changes
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, phone")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      });

    return () => { cancelled = true; };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signOut };
}
