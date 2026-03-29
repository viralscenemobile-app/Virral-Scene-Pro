import { Timer, Trophy, ChevronRight, X, Heart, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { UserContext } from "../App";
import { toast } from "sonner";

export function Challenges() {
  const { userId, user } = useContext(UserContext);
  const challenges = useQuery(api.challenges.listActive);
  const pastChallenges = useQuery(api.challenges.listPast);
  const leaderboard = useQuery(api.leaderboard.list);
  const navigate = useNavigate();
  
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const entries = useQuery(api.challenges.getEntries, selectedChallengeId ? { challengeId: selectedChallengeId as any } : "skip" as any);
  const voteEntry = useMutation(api.challenges.voteEntry);
  const createChallenge = useMutation(api.challenges.create);

  const handleVote = async (entryId: string) => {
    if (!userId) return;
    try {
      await voteEntry({ entryId: entryId as any, voterId: userId });
    } catch (e) {
      console.error("Vote failed", e);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;
    const formData = new FormData(e.currentTarget);
    try {
      await createChallenge({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        imageUrl: formData.get("imageUrl") as string,
        prizePool: Number(formData.get("prizePool")),
        entryFee: Number(formData.get("entryFee")),
        endTime: new Date(formData.get("endTime") as string).getTime(),
        creatorId: userId as any,
      });
      toast.success("Challenge created!");
      setIsCreateModalOpen(false);
    } catch (e) {
      console.error("Failed to create challenge", e);
      toast.error("Failed to create challenge");
    }
  };

  return (
    <main className="pt-20 px-4 space-y-8 pb-24 overflow-y-auto no-scrollbar h-screen">
      {/* Section 1: Active Challenges */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xl font-bold font-headline tracking-tight text-on-surface">Active Challenges</h2>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1 text-primary text-sm font-label uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> Create
            </button>
          )}
        </div>
        
        {/* Horizontal Scroll Cards */}
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory no-scrollbar">
          {challenges?.map((challenge) => (
            <div 
              key={challenge._id} 
              onClick={() => setSelectedChallengeId(challenge._id)}
              className="flex-none w-80 snap-center rounded-lg overflow-hidden relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
              <img 
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700" 
                src={challenge.imageUrl || undefined} 
                alt={challenge.title}
              />
              <div className="absolute top-4 right-4 z-20 glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border border-outline-variant/10">
                <Timer className="text-secondary w-4 h-4" />
                <span className="text-[10px] font-label font-bold text-on-surface tracking-tighter">
                  {new Date(challenge.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 z-20 space-y-3">
                <h3 className="text-2xl font-black font-headline text-white leading-tight">{challenge.title}</h3>
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Prize Pool</p>
                    <p className="text-secondary font-bold text-lg">{challenge.prizePool.toLocaleString()} Coins</p>
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/studio?challengeId=${challenge._id}`);
                    }}
                    className="bg-primary text-background font-bold px-4 py-2 rounded-full text-xs shadow-[0_0_15px_rgba(182,160,255,0.3)]"
                  >
                    Join • {challenge.entryFee}
                  </motion.button>
                </div>
              </div>
            </div>
          ))}

          {!challenges && (
            <div className="flex-none w-80 h-96 bg-surface-container-low rounded-lg animate-pulse" />
          )}
        </div>
      </section>

      {/* Create Challenge Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-surface-container-low rounded-[2.5rem] z-[110] p-8 flex flex-col gap-6"
            >
              <h3 className="font-headline font-bold text-xl">Create Challenge</h3>
              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <input name="title" placeholder="Title" className="w-full bg-surface-container-high p-4 rounded-xl" required />
                <textarea name="description" placeholder="Description" className="w-full bg-surface-container-high p-4 rounded-xl" required />
                <input name="imageUrl" placeholder="Image URL" className="w-full bg-surface-container-high p-4 rounded-xl" required />
                <input name="prizePool" type="number" placeholder="Prize Pool" className="w-full bg-surface-container-high p-4 rounded-xl" required />
                <input name="entryFee" type="number" placeholder="Entry Fee" className="w-full bg-surface-container-high p-4 rounded-xl" required />
                <input name="endTime" type="datetime-local" className="w-full bg-surface-container-high p-4 rounded-xl" required />
                <button type="submit" className="w-full py-4 bg-primary text-on-primary rounded-full font-bold">CREATE</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* ... rest of the file ... */}

      {/* Section 2: Past Challenges */}
      {pastChallenges && pastChallenges.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-xl font-bold font-headline tracking-tight text-on-surface">Past Challenges</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {pastChallenges.map((challenge) => (
              <div 
                key={challenge._id}
                onClick={() => setSelectedChallengeId(challenge._id)}
                className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
              >
                <img src={challenge.imageUrl || undefined} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                  <h4 className="text-xs font-bold text-white truncate">{challenge.title}</h4>
                  <p className="text-[8px] font-label text-white/60 uppercase tracking-widest">Ended</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Global Leaderboard */}
      <section className="space-y-6 pb-12">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-xl font-bold font-headline tracking-tight text-on-surface">Global Leaderboard</h2>
          <span className="text-on-surface-variant text-[10px] font-label uppercase tracking-widest">Season 4</span>
        </div>
        <div className="space-y-3">
          {leaderboard?.map((entry, index) => (
            <div 
              key={entry._id} 
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-colors active:bg-surface-container-high",
                index === 0 ? "bg-surface-container-high border border-primary/10" : "bg-surface-container-low"
              )}
            >
              <span className={cn("w-6 text-center font-black font-headline text-xl", index === 0 ? "text-primary" : "text-on-surface-variant")}>
                {index + 1}
              </span>
              <div className="relative">
                <div className={cn("w-12 h-12 rounded-full overflow-hidden p-0.5", index === 0 ? "border-2 border-primary" : "border border-outline-variant/20")}>
                  {entry.user?.avatarUrl ? (
                    <img src={entry.user.avatarUrl || undefined} alt={entry.user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface-container-highest rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                  )}
                </div>
                {index === 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-background w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-container-high">
                    <Trophy className="w-3 h-3 fill-current" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h4 className="font-bold text-on-surface text-sm">@{entry.user?.username || `User_${entry.userId.slice(0, 5)}`}</h4>
                <p className="text-[10px] font-label text-on-surface-variant">{entry.wins} Challenges Won</p>
              </div>
              <div className="text-right">
                <p className={cn("font-black font-headline", index === 0 ? "text-secondary" : "text-on-surface")}>{(entry.points / 1000).toFixed(1)}k</p>
                <p className="text-[8px] font-label text-on-surface-variant uppercase tracking-tighter">Points</p>
              </div>
            </div>
          ))}

          {!leaderboard && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-surface-container-low rounded-lg animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Entries Modal */}
      <AnimatePresence>
        {selectedChallengeId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setSelectedChallengeId(null)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-surface-container-high rounded-t-3xl sm:rounded-3xl h-[80vh] sm:h-[600px] flex flex-col overflow-hidden shadow-2xl border border-outline-variant/10"
            >
              <div className="flex justify-between items-center p-4 border-b border-outline-variant/10">
                <h3 className="font-headline font-bold text-lg">Challenge Entries</h3>
                <button 
                  onClick={() => setSelectedChallengeId(null)}
                  className="p-2 rounded-full bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {entries === undefined ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                    <Trophy className="w-12 h-12" />
                    <p className="font-medium">No entries yet.<br/>Be the first to join!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {entries.map((entry) => (
                      <div key={entry._id} className="relative rounded-xl overflow-hidden group bg-surface-container-lowest">
                        <img 
                          src={entry.creation?.thumbnailUrl || "https://picsum.photos/seed/placeholder/400/600"} 
                          alt="Entry" 
                          className="w-full aspect-[3/4] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <img src={entry.user?.avatarUrl || undefined} alt="" className="w-6 h-6 rounded-full border border-white/20" />
                            <span className="text-[10px] font-bold text-white truncate">@{entry.user?.username}</span>
                          </div>
                          <button 
                            onClick={() => handleVote(entry._id)}
                            className="w-full py-2 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center gap-2 text-white hover:bg-white/30 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span className="text-xs font-bold">{entry.votes}</span>
                          </button>
                        </div>
                        {/* Always visible vote count on mobile */}
                        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 sm:hidden">
                          <Heart className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-bold text-white">{entry.votes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
