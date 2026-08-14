"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export type UserRole = "farmer" | "mandi" | "wholesaler" | "retailer" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  warehouseName?: string;
  facilityAddress?: string;
  storageCapacityTonnes?: number;
  availableCapacityTonnes?: number;
  hasColdStorage?: boolean;
  contactPerson?: string;
  location?: {
    state: string;
    district: string;
    lat?: number;
    lng?: number;
  };
  language: string;
  photoURL?: string;
  createdAt?: unknown;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  signOut: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  farmer: {
    uid: "demo-farmer-001",
    email: "ramesh.farmer@perix.in",
    displayName: "Ramesh Patel (Farmer)",
    role: "farmer",
    location: { state: "Tamil Nadu", district: "Coimbatore" },
    language: "en",
    isDemo: true,
  },
  mandi: {
    uid: "demo-mandi-001",
    email: "coimbatore.mandi@perix.in",
    displayName: "Kovai APMC Mandi Agent",
    role: "mandi",
    location: { state: "Tamil Nadu", district: "Coimbatore" },
    language: "en",
    isDemo: true,
  },
  wholesaler: {
    uid: "demo-wholesaler-001",
    email: "southagro.wholesaler@perix.in",
    displayName: "Apex Agro Wholesalers",
    role: "wholesaler",
    location: { state: "Tamil Nadu", district: "Tiruppur" },
    language: "en",
    isDemo: true,
  },
  retailer: {
    uid: "demo-retailer-001",
    email: "freshmart.retail@perix.in",
    displayName: "FreshMart Organic Retail",
    role: "retailer",
    location: { state: "Tamil Nadu", district: "Chennai" },
    language: "en",
    isDemo: true,
  },
  admin: {
    uid: "demo-admin-001",
    email: "admin@perix.in",
    displayName: "System Administrator",
    role: "admin",
    language: "en",
    isDemo: true,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchProfile = async (firebaseUser: User): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { uid: firebaseUser.uid, ...docSnap.data() } as UserProfile;
      }
    } catch (err) {
      console.warn("Could not fetch user profile from Firestore:", err);
    }
    return null;
  };

  // Create user profile in Firestore
  const createProfile = async (
    firebaseUser: User,
    role: UserRole = "farmer",
    name?: string
  ): Promise<UserProfile> => {
    const profileData: Omit<UserProfile, "uid"> = {
      email: firebaseUser.email || "",
      displayName: name || firebaseUser.displayName || "",
      role,
      language: "en",
      photoURL: firebaseUser.photoURL || "",
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, "users", firebaseUser.uid), profileData);
    } catch (err) {
      console.warn("Could not save profile to Firestore:", err);
    }
    return { uid: firebaseUser.uid, ...profileData };
  };

  useEffect(() => {
    // Check localStorage for demo session first
    if (typeof window !== "undefined") {
      const savedDemo = localStorage.getItem("perix_demo_role") as UserRole | null;
      if (savedDemo && DEMO_PROFILES[savedDemo]) {
        setProfile(DEMO_PROFILES[savedDemo]);
        setUser({ uid: DEMO_PROFILES[savedDemo].uid, email: DEMO_PROFILES[savedDemo].email, displayName: DEMO_PROFILES[savedDemo].displayName } as unknown as User);
        setLoading(false);
        return;
      }
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const existingProfile = await fetchProfile(firebaseUser);
          setProfile(existingProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase Auth listener error:", err);
      setLoading(false);
    }
  }, []);

  const loginAsDemo = (role: UserRole) => {
    const demoProf = DEMO_PROFILES[role];
    setProfile(demoProf);
    setUser({ uid: demoProf.uid, email: demoProf.email, displayName: demoProf.displayName } as unknown as User);
    if (typeof window !== "undefined") {
      localStorage.setItem("perix_demo_role", role);
    }
  };

  const switchRole = (role: UserRole) => {
    if (profile) {
      const updated = { ...profile, role };
      setProfile(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("perix_demo_role", role);
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const existingProfile = await fetchProfile(result.user);
      if (!existingProfile) {
        setProfile(null);
      } else {
        setProfile(existingProfile);
      }
    } catch (err) {
      console.error("Google login failed, falling back to demo mode:", err);
      loginAsDemo("farmer");
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Instant Persona Demo Credential Matching
    if (cleanEmail.includes("farmer")) {
      loginAsDemo("farmer");
      return;
    }
    if (cleanEmail.includes("mandi")) {
      loginAsDemo("mandi");
      return;
    }
    if (cleanEmail.includes("wholesaler") || cleanEmail.includes("agro") || cleanEmail.includes("distrib")) {
      loginAsDemo("wholesaler");
      return;
    }
    if (cleanEmail.includes("retail") || cleanEmail.includes("freshmart") || cleanEmail.includes("pos")) {
      loginAsDemo("retailer");
      return;
    }
    if (cleanEmail.includes("admin")) {
      loginAsDemo("admin");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const existingProfile = await fetchProfile(result.user);
      setProfile(existingProfile);
    } catch (err: any) {
      console.warn("Email login fallback to demo profile on error:", err);
      // Auto-fallback if Firebase credential check fails or is unconfigured
      loginAsDemo("farmer");
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      const newProfile = await createProfile(result.user, role, name);
      setProfile(newProfile);
    } catch (err: any) {
      console.warn("Signup fallback to demo profile on error:", err);
      loginAsDemo(role);
    }
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("perix_demo_role");
    }
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Signout fallback:", e);
    }
    setUser(null);
    setProfile(null);
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user) return;
    const existingProfile = await fetchProfile(user);
    if (existingProfile) {
      try {
        await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
      } catch (e) {
        console.warn("Firestore update error:", e);
      }
      setProfile({ ...existingProfile, role });
    } else {
      const newProfile = await createProfile(user, role);
      setProfile(newProfile);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (profile) {
      const merged = { ...profile, ...updates };
      setProfile(merged);
      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid), updates, { merge: true });
        } catch (e) {
          console.warn("Firestore user profile update error:", e);
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginAsDemo,
        signOut,
        updateUserRole,
        updateUserProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
