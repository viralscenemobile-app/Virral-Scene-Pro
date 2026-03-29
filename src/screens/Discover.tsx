import { Search, Play, ChevronRight, Verified, Sparkles, Loader2, Zap, UserPlus, UserCheck } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import { Id } from "../../convex/_generated/dataModel";

function FollowButton({ creatorId }: { creatorId: Id<"users"> }) {
  const { userId } = useContext(UserContext);
  const isFollowing = useQuery(api.interactions.checkFollow, userId ? { followerId: userId, followingId: creatorId } : "skip" as any);
  const toggleFollow = useMutation(api.interactions.toggleFollow);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    try {
      await toggleFollow({ followerId: userId, followingId: creatorId });
    } catch (e) {
      console.error("Follow failed", e);
    }
  };

  if (userId === creatorId) return null;

  return (
    <button 
      onClick={handleFollow}
      className={cn(
        "mt-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1",
        isFollowing ? "bg-surface-container-highest text-on-surface-variant" : "bg-primary text-background"
      )}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-3 h-3" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-3 h-3" />
          Follow
        </>
      )}
    </button>
  );
}

const CREATORS = [
  { id: 1, name: "@nebula_edit", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfkGWiteYlN-JlMpX-PDG3AgquQ6No-ruEf_Ze7eHaLT9ZHUf60-UhPdjv43zs_5g8SOiIE6YA4Y_9-SBumiLc3vHI5-pYeui-3qdq5PJMhssJIhsOAdmQTEtFj9Gy9ZKwgShY89bF28kE6WfszHczoR8nfWon0SG1LjDdXFKPJMv77hPWd0-_xRqyydx51AaRwWvncd-x8Q34bY1RTntKkxaMbHDGZRUzRpcEQoyD-jJ5Y3HatxhSSWczKWsY4hWQW-dZGiqU4f8", gradient: "from-primary to-secondary" },
  { id: 2, name: "@cinematic_ai", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKVzO8wGzLWnT_yivR2XxqIZsJlGbsIrbL-eBvqCV_64RekShcl3f0WWU9MXHyshtiXvd5MaCEiJDvHMuLuxLq7InU-51e99QA0cW2EfAqigal-03f4w0QroidTZ_Bhn6EvgnQ_ySpbx8iVO_ZOnYFKyVO2XbmmkYAmFMVeLsv-EsLoiPlU9B9zFdMJqanZMN9tpLjPgsBBz5jMr0wuk0orZxUC8AzqAr0TwBLxJ1CYwtFQdfhn7PM-DQRwJwnYRThQZPtwyX9kVM", gradient: "from-primary-dim to-tertiary" },
  { id: 3, name: "@viral_flow", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGlzH00Uw0X1aKjZ0VVHj9zyVAemB47gQKsBwoJA0PR_g_jKaphXfvVbFflM40v1bKF2cnt6Ij8KR4hLhbUS5Y09UphyI70WN7h8SEZESj6vpPWk6QT_9jVvZ4XEmu5ZxRIMsvX8O46GpqS4bXY7fkpLJEhZZktjpYAJLG-K7rsH0aMxkK30kE1Vt_nPdySAB_0sUYxfhFzJQMhs5EQB_yx_Nh35oJUeo2Mja3VZLoa54RNlFAs6xpUrn5GsagSOgX0KOHj36m-dA", gradient: "from-outline-variant/30 to-outline-variant/30" },
];

const CATEGORIES = [
  { id: "cinematic", name: "Cinematic", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXw3AcI_WU4rZyv-ArTJalcYvC5WseWblnAvQuJ4SE3gG7B4Adz8v5lhaNQ9XWb1WVbGnkCPmxpdRxetbKtXjAKPD0hs35DErsqUEpf3wXatqT2WeAcL9rr-G4nPwHovBBKKx_SJwjkvPjI5mWwD9b7hkilvG5moPwiZynaYTUb5jbLSQhuuFG4HmamAOyXH03OI7CHd_LgrxeVnqzPunsS-H0ph3FqPew1YyfzRhzs7y6JEmeMrNq4akT3VnYaiNUmnv-LrRF_Zg" },
  { id: "anime", name: "Anime", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTK12hYWwJwu7i5IdcjwmAOHxZQks05RTL1cWzye2UGKBVaRODIprqyCp3WzycgzrdV18USSLdc4YR82XQDqNuIgaBPrOMgTJVtpjlhb9QQioPjPjeVTxxVzbf_pnoWkEVbsvgqP6OgrJEAANtutD0flQ-YJZkpa_jesCFBHD75QrHfn3yPSJL8TDnt1KKriELmFXhQSGSbgkYBOYx6Js-N8jjQZv8LTAb0f_GwaQVyZyeOrTYBu4tq3rDrHtrWh1aE0HXioWfLMU" },
  { id: "comedy", name: "Comedy", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_lE4Zzeqz_QygwCUcWssf5J7J7W3eY1Wboipws2pXODwZwZxZiV_NDpn_Wrb1X6JP9zQZJxNsJNcAIFOKPX78x70-myPkuUEmXPTtuzhzpfCKTokr6iE8tYwEN-S4TOdvcRZ-KX6FOnEjAFJEFHW_FlsOVed96EhQG2Yjwer1GfMhmnM08PmZJ4jagNBOw_PQO0rJRhoX4vswAEE1ma9JctrJkfLY7Bn_sqY6Q1ExQsCDVw3p224XBSG4LfKF5HFTrqArIADnNOY" },
];

export function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Trending");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const trendingCreations = useQuery(api.creations.list, {});
  const searchResults = useQuery(api.creations.search, debouncedQuery ? { query: debouncedQuery } : "skip" as any);
  const activeChallenges = useQuery(api.challenges.listActive);
  const templates = useQuery(api.creations.listTemplates, {});
  const realCreators = useQuery(api.users.listCreators, { limit: 10 });

  const creationsToDisplay = debouncedQuery ? searchResults : trendingCreations;

  return (
    <main className="pt-20 px-4 pb-24 overflow-y-auto no-scrollbar h-screen">
      {/* Search & Filters */}
      <section className="mb-8">
        <div className="relative w-full mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input 
            className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary transition-all" 
            placeholder="Search viral scenes..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {debouncedQuery && !searchResults && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {["Trending", "Challenges", "New", "Following", "AI Studio"].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all",
                activeCategory === cat ? "bg-primary text-background" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Challenges Section */}
      {activeCategory === "Challenges" && !debouncedQuery && (
        <section className="mb-10 space-y-4">
          <h2 className="font-headline text-xl font-bold tracking-tight px-2">Active Challenges</h2>
          <div className="space-y-4">
            {activeChallenges?.map((challenge) => (
              <div 
                key={challenge._id}
                className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/studio?challengeId=${challenge._id}`)}
              >
                <img src={challenge.imageUrl || undefined} alt={challenge.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-headline font-bold text-xl text-white mb-1">{challenge.title}</h3>
                      <p className="text-white/70 text-sm line-clamp-1">{challenge.description}</p>
                    </div>
                    <div className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-sm shadow-lg">
                      {challenge.prizePool} 🪙
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {activeChallenges?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant gap-4 opacity-50">
                <Sparkles className="w-12 h-12" />
                <p className="font-label uppercase tracking-widest text-xs">No active challenges right now.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Templates Section */}
      {activeCategory === "Trending" && !debouncedQuery && (
        <section className="mb-10">
          <div className="flex justify-between items-end px-2 mb-4">
            <h2 className="font-headline text-xl font-bold tracking-tight">Viral Templates</h2>
            <span className="text-secondary text-[10px] font-label uppercase tracking-widest">Remix Now</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-2">
            {templates?.map((template) => (
              <div 
                key={template._id}
                onClick={() => navigate(`/studio?prompt=${encodeURIComponent(template.prompt)}&style=${template.style}&templateId=${template._id}`)}
                className="flex-none w-40 space-y-2 group cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-outline-variant/10 bg-surface-container-high flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-on-surface-variant/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white">
                      <Zap className="w-3 h-3 fill-current text-primary" />
                      {template.usageCount}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] font-medium text-on-surface-variant truncate px-1">{template.prompt}</p>
              </div>
            ))}
            {!templates && (
              <div className="flex gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-40 aspect-[3/4] bg-surface-container-low rounded-2xl animate-pulse" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      {/* Featured Creator Carousel */}
      {!debouncedQuery && activeCategory === "Trending" && (
        <section className="mb-10">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="font-headline text-xl font-bold tracking-tight">Featured Creators</h2>
            <span className="text-secondary text-sm font-medium">View all</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-2">
            {realCreators?.map((creator) => (
              <div 
                key={creator._id} 
                className="flex-shrink-0 w-32 flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div 
                  onClick={() => navigate(`/profile?username=${creator.username}`)}
                  className={cn("w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary")}
                >
                  <img 
                    src={creator.avatarUrl || undefined} 
                    alt={creator.username} 
                    className="w-full h-full rounded-full object-cover border-4 border-background group-hover:scale-105 transition-transform" 
                  />
                </div>
                <div className="flex flex-col items-center w-full">
                  <span className="text-xs font-label text-center font-medium truncate w-full">@{creator.username}</span>
                  <FollowButton creatorId={creator._id} />
                </div>
              </div>
            ))}
            {!realCreators && (
              <div className="flex gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-24 h-24 rounded-full bg-surface-container-low animate-pulse" />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories Bento-style */}
      {!debouncedQuery && (
        <section className="mb-10">
          <h2 className="font-headline text-xl font-bold tracking-tight mb-4 px-2">Categories</h2>
          <div className="grid grid-cols-2 gap-3 h-64">
            <div 
              onClick={() => setSearchQuery("Cinematic")}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img 
                src={CATEGORIES[0].image || undefined} 
                alt="Cinematic" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <span className="font-headline font-bold text-lg">Cinematic</span>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-3">
              <div 
                onClick={() => setSearchQuery("Anime")}
                className="relative rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img 
                  src={CATEGORIES[1].image || undefined} 
                  alt="Anime" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                  <span className="font-headline font-bold text-sm">Anime</span>
                </div>
              </div>
              <div 
                onClick={() => setSearchQuery("Comedy")}
                className="relative rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img 
                  src={CATEGORIES[2].image || undefined} 
                  alt="Comedy" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                  <span className="font-headline font-bold text-sm">Comedy</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results / Trending */}
      {(activeCategory !== "Challenges" || debouncedQuery) && (
        <section className="mb-8">
          <h2 className="font-headline text-xl font-bold tracking-tight mb-4 px-2">
            {debouncedQuery ? `Results for "${debouncedQuery}"` : "Trending Templates"}
          </h2>
          
          {creationsToDisplay && creationsToDisplay.length > 0 ? (
            <div className="columns-2 gap-3 space-y-3">
              {creationsToDisplay.map((creation) => (
                <div 
                  key={creation._id} 
                  onClick={() => navigate(`/feed?id=${creation._id}`)}
                  className="relative rounded-2xl overflow-hidden glass-panel group break-inside-avoid cursor-pointer bg-surface-container-high aspect-[3/4] flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-on-surface-variant/20" />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                    <Play className="w-3 h-3 text-secondary fill-current" />
                    <span className="text-[10px] font-label font-bold text-on-surface">{(creation.views / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                    <p className="text-xs font-medium text-on-surface truncate">{creation.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : creationsToDisplay?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-4 opacity-50">
              <Sparkles className="w-12 h-12" />
              <p className="font-label uppercase tracking-widest text-xs">No scenes found matching your search.</p>
            </div>
          ) : (
            <div className="columns-2 gap-3 space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-48 bg-surface-container-low rounded-2xl animate-pulse break-inside-avoid" />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
