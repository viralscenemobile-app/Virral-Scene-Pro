import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("challenges").collect();
  },
});

export const listActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("challenges")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const listPast = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("challenges")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    prizePool: v.number(),
    entryFee: v.number(),
    endTime: v.number(),
    creatorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("challenges", {
      ...args,
      status: "active",
    });
  },
});

export const getEntries = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("challenge_entries")
      .withIndex("by_challenge", (q) => q.eq("challengeId", args.challengeId))
      .collect();

    return await Promise.all(
      entries.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        const creation = await ctx.db.get(entry.creationId);
        return { ...entry, user, creation };
      })
    );
  },
});

export const voteEntry = mutation({
  args: { entryId: v.id("challenge_entries"), voterId: v.id("users") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) throw new Error("Entry not found");

    // In a real app, check if user already voted to prevent multiple votes
    // For now, just increment votes
    await ctx.db.patch(args.entryId, { votes: entry.votes + 1 });

    // Give points to the entry creator
    const currentSeason = new Date().getFullYear() + "-Q" + Math.floor((new Date().getMonth() + 3) / 3);
    const leaderboardEntry = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("userId"), entry.userId))
      .filter((q) => q.eq(q.field("season"), currentSeason))
      .first();
      
    if (leaderboardEntry) {
      await ctx.db.patch(leaderboardEntry._id, { points: leaderboardEntry.points + 3 });
    } else {
      await ctx.db.insert("leaderboard", {
        userId: entry.userId,
        points: 3,
        wins: 0,
        season: currentSeason,
      });
    }
  },
});
