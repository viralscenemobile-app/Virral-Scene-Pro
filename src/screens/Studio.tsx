import { Sparkles, Maximize, Timer, Zap, ChevronRight, CheckCircle2, Loader2, Key, Coins, Image as ImageIcon, Video, Upload, Gift, Library, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useContext, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { moderateContent, enhancePrompt } from "@/src/lib/gemini";
import { generateVideo, generateImage, generateVideoFromImage } from "@/src/lib/gemini";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserContext } from "../App";
import { getUploadUrl, getPublicUrl } from "@/src/lib/r2";
import { isCreatorPlus } from "../lib/subscription";

import { toast } from "sonner";

const STYLES = [
  { id: "cinematic", name: "Cinematic", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAg2-t88NeuqjFvHs9G8tqNzuK6nfsnzLizR_udhqdRdVeQfZejosYOYAOqQiNaASBk7B4R1z9eZfWCZjY-iEEDOOm7BwxWpH_Yut_yDAuoNZ0oOAcrFFMlCwvhHkyiUa7CQtXgdzmCJF1UIsM9ZPx4yd-3X7WegMKAqjN_pSdfhWdBCxxbBDAUspZl3iq7HOr-ED3ehfeVwgcjI_wrbbbaGoWPAAkBEDQUAe-ORfUhwdoE9_6HlMzF2fj3WSGA5GG8Qr69UTXY2io" },
  { id: "anime", name: "Anime", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHQeIeMnAf8jx27O4E9NQgDeeIiIX2qIwLUAf76i0sLYuaCNKfk55_cXWfQj4KFWAg4y3e89JRhnvPE281S_m0-3j_Rrrex5P1IYrNxukTyx2WJS89aXO_24c-sMaCGnxCGhOiE5cDNf0XktAvrpzaqigQvEBG4AMq1BzgO9wag_ORT9q-yMhcF_Uoc2nsCDcr0zEdgZGFP7z1YI5ddnzOZIvzZTjx_uvr5u8Z8eQP9LDcvQ5JA3jiA7RCUZJK6WDVzoS5BBIZBnk" },
  { id: "action", name: "Action", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkCCQDe7amauJH_dh2afUz61wYQXBujMLxnEiUWth1fQJuX8aOm0FmYlhvIZ7VSlHc1XcxfFieRSIdGbUe2Yt_WIkoA8S5EIzc0NIYSKTe80zPuVIJtkN-7B5adfTJlHaO2lbdedUQEf1AjnFlDG1nta1ybaUNVTbMWAnXvYXS6vW4fr9310jEhQwUCNl9xnNHiHnDSFQrkdmjGlaqyNvYy0LxLKr2JBc7rXMM7FvLgxlddYmzznfTNY8xnufM4j08GFMn2Z7UTM" },
  { id: "fantasy", name: "Fantasy", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYv1OxqdUiInQf-yEsiPWgdyKU5OdoFLJXN1JuZt0_MIyCO1nAFXrZnyRFj0iiM615O92Nq6rp6jeh_f2lYT-JqIGMVvGblVUOkosbyDVLcoDv6pQx17mWIQEA5iX780cZ-fFdva_5abSrmRGc034jUowN_7AAJYULj9dsjjf-g7aklUzbAX7g5iK5zkEkhW1R2je3bIMkCm2rTlJyiGSTyI_QBG0mXvqv-EHB4tVyqtS1MF88kbCRM3qyOaYZopAjLBJF4ssfYF0" },
];

const COSTS = {
  "text-to-video": 5,
  "text-to-image": 2,
  "image-to-video": 8,
  "direct-upload": 0,
};

const DURATIONS = ["3s", "5s", "10s"];

export function Studio() {
  const { userId } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get("challengeId");
  const [creationMode, setCreationMode] = useState<"single" | "series">("single");
  const [activeTab, setActiveTab] = useState<"text-to-video" | "text-to-image" | "image-to-video" | "direct-upload">("text-to-video");
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("9:16");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>("5s");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Series specific state
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesDescription, setSeriesDescription] = useState("");
  const [seriesCoverImage, setSeriesCoverImage] = useState<File | null>(null);
  const [seriesCoverPreview, setSeriesCoverPreview] = useState<string | null>(null);
  const seriesCoverInputRef = useRef<HTMLInputElement>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const user = useQuery(api.users.getById, userId ? { id: userId } : "skip" as any);
  const subscription = useQuery(api.subscriptions.getActive, userId ? { userId } : "skip" as any);
  const mySeries = useQuery(api.creations.listSeries, userId ? { userId } : "skip" as any);
  const createCreation = useMutation(api.creations.create);
  const createSeries = useMutation(api.creations.createSeries);
  const deductCoins = useMutation(api.users.deductCoins);
  const claimDailyReward = useMutation(api.users.claimDailyReward);

  const isCreator = isCreatorPlus(subscription?.tier);

  useEffect(() => {
    if (subscription === undefined) return;
  }, [subscription]);

  const generateThumbnail = async (videoBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      video.muted = true;
      video.onloadedmetadata = () => {
        video.currentTime = 1; // Seek to 1 second
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to generate thumbnail"));
          URL.revokeObjectURL(video.src);
        }, 'image/jpeg');
      };
      video.onerror = reject;
      video.load();
    });
  };

  useEffect(() => {
    const remixPrompt = searchParams.get("prompt");
    const remixStyle = searchParams.get("style");
    if (remixPrompt) setPrompt(remixPrompt);
    if (remixStyle) setSelectedStyle(remixStyle);
  }, [searchParams]);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleEnhance = async () => {
    if (!prompt || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (e) {
      console.error("Enhance failed:", e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleClaimDaily = async () => {
    if (!userId || isClaiming) return;
    setIsClaiming(true);
    try {
      await claimDailyReward({ id: userId });
      toast.success("Claimed 10 coins! Come back tomorrow for more.");
    } catch (e: any) {
      toast.error(e.message || "Failed to claim reward");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSeriesCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSeriesCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setSeriesCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userId || isGenerating) return;
    
    if (creationMode === "series") {
      if (!seriesTitle || !seriesDescription || !seriesCoverPreview) {
        toast.error("Please fill in all series details and upload a cover image.");
        return;
      }
    }
    
    if (activeTab === "image-to-video" && !selectedImage) {
      toast.error("Please select an image first");
      return;
    }
    
    if (activeTab === "direct-upload" && !selectedImage && !selectedVideo) {
      toast.error("Please select an image or video first");
      return;
    }
    
    if (activeTab !== "image-to-video" && activeTab !== "direct-upload" && !prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    const cost = COSTS[activeTab as keyof typeof COSTS] || 0;
    if (!user || user.coins < cost) {
      toast.error(`Insufficient coins! You need ${cost} coins.`);
      return;
    }

    setIsGenerating(true);
    setGenerationStep("Checking content safety...");
    
    try {
      if (prompt) {
        const isSafe = await moderateContent(prompt);
        if (!isSafe) {
          toast.error("Your prompt violates our safety guidelines. Please modify it and try again.");
          setIsGenerating(false);
          return;
        }
      }

      // 1. Deduct Coins
      setGenerationStep("Initializing...");
      await deductCoins({ id: userId, amount: cost });

      let resultBlob: Blob;
      let mimeType: string;
      let extension: string;

      // 2. Generate Content
      if (activeTab === "text-to-video") {
        setGenerationStep("Generating video...");
        resultBlob = await generateVideo(prompt, aspectRatio as "16:9" | "9:16");
        mimeType = "video/mp4";
        extension = "mp4";
      } else if (activeTab === "text-to-image") {
        setGenerationStep("Generating image...");
        resultBlob = await generateImage(prompt, aspectRatio as any);
        mimeType = "image/png";
        extension = "png";
      } else if (activeTab === "image-to-video") {
        setGenerationStep("Animating image...");
        resultBlob = await generateVideoFromImage(selectedImage!, prompt, aspectRatio as "16:9" | "9:16");
        mimeType = "video/mp4";
        extension = "mp4";
      } else {
        // Direct Upload
        setGenerationStep("Uploading media...");
        const file = selectedImage || selectedVideo!;
        resultBlob = file;
        mimeType = file.type;
        extension = file.name.split('.').pop() || 'mp4';
      }
      
      // 3. Upload to R2
      setGenerationStep("Uploading to storage...");
      const fileName = `creation-${Date.now()}.${extension}`;
      const uploadUrl = await getUploadUrl(fileName, mimeType);
      
      await fetch(uploadUrl, {
        method: "PUT",
        body: resultBlob,
        headers: { "Content-Type": mimeType },
      });

      const publicUrl = getPublicUrl(fileName);
      
      let thumbPublicUrl = publicUrl;
      if (mimeType.startsWith("video/")) {
        setGenerationStep("Generating thumbnail...");
        const thumbBlob = await generateThumbnail(resultBlob);
        const thumbFileName = `thumb-${Date.now()}.jpg`;
        const thumbUploadUrl = await getUploadUrl(thumbFileName, "image/jpeg");
        await fetch(thumbUploadUrl, {
          method: "PUT",
          body: thumbBlob,
          headers: { "Content-Type": "image/jpeg" },
        });
        thumbPublicUrl = getPublicUrl(thumbFileName);
      }

      // 4. Save to Convex
      setGenerationStep("Finalizing...");
      
      let finalSeriesId = selectedSeriesId;
      
      if (creationMode === "series") {
        setGenerationStep("Creating series...");
        // Upload cover image
        const coverFileName = `series-cover-${Date.now()}.jpg`;
        const coverUploadUrl = await getUploadUrl(coverFileName, "image/jpeg");
        const coverResponse = await fetch(seriesCoverPreview!);
        const coverBlob = await coverResponse.blob();
        await fetch(coverUploadUrl, { method: "PUT", body: coverBlob, headers: { "Content-Type": "image/jpeg" } });
        const coverImageUrl = getPublicUrl(coverFileName);
        
        finalSeriesId = await createSeries({
          creatorId: userId,
          title: seriesTitle,
          description: seriesDescription,
          coverImageUrl,
          isPublic: true,
        });
      }
      
      await createCreation({
        userId,
        title: title || "Untitled",
        prompt: activeTab === "direct-upload" ? "Direct Upload" : (prompt || "Untitled Creation"),
        style: selectedStyle,
        videoUrl: (activeTab === "text-to-image" || (activeTab === "direct-upload" && mimeType.startsWith("image/"))) ? "" : publicUrl,
        thumbnailUrl: thumbPublicUrl,
        isTemplate: false,
        ...(challengeId ? { challengeId: challengeId as any } : {}),
        ...(finalSeriesId ? { seriesId: finalSeriesId as any, episodeNumber: creationMode === "series" ? 1 : episodeNumber } : {}),
      });

      toast.success(creationMode === "series" ? "Series and first episode created!" : "Success! Your creation is ready.");
      setPrompt("");
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedVideo(null);
      setVideoPreview(null);
      setTitle("");
      if (creationMode === "series") {
        setSeriesTitle("");
        setSeriesDescription("");
        setSeriesCoverPreview(null);
        setSeriesCoverImage(null);
        setCreationMode("single");
      } else if (selectedSeriesId) {
        setEpisodeNumber(prev => prev + 1);
      }
    } catch (e: any) {
      console.error("Generation failed:", e);
      if (e.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        toast.error("API key error. Please select your key again.");
      } else {
        toast.error("Failed: " + e.message);
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep(null);
    }
  };

  const canClaim = user && (!user.lastRewardClaimedAt || Date.now() - user.lastRewardClaimedAt > 24 * 60 * 60 * 1000);

  return (
    <main className="relative min-h-screen pt-20 pb-24 overflow-hidden px-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-background" />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Stats Banner - Premium Redesign */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-low via-surface-container-low to-surface-container-high p-6 sm:p-8"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-1.5 rounded-lg">
                  <Coins className="text-primary w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface/60">Available Balance</p>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-black text-4xl text-on-surface tracking-tighter">
                  {user?.coins?.toLocaleString() ?? "0,000"}
                </span>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Coins</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {canClaim && (
                <button 
                  onClick={handleClaimDaily}
                  disabled={isClaiming}
                  className="flex-1 sm:flex-none px-6 py-3.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all disabled:opacity-50 active:scale-95"
                >
                  {isClaiming ? "Processing..." : "Claim Daily"}
                </button>
              )}
              <button className="flex-1 sm:flex-none px-6 py-3.5 bg-primary text-on-primary rounded-2xl text-[11px] font-bold uppercase tracking-[0.1em] shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95">
                Add Coins
              </button>
            </div>
          </div>
        </motion.div>

        {/* Generation Banner - Simplified & Professional */}
        <div className="bg-surface-container-low p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
              <Zap className="text-secondary w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-on-surface tracking-tight">System Status</p>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-[8px] font-bold text-primary uppercase tracking-widest">Active</span>
              </div>
              <p className="text-[9px] text-on-surface/40 uppercase tracking-[0.1em]">Gemini 3 Flash Preview • Low Latency</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-lg">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary"></div>
            <span className="text-[9px] font-bold text-on-surface/60 uppercase tracking-[0.2em]">Ready</span>
          </div>
        </div>

        {/* Creation Mode Toggle for Creators */}
        {isCreator && !challengeId && (
          <div className="flex bg-surface-container-low p-1 rounded-xl max-w-sm mx-auto">
            <button
              onClick={() => setCreationMode("single")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                creationMode === "single" ? "bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface/50 hover:text-on-surface"
              )}
            >
              Single Creation
            </button>
            <button
              onClick={() => {
                setCreationMode("series");
                if (activeTab === "text-to-image") setActiveTab("text-to-video");
              }}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                creationMode === "series" ? "bg-surface-container-high text-on-surface shadow-sm" : "text-on-surface/50 hover:text-on-surface"
              )}
            >
              New Series
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className={cn(
          "grid gap-3 bg-surface-container-low p-2 rounded-2xl w-full max-w-sm mx-auto",
          creationMode === "series" ? "grid-cols-3" : "grid-cols-2"
        )}>
          <button 
            onClick={() => setActiveTab("text-to-video")}
            className={cn(
              "h-20 rounded-xl font-headline text-xs font-bold transition-all p-2 flex items-center justify-center text-center",
              activeTab === "text-to-video" 
                ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/20" 
                : "bg-surface-container-high text-on-surface/50 hover:text-on-surface hover:bg-surface-container-highest"
            )}
          >
            Text → Video
          </button>
          {creationMode === "single" && (
            <button 
              onClick={() => setActiveTab("text-to-image")}
              className={cn(
                "h-20 rounded-xl font-headline text-xs font-bold transition-all p-2 flex items-center justify-center text-center",
                activeTab === "text-to-image" 
                  ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/20" 
                  : "bg-surface-container-high text-on-surface/50 hover:text-on-surface hover:bg-surface-container-highest"
              )}
            >
              Text → Image
            </button>
          )}
          {(creationMode === "single" || isCreator) && (
            <button 
              onClick={() => setActiveTab("image-to-video")}
              className={cn(
                "h-20 rounded-xl font-headline text-xs font-bold transition-all p-2 flex items-center justify-center text-center",
                activeTab === "image-to-video" 
                  ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-red-500/20" 
                  : "bg-surface-container-high text-on-surface/50 hover:text-on-surface hover:bg-surface-container-highest"
              )}
            >
              Image → Video
            </button>
          )}
          {(creationMode === "single" || isCreator) && (
            <button 
              onClick={() => setActiveTab("direct-upload")}
              className={cn(
                "h-20 rounded-xl font-headline text-xs font-bold transition-all p-2 flex items-center justify-center text-center",
                activeTab === "direct-upload" 
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-teal-500/20" 
                  : "bg-surface-container-high text-on-surface/50 hover:text-on-surface hover:bg-surface-container-highest"
              )}
            >
              Direct Upload
            </button>
          )}
        </div>

        {/* Series Selection for Creators */}
        {isCreator && creationMode === "single" && mySeries && mySeries.length > 0 && (
          <section className="space-y-4">
            <label className="block text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Add to Series (Optional)</label>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button 
                onClick={() => setSelectedSeriesId(null)}
                className={cn(
                  "flex-none px-4 py-2 rounded-full text-xs font-bold border transition-all",
                  selectedSeriesId === null ? "bg-primary text-on-primary border-primary" : "bg-surface-container-low text-on-surface/60 border-outline-variant/20"
                )}
              >
                Standalone
              </button>
              {mySeries.map(s => (
                <button 
                  key={s._id}
                  onClick={() => setSelectedSeriesId(s._id)}
                  className={cn(
                    "flex-none px-4 py-2 rounded-full text-xs font-bold border transition-all",
                    selectedSeriesId === s._id ? "bg-secondary text-on-secondary border-secondary" : "bg-surface-container-low text-on-surface/60 border-outline-variant/20"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
            {selectedSeriesId && (
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest">Episode Number</p>
                  <input 
                    type="number" 
                    value={episodeNumber} 
                    onChange={(e) => setEpisodeNumber(parseInt(e.target.value))}
                    className="bg-transparent border-none focus:ring-0 text-lg font-bold w-full"
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {/* Mode Specific Inputs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + creationMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {creationMode === "series" && (
              <section className="space-y-6">
                <div className="bg-surface-container-low rounded-2xl p-6 space-y-6">
                  <div className="space-y-4">
                    <label className="block text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Series Cover Image</label>
                    <div 
                      onClick={() => seriesCoverInputRef.current?.click()}
                      className="relative aspect-[16/9] rounded-xl bg-surface-container-high flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-highest transition-all overflow-hidden group"
                    >
                      {seriesCoverPreview ? (
                        <img src={seriesCoverPreview || undefined} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-on-surface/20 mx-auto mb-2" />
                          <p className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest">Upload Cover</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={seriesCoverInputRef} 
                        onChange={handleSeriesCoverSelect} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Series Title</label>
                    <input 
                      type="text"
                      className="w-full bg-surface-container-high p-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none text-lg font-bold"
                      placeholder="e.g. The Lost Kingdom"
                      value={seriesTitle}
                      onChange={(e) => setSeriesTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Description</label>
                    <textarea 
                      className="w-full bg-surface-container-high p-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm leading-relaxed resize-none"
                      placeholder="What is this series about?"
                      rows={4}
                      value={seriesDescription}
                      onChange={(e) => setSeriesDescription(e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "image-to-video" && (
              <section className="space-y-4">
                <label className="block text-primary text-xs font-bold uppercase tracking-widest">Source Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-video rounded-2xl bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-all overflow-hidden group"
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview || undefined} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white w-8 h-8" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="text-on-surface/20 w-10 h-10 mb-2" />
                      <p className="text-on-surface/40 text-sm">Click to upload image</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </section>
            )}

            {activeTab === "direct-upload" && (
              <section className="space-y-4">
                <label className="block text-primary text-xs font-bold uppercase tracking-widest">Upload Media</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-video rounded-2xl bg-surface-container-low flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-all overflow-hidden group"
                >
                  {imagePreview || videoPreview ? (
                    <>
                      {imagePreview && <img src={imagePreview || undefined} alt="Preview" className="w-full h-full object-cover" />}
                      {videoPreview && <video src={videoPreview || undefined} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white w-8 h-8" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="text-on-surface/20 w-10 h-10 mb-2" />
                      <p className="text-on-surface/40 text-sm">Click to upload image/video</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.type.startsWith("image/")) {
                          setSelectedImage(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result as string);
                          reader.readAsDataURL(file);
                          setVideoPreview(null);
                          setSelectedVideo(null);
                          
                          const img = new Image();
                          img.onload = () => {
                            const ratio = img.width / img.height;
                            if (ratio > 1.2) setAspectRatio("16:9");
                            else if (ratio < 0.8) setAspectRatio("9:16");
                            else setAspectRatio("1:1");
                          };
                          img.src = URL.createObjectURL(file);
                          setDuration("N/A");
                        } else if (file.type.startsWith("video/")) {
                          setSelectedVideo(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setVideoPreview(reader.result as string);
                          reader.readAsDataURL(file);
                          setImagePreview(null);
                          setSelectedImage(null);
                          
                          const video = document.createElement('video');
                          video.onloadedmetadata = () => {
                            const ratio = video.videoWidth / video.videoHeight;
                            if (ratio > 1.2) setAspectRatio("16:9");
                            else if (ratio < 0.8) setAspectRatio("9:16");
                            else setAspectRatio("1:1");
                            setDuration(`${Math.round(video.duration)} Seconds`);
                          };
                          video.src = URL.createObjectURL(file);
                        }
                      }
                    }} 
                    accept="image/*,video/*" 
                    className="hidden" 
                  />
                </div>
              </section>
            )}

            {/* Title Input */}
            <section className="space-y-4">
              <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
                <label className="block text-primary text-[10px] font-bold uppercase tracking-[0.2em]">Title</label>
                <input 
                  type="text"
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-lg placeholder:text-on-surface/20"
                  placeholder="Give your creation a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </section>

            {/* Prompt Input */}
            {activeTab !== "direct-upload" && (
              <section className="space-y-4">
                <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
                  <label className="block text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
                    {activeTab === "image-to-video" ? "Animation Instructions (Optional)" : "Prompt"}
                  </label>
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-lg placeholder:text-on-surface/20 resize-none leading-relaxed" 
                    placeholder={activeTab === "image-to-video" ? "How should the image move?" : "Describe what you want to create..."} 
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="flex justify-between items-center pt-2">
                    <button 
                      onClick={handleEnhance}
                      disabled={isEnhancing || !prompt}
                      className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-secondary rounded-xl transition-all group/btn disabled:opacity-50"
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isEnhancing ? "ENHANCING..." : "AI ENHANCE"}
                      </span>
                    </button>
                    <span className="text-on-surface/30 text-[10px]">{prompt.length} / 500</span>
                  </div>
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Art Style */}
        {activeTab !== "direct-upload" && activeTab !== "series" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">Art Style</h3>
              <button className="text-secondary text-sm font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2 no-scrollbar">
              {STYLES.map((style) => (
                <div 
                  key={style.id} 
                  className="flex-none w-32 space-y-2 cursor-pointer group"
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <div className={cn(
                    "relative aspect-[4/5] rounded-xl overflow-hidden transition-all duration-300",
                    selectedStyle === style.id ? "scale-105" : "opacity-70 hover:opacity-100"
                  )}>
                    <img src={style.image || undefined} alt={style.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                    {selectedStyle === style.id && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="text-white w-6 h-6 fill-primary" />
                      </div>
                    )}
                  </div>
                  <p className={cn(
                    "text-center text-xs",
                    selectedStyle === style.id ? "font-bold text-on-surface" : "font-medium text-on-surface/50"
                  )}>{style.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Settings */}
        {activeTab !== "series" && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded-lg flex items-center justify-between group cursor-pointer hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-3">
                <Maximize className="text-primary w-5 h-5" />
                <div>
                  <p className="text-sm font-bold">Aspect Ratio</p>
                  {activeTab === "direct-upload" ? (
                    <p className="text-xs text-on-surface/40">{aspectRatio}</p>
                  ) : (
                    <div className="flex gap-2 mt-1">
                      {["16:9", "9:16", "1:1"].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio as any)}
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                            aspectRatio === ratio ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface/50"
                          )}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {activeTab !== "text-to-image" && (
              <div className="p-4 bg-surface-container-low rounded-lg flex items-center justify-between group cursor-pointer hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-3">
                  <Timer className="text-primary w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">Duration</p>
                    {activeTab === "direct-upload" ? (
                      <p className="text-xs text-on-surface/40">{duration}</p>
                    ) : (
                      <div className="flex gap-2 mt-1">
                        {DURATIONS.map((d) => (
                          <button
                            key={d}
                            onClick={() => setDuration(d)}
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
                              duration === d ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface/50"
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Generate Button */}
        <div className="pt-6">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerate}
            disabled={isGenerating || 
              ((activeTab === "text-to-video" || activeTab === "text-to-image") && !prompt) || 
              (activeTab === "image-to-video" && !selectedImage) || 
              (activeTab === "direct-upload" && !selectedImage && !selectedVideo) ||
              (activeTab === "series" && (!seriesTitle || !seriesDescription || !imagePreview))
            }
            className="w-full py-5 rounded-full bg-primary text-on-primary text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              activeTab === "series" ? <PlusCircle className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />
            )}
            {isGenerating ? generationStep : (
              activeTab === "direct-upload" ? "Upload" : 
              activeTab === "series" ? "Create Series" : 
              `Generate (${COSTS[activeTab as keyof typeof COSTS]} Coins)`
            )}
          </motion.button>
          <p className="text-center mt-4 text-xs text-on-surface/30">
            Average generation time: <span className="text-secondary">120s</span>
          </p>
        </div>
      </div>
    </main>
  );
}
