import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./lib/firebase";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

import { Settings } from "./screens/Settings";
import { Feed } from "./screens/Feed";
import { Studio } from "./screens/Studio";
import { Discover } from "./screens/Discover";
import { Challenges } from "./screens/Challenges";
import { Profile } from "./screens/Profile";
import { Subscription } from "./screens/Subscription";
import { Auth } from "./screens/Auth";
import { Notifications } from "./screens/Notifications";
import { BottomNav } from "./components/BottomNav";
import { TopNav } from "./components/TopNav";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.warn("VITE_CONVEX_URL is not defined. Falling back to default Convex URL.");
}
const convex = new ConvexReactClient(convexUrl || "https://handsome-squid-70.convex.cloud/");

// User Context
interface UserContextType {
  userId: Id<"users"> | null;
  user: any | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
}
export const UserContext = createContext<UserContextType>({ 
  userId: null, 
  user: null, 
  firebaseUser: null, 
  isLoading: true 
});

function AppContent() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  
  // Fetch user data if we have a userId
  const user = useQuery(api.users.getById, userId ? { id: userId } : "skip" as any);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const id = await getOrCreateUser({
            firebaseUid: user.uid,
            username: user.displayName?.replace(/\s+/g, '_').toLowerCase() || `user_${user.uid.slice(0, 5)}`,
            avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          });
          setUserId(id);
        } catch (e) {
          console.error("Failed to init user in Convex:", e);
        }
      } else {
        setUserId(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [getOrCreateUser]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-headline font-bold tracking-widest uppercase text-xs">Initializing ViralScene...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Auth />;
  }

  return (
    <UserContext.Provider value={{ userId, user, firebaseUser, isLoading: isLoadingAuth }}>
      <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary selection:text-background flex flex-col overflow-hidden">
        <TopNav />
        <div className="flex-1 relative overflow-hidden">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </UserContext.Provider>
  );
}

export default function App() {
  return (
    <ConvexProvider client={convex}>
      <Router>
        <AppContent />
      </Router>
    </ConvexProvider>
  );
}
