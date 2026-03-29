import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const entries = await ctx.db
      .query("leaderboard")
      .withIndex("by_points")
      .order("desc")
      .take(50);

    return await Promise.all(
      entries.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        return { ...entry, user };
      })
    );
  },
});

export const updatePoints = mutation({
  args: {
    userId: v.id("users"),
    pointsToAdd: v.number(),
  },
  handler: async (ctx, args) => {
    const currentSeason = new Date().getFullYear() + "-Q" + Math.floor((new Date().getMonth() + 3) / 3);
    
    const existing = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("season"), currentSeason))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        points: existing.points + args.pointsToAdd,
      });
    } else {
      await ctx.db.insert("leaderboard", {
        userId: args.userId,
        points: args.pointsToAdd,
        wins: 0,
        season: currentSeason,
      });
    }
  },
});
