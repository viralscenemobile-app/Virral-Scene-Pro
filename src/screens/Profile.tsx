import { Verified, CircleDollarSign, Wand2, Rocket, Award, Grid, Layers, Plus, MapPin, Link as LinkIcon, Settings, LogOut, X, Camera, Bookmark, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import React, { useState, useContext, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserContext } from "../App";
import { logOut } from "@/src/lib/firebase";
import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

const ACHIEVEMENTS = [
  { id: 1, name: "Top Creator", icon: Award, color: "text-primary", bg: "from-primary/20 to-secondary/20", shadow: "shadow-[0_0_15px_rgba(182,160,255,0.2)]" },
  { id: 2, name: "Remix King", icon: Wand2, color: "text-tertiary", bg: "from-tertiary/20 to-primary/20", shadow: "shadow-[0_0_15px_rgba(255,94,214,0.2)]" },
  { id: 3, name: "Early Adopter", icon: Rocket, color: "text-secondary", bg: "from-secondary/20 to-primary/20", shadow: "shadow-[0_0_15px_rgba(0,227,253,0.2)]" },
];

export function Profile() {
  const { userId, user, firebaseUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("creations");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", bio: "", avatarUrl: "" });
  
  const userCreations = useQuery(api.creations.listByUser, userId ? { userId } : "skip" as any);
  const userTemplates = useQuery(api.creations.listTemplatesByUser, userId ? { userId } : "skip" as any);
  const bookmarkedCreations = useQuery(api.creations.listBookmarked, userId ? { userId } : "skip" as any);
  const updateUser = useMutation(api.users.update);
  const createTemplate = useMutation(api.creations.createTemplate);

  const handleCreateTemplate = async (creation: any) => {
    if (!userId) return;
    try {
      await createTemplate({
        creatorId: userId,
        prompt: creation.prompt,
        style: creation.style,
        thumbnailUrl: creation.thumbnailUrl,
        structuredPrompt: JSON.stringify({
          prompt: creation.prompt,
          style: creation.style,
          aspectRatio: "9:16"
        })
      });
      toast.success("Template created successfully! Other users can now remix your scene.");
    } catch (e) {
      console.error("Failed to create template:", e);
      toast.error("Failed to create template.");
    }
  };

  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || ""
      });
    }
  }, [user]);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logOut();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await updateUser({
        id: userId,
        ...editForm
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile: " + (error as Error).message);
    }
  };

  if (!user && !firebaseUser) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-mono text-sm tracking-widest opacity-50 uppercase">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-20 px-4 max-w-md mx-auto pb-24 overflow-y-auto no-scrollbar h-screen">
      {/* Header Section: Avatar & Bio */}
      <section className="flex flex-col items-center mt-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-tr from-primary via-secondary to-tertiary rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-28 h-28 rounded-full p-1 bg-background">
            <img 
              src={user?.avatarUrl || firebaseUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser?.uid}` || undefined} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover border-2 border-surface" 
            />
          </div>
          {user?.verified && (
            <div className="absolute bottom-1 right-1 bg-secondary w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface shadow-lg">
              <Verified className="w-3.5 h-3.5 text-background fill-current" />
            </div>
          )}
        </div>
        <h1 className="mt-4 text-2xl font-headline font-extrabold tracking-tight">
          {user?.username ? `@${user.username}` : firebaseUser?.displayName || "User"}
        </h1>
        <p className="text-on-surface-variant text-center mt-2 px-6 text-sm leading-relaxed">
          {user?.bio || "Architect of digital dreams. 🌌"}
        </p>
        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-full font-label text-sm font-semibold hover:bg-surface-container-highest transition-colors active:scale-95"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => navigate("/subscription")}
            className="px-6 py-2.5 bg-primary text-background border border-primary/30 rounded-full font-label text-sm font-semibold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
          >
            <Zap className="w-4 h-4 fill-current" />
            Upgrade
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-8 grid grid-cols-3 gap-2 px-2">
        <div className="bg-surface-container-low p-4 rounded-lg flex flex-col items-center justify-center">
          <span className="text-xl font-headline font-bold text-on-surface">
            {user?.followers > 1000 ? `${(user.followers / 1000).toFixed(1)}K` : user?.followers || 0}
          </span>
          <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mt-1">Followers</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-lg flex flex-col items-center justify-center">
          <span className="text-xl font-headline font-bold text-on-surface">{user?.following || 0}</span>
          <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mt-1">Following</span>
        </div>
        <div className="bg-gradient-to-br from-surface-container-high to-surface-container-low p-4 rounded-lg flex flex-col items-center justify-center border border-primary/10">
          <div className="flex items-center gap-1">
            <CircleDollarSign className="text-primary w-5 h-5 fill-current" />
            <span className="text-xl font-headline font-bold text-primary">{user?.coins || 0}</span>
          </div>
          <span className="text-[10px] font-label uppercase tracking-widest text-primary/70 mt-1">Coins</span>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="mt-10">
        <h3 className="px-2 text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant mb-4">Achievements</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 px-2 no-scrollbar">
          {ACHIEVEMENTS.map((item, index) => (
            <div key={item.id} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className={cn(
                "w-14 h-14 rounded-full bg-gradient-to-tr flex items-center justify-center border",
                item.bg,
                item.shadow,
                index === 0 ? "border-primary/30" : index === 1 ? "border-tertiary/30" : "border-secondary/30"
              )}>
                <item.icon className={cn("w-6 h-6 fill-current", item.color)} />
              </div>
              <span className="text-[10px] font-label text-on-surface-variant">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Content Tabs */}
      <section className="mt-10">
        <div className="flex p-1 bg-surface-container-low rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab("creations")}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-center gap-2 transition-all",
              activeTab === "creations" ? "bg-surface-container-high text-secondary" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Grid className="w-4 h-4 fill-current" />
            Creations
          </button>
          <button 
            onClick={() => setActiveTab("templates")}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all",
              activeTab === "templates" ? "bg-surface-container-high text-secondary" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Layers className="w-4 h-4" />
            Templates
          </button>
          <button 
            onClick={() => setActiveTab("bookmarks")}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all",
              activeTab === "bookmarks" ? "bg-surface-container-high text-secondary" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Bookmark className="w-4 h-4" />
            Saved
          </button>
        </div>
        
        {/* Bento Grid Content */}
        <div className="grid grid-cols-2 gap-3 mb-12">
          {activeTab === "creations" && userCreations?.map((creation) => (
            <div 
              key={creation._id} 
              className="aspect-[9/16] rounded-lg overflow-hidden relative group cursor-pointer bg-surface-container-high flex items-center justify-center"
              onClick={() => navigate(`/feed?id=${creation._id}`)}
            >
              <Sparkles className="w-8 h-8 text-on-surface/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                {!creation.isTemplate && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateTemplate(creation);
                    }}
                    className="w-full bg-primary text-background py-2 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 shadow-lg"
                  >
                    Make Template
                  </button>
                )}
                <div className="flex items-center gap-1 text-xs font-label text-white">
                  <Rocket className="w-3.5 h-3.5 fill-current" />
                  {creation.views}
                </div>
              </div>
            </div>
          ))}

          {activeTab === "templates" && userTemplates?.map((template) => (
            <div 
              key={template._id} 
              className="aspect-[9/16] rounded-lg overflow-hidden relative group cursor-pointer bg-surface-container-high flex items-center justify-center"
              onClick={() => navigate(`/studio?prompt=${encodeURIComponent(template.prompt)}&style=${template.style}&templateId=${template._id}`)}
            >
              <Sparkles className="w-8 h-8 text-on-surface/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <div className="flex items-center gap-1 text-xs font-label text-white">
                  <Zap className="w-3.5 h-3.5 fill-current text-primary" />
                  {template.usageCount} Uses
                </div>
              </div>
            </div>
          ))}

          {activeTab === "creations" && userCreations?.length === 0 && (
            <div className="col-span-2 py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-on-surface/20" />
              </div>
              <p className="font-label text-sm text-on-surface/40">No creations yet. Start generating!</p>
            </div>
          )}

          {activeTab === "templates" && userTemplates?.length === 0 && (
            <div className="col-span-2 py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto">
                <Layers className="w-8 h-8 text-on-surface/20" />
              </div>
              <p className="font-label text-sm text-on-surface/40">No templates created yet.</p>
            </div>
          )}

          {activeTab === "bookmarks" && bookmarkedCreations?.map((creation) => (
            <div key={creation._id} className="aspect-[9/16] rounded-lg overflow-hidden relative group cursor-pointer bg-surface-container-high flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-on-surface/20" />
              <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-1 text-xs font-label">
                  <Rocket className="w-3.5 h-3.5 fill-current" />
                  {creation.views}
                </div>
              </div>
            </div>
          ))}

          {activeTab === "bookmarks" && bookmarkedCreations?.length === 0 && (
            <div className="col-span-2 py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto">
                <Bookmark className="w-8 h-8 text-on-surface/20" />
              </div>
              <p className="font-label text-sm text-on-surface/40">No saved scenes yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-surface-container-low rounded-[2.5rem] z-[110] p-8 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-bold text-xl">Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20">
                    <img src={editForm.avatarUrl || user?.avatarUrl || undefined} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-6 h-6" />
                  </div>
                </div>
                <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Change Avatar</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label uppercase tracking-widest text-primary font-bold ml-1">Username</label>
                  <input 
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full bg-surface-container-high border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Enter username..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label uppercase tracking-widest text-primary font-bold ml-1">Bio</label>
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-surface-container-high border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-sm shadow-lg active:scale-95 transition-all mt-4"
                >
                  SAVE CHANGES
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
