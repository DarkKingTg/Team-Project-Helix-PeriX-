"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

export type UserRole = "farmer" | "mandi" | "wholesaler" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  // Location details
  state?: string;
  district?: string;
  location?: {
    state: string;
    district: string;
    lat?: number;
    lng?: number;
  };
  // Farmer-specific details
  villageTaluk?: string;
  farmSizeAcres?: number;
  primaryCrops?: string[];
  upiId?: string;
  // Mandi / Warehouse-specific details
  warehouseName?: string;
  licenseNumber?: string;
  facilityAddress?: string;
  storageCapacityTonnes?: number;
  availableCapacityTonnes?: number;
  storageTypes?: string[];
  hasColdStorage?: boolean;
  contactPerson?: string;
  // Wholesaler-specific details
  companyName?: string;
  gstinNumber?: string;
  distributionHubCity?: string;
  fleetTypes?: string[];
  retailChannels?: string[];

  language: string;
  photoURL?: string;
  createdAt?: unknown;
  isDemo?: boolean;
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    extraData?: Partial<UserProfile>
  ) => Promise<UserProfile | null>;
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
    state: "Tamil Nadu",
    district: "Coimbatore",
    villageTaluk: "Pollachi Taluk",
    farmSizeAcres: 4.5,
    primaryCrops: ["Tomato", "Banana", "Green Chilli"],
    upiId: "ramesh.patel@okhdfcbank",
    location: { state: "Tamil Nadu", district: "Coimbatore" },
    language: "en",
    isDemo: true,
  },
  mandi: {
    uid: "demo-mandi-001",
    email: "coimbatore.mandi@perix.in",
    displayName: "Kovai APMC Mandi Agent",
    role: "mandi",
    warehouseName: "Kovai Agro Hub & Cold Storage",
    facilityAddress: "APMC Market Yard Complex, Mettupalayam Rd, Coimbatore",
    licenseNumber: "APMC-TN-CBE-2024-883",
    state: "Tamil Nadu",
    district: "Coimbatore",
    storageCapacityTonnes: 1200,
    hasColdStorage: true,
    storageTypes: ["Cold Storage", "Controlled Atmosphere"],
    location: { state: "Tamil Nadu", district: "Coimbatore" },
    language: "en",
    isDemo: true,
  },
  wholesaler: {
    uid: "demo-wholesaler-001",
    email: "southagro.wholesaler@perix.in",
    displayName: "Apex Agro Wholesalers",
    companyName: "Apex Agro Distribution Hub Ltd.",
    role: "wholesaler",
    state: "Tamil Nadu",
    district: "Tiruppur",
    distributionHubCity: "Tiruppur Central Logistics Depot",
    gstinNumber: "33AABCA1234F1Z5",
    fleetTypes: ["Reefer Van 3.5T", "Insulated Truck 10T"],
    retailChannels: ["Supermarket Chains", "Hypermarkets", "Dark Stores"],
    location: { state: "Tamil Nadu", district: "Tiruppur" },
    language: "en",
    isDemo: true,
  },

  admin: {
    uid: "demo-admin-001",
    email: "admin@perix.in",
    displayName: "System Administrator",
    role: "admin",
    state: "Tamil Nadu",
    district: "Chennai",
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
    name?: string,
    extraData?: Partial<UserProfile>
  ): Promise<UserProfile> => {
    const profileData: Omit<UserProfile, "uid"> = {
      email: firebaseUser.email || "",
      displayName: name || firebaseUser.displayName || "",
      role,
      state: extraData?.state || "Tamil Nadu",
      district: extraData?.district || "Coimbatore",
      location: {
        state: extraData?.state || "Tamil Nadu",
        district: extraData?.district || "Coimbatore",
      },
      language: extraData?.language || "en",
      photoURL: firebaseUser.photoURL || "",
      isDemo: false,
      isEmailVerified: true,
      createdAt: serverTimestamp(),
      ...extraData,
    };
    try {
      await setDoc(doc(db, "users", firebaseUser.uid), profileData, { merge: true });
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

    // Handle Google redirect result (for signInWithRedirect flow)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setUser(result.user);
          const existingProfile = await fetchProfile(result.user);
          if (existingProfile) {
            setProfile(existingProfile);
          } else {
            // New user from Google redirect — create a profile
            const newProfile = await createProfile(result.user, "farmer", result.user.displayName || "");
            setProfile(newProfile);
          }
        }
      })
      .catch((err) => {
        console.warn("getRedirectResult error (non-fatal):", err);
      });

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
      // Try popup first (works when OAuth redirect URIs are properly configured)
      const result = await signInWithPopup(auth, googleProvider);
      const existingProfile = await fetchProfile(result.user);
      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // New Google user — auto-create farmer profile
        const newProfile = await createProfile(result.user, "farmer", result.user.displayName || "");
        setProfile(newProfile);
      }
    } catch (popupErr: any) {
      // If popup was blocked or closed, try full-page redirect flow
      if (
        popupErr?.code === "auth/popup-closed-by-user" ||
        popupErr?.code === "auth/popup-blocked" ||
        popupErr?.code === "auth/cancelled-popup-request" ||
        popupErr?.code === "auth/unauthorized-domain"
      ) {
        console.warn("Popup failed, trying redirect flow:", popupErr.code);
        try {
          await signInWithRedirect(auth, googleProvider);
          // Page will redirect to Google and come back — result handled in useEffect above
        } catch (redirectErr) {
          console.error("Redirect flow also failed, falling back to demo:", redirectErr);
          loginAsDemo("farmer");
        }
      } else {
        console.error("Google login failed, falling back to demo mode:", popupErr);
        loginAsDemo("farmer");
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    // Clear any previous demo role session
    if (typeof window !== "undefined") {
      localStorage.removeItem("perix_demo_role");
    }

    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    setUser(result.user);
    const existingProfile = await fetchProfile(result.user);
    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      // Fallback: create a basic profile in Firestore if none exists yet
      const newProf = await createProfile(result.user, "farmer", result.user.displayName || "");
      setProfile(newProf);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    extraData?: Partial<UserProfile>
  ): Promise<UserProfile | null> => {
    // Clear demo session if any
    if (typeof window !== "undefined") {
      localStorage.removeItem("perix_demo_role");
    }

    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    const newProfile = await createProfile(result.user, role, name, {
      ...extraData,
      isDemo: false,
      isEmailVerified: true,
    });
    setUser(result.user);
    setProfile(newProfile);
    return newProfile;
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
