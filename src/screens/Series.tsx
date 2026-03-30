import { ArrowLeft, Play, Share2, Sparkles, Layers, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function Series() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const series = useQuery(api.creations.getSeries, id ? { seriesId: id as Id<"series"> } : "skip" as any);

  if (series === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-mono text-sm tracking-widest opacity-50 uppercase">Loading Series...</p>
        </div>
      </div>
    );
  }

  if (series === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Layers className="h-12 w-12 text-on-surface/20" />
          <p className="font-mono text-sm tracking-widest opacity-50 uppercase">Series not found</p>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header Image */}
      <div className="relative h-64 md:h-80 w-full">
        <img 
          src={series.coverImageUrl} 
          alt={series.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* Series Info */}
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-headline font-black text-white tracking-tight">
            {series.title}
          </h1>
          <p className="text-on-surface/80 text-sm md:text-base leading-relaxed max-w-2xl">
            {series.description}
          </p>
          
          <div className="flex items-center gap-4 pt-2">
            <button 
              onClick={() => {
                if (series.episodes && series.episodes.length > 0) {
                  navigate(`/feed?id=${series.episodes[0]._id}`);
                }
              }}
              disabled={!series.episodes || series.episodes.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              Play First Episode
            </button>
            <button className="p-3 bg-surface-container-high rounded-full text-on-surface hover:bg-surface-container-highest transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Episodes List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Episodes</h2>
            <span className="text-sm font-medium text-on-surface/60">{series.episodes?.length || 0} Episodes</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {series.episodes?.map((episode) => (
              <div 
                key={episode._id} 
                className="aspect-[9/16] rounded-xl overflow-hidden relative group cursor-pointer bg-surface-container-high flex flex-col items-center justify-center"
                onClick={() => navigate(`/feed?id=${episode._id}`)}
              >
                {episode.thumbnailUrl ? (
                  <img src={episode.thumbnailUrl} alt={episode.title || `Episode ${episode.episodeNumber}`} className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-8 h-8 text-on-surface/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-widest">Episode {episode.episodeNumber}</div>
                  <div className="text-sm font-bold text-white truncate">{episode.title || "Untitled"}</div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-white/60 mt-2">
                    <Rocket className="w-3 h-3" />
                    {episode.views} views
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(!series.episodes || series.episodes.length === 0) && (
            <div className="py-12 text-center space-y-4 bg-surface-container-low rounded-2xl">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 text-on-surface/20" />
              </div>
              <p className="font-medium text-sm text-on-surface/40">No episodes yet.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
