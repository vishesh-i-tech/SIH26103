import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch user profile from profiles table
  const fetchProfile = async (userId) => {
    if (!userId || !isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch profile:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("Error fetching profile:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured()) {
        // Fallback for demo when Supabase credentials have not been configured yet
        const savedRole = localStorage.getItem("paimana_role");
        let savedName = localStorage.getItem("paimana_officer");
        if (savedName && (savedName.toLowerCase().includes("vishesh") || savedName.toLowerCase().includes("harshal"))) {
          savedName = savedRole === "admin" ? "Dr. Alok Srivastava (MoSPI Admin)" : "Er. Manoj K. Sharma (Field Officer)";
          localStorage.setItem("paimana_officer", savedName);
        }
        if (savedRole) {
          setProfile({
            id: "demo-user-id",
            full_name: savedName || (savedRole === "admin" ? "Dr. Alok Srivastava (MoSPI Admin)" : "Er. Manoj K. Sharma (Field Officer)"),
            role: savedRole,
          });
          setUser({ id: "demo-user-id", email: savedRole === "admin" ? "alok.srivastava@mospi.gov.in" : "manoj.sharma@mospi.gov.in" });
        }
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Error getting session:", error.message);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          if (initialSession?.user) {
            const userProfile = await fetchProfile(initialSession.user.id);
            if (userProfile) {
              setProfile(userProfile);
            } else if (initialSession.user.user_metadata) {
              // Fallback to user_metadata if profiles row takes a moment to create
              setProfile({
                id: initialSession.user.id,
                full_name: initialSession.user.user_metadata.full_name || "Officer",
                role: initialSession.user.user_metadata.role || "field_officer",
              });
            }
          }
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen for auth state changes
    let authListener = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          const userProfile = await fetchProfile(newSession.user.id);
          if (userProfile) {
            setProfile(userProfile);
          } else if (newSession.user.user_metadata) {
            setProfile({
              id: newSession.user.id,
              full_name: newSession.user.user_metadata.full_name || "Officer",
              role: newSession.user.user_metadata.role || "field_officer",
            });
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      authListener = data?.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Sign in with Email and Password
  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured()) {
      // Demo mode login
      const demoRole = email.includes("field") ? "field_officer" : "admin";
      const demoName = demoRole === "admin" ? "MoSPI IPMD Admin" : "Er. Rajesh Verma";
      setProfile({ id: "demo-user-id", full_name: demoName, role: demoRole });
      setUser({ id: "demo-user-id", email });
      localStorage.setItem("paimana_role", demoRole);
      localStorage.setItem("paimana_officer", demoName);
      return { data: { user: { id: "demo-user-id", email } }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      let userProfile = await fetchProfile(data.user.id);
      if (!userProfile && data.user.user_metadata) {
        userProfile = {
          id: data.user.id,
          full_name: data.user.user_metadata.full_name || "Officer",
          role: data.user.user_metadata.role || "field_officer",
        };
      }
      setProfile(userProfile);
    }

    return { data, error: null };
  };

  // Sign up with Email, Password, Full Name, and Role
  const signUp = async ({ email, password, fullName, role }) => {
    if (!isSupabaseConfigured()) {
      setProfile({ id: "demo-user-id", full_name: fullName, role });
      setUser({ id: "demo-user-id", email });
      localStorage.setItem("paimana_role", role);
      localStorage.setItem("paimana_officer", fullName);
      return { data: { user: { id: "demo-user-id", email } }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      return { data: null, error };
    }

    // Insert or update profile row in profiles table
    if (data?.user) {
      try {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          role: role,
        });

        if (profileError) {
          console.warn("Profile table insert notice:", profileError.message);
        }

        const newProfile = {
          id: data.user.id,
          full_name: fullName,
          role: role,
        };
        setProfile(newProfile);
        setUser(data.user);
      } catch (profileErr) {
        console.warn("Could not insert profile:", profileErr);
      }
    }

    return { data, error: null };
  };

  // Sign out
  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase sign out error:", err);
      }
    }
    localStorage.removeItem("paimana_role");
    localStorage.removeItem("paimana_officer");
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  // Instant seamless role switcher for demo and evaluation
  const switchRole = (newRole) => {
    const roleName = newRole === "field_officer" || newRole === "field" ? "field_officer" : "admin";
    const name = roleName === "admin" ? "Dr. Alok Srivastava (MoSPI Admin)" : "Er. Manoj K. Sharma (Field Officer)";
    const email = roleName === "admin" ? "alok.srivastava@mospi.gov.in" : "manoj.sharma@mospi.gov.in";
    const id = roleName === "admin" ? "6b70c5b1-2014-42b7-b1f4-06489af1ec0f" : "b3834545-6334-4448-9c3f-5b758fc85880";

    const newProfile = { id, full_name: name, role: roleName };
    const newUser = { id, email, user_metadata: { role: roleName, full_name: name } };

    setProfile(newProfile);
    setUser(newUser);
    localStorage.setItem("paimana_role", roleName);
    localStorage.setItem("paimana_officer", name);
    return { user: newUser, role: roleName };
  };

  // Persistent local site submissions for offline/demo and instant UI reactivity
  const [submissions, setSubmissions] = useState(() => {
    try {
      const saved = localStorage.getItem("paimana_submissions");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const addSubmission = (newEntry) => {
    setSubmissions((prev) => {
      const entryWithId = {
        id: newEntry.id || `local-${Date.now()}`,
        date: newEntry.date || new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date()),
        reviewStatus: newEntry.reviewStatus || "Pending Review",
        ...newEntry,
      };
      const updated = [entryWithId, ...prev];
      try {
        localStorage.setItem("paimana_submissions", JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not write submissions to localStorage:", err);
      }
      return updated;
    });
  };

  // Normalized role values: 'admin' or 'field_officer'
  const normalizedRole = profile?.role === "field" ? "field_officer" : (profile?.role || null);
  const officerName = profile?.full_name || (normalizedRole === "field_officer" ? "Field Officer" : "MoSPI Admin");

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role: normalizedRole,
        officerName,
        loading,
        submissions,
        addSubmission,
        signIn,
        signUp,
        logout,
        switchRole,
        fetchProfile,
        isConfigured: isSupabaseConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
