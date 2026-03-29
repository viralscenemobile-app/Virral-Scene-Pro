import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const creations = await ctx.db
      .query("creations")
      .order("desc")
      .take(args.limit ?? 10);

    return await Promise.all(
      creations.map(async (creation) => {
        const user = await ctx.db.get(creation.userId);
        return { ...creation, user };
      })
    );
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (!args.query) return [];
    const creations = await ctx.db
      .query("creations")
      .withSearchIndex("search_prompt", (q) => q.search("prompt", args.query))
      .take(20);

    return await Promise.all(
      creations.map(async (creation) => {
        const user = await ctx.db.get(creation.userId);
        return { ...creation, user };
      })
    );
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const listFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();

    const followingIds = following.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    const creations = await ctx.db
      .query("creations")
      .order("desc")
      .collect();

    const filtered = creations.filter((c) => followingIds.includes(c.userId));

    return await Promise.all(
      filtered.map(async (creation) => {
        const user = await ctx.db.get(creation.userId);
        return { ...creation, user };
      })
    );
  },
});

export const listBookmarked = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_creation", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      bookmarks.map(async (bookmark) => {
        const creation = await ctx.db.get(bookmark.creationId);
        if (!creation) return null;
        const user = await ctx.db.get(creation.userId);
        return { ...creation, user };
      })
    ).then((results) => results.filter((r) => r !== null));
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    prompt: v.string(),
    style: v.string(),
    videoUrl: v.string(),
    thumbnailUrl: v.string(),
    isTemplate: v.boolean(),
    templateId: v.optional(v.id("templates")),
    challengeId: v.optional(v.id("challenges")),
  },
  handler: async (ctx, args) => {
    const creationId = await ctx.db.insert("creations", {
      ...args,
      views: 0,
      likes: 0,
      comments: 0,
    });

    // If it's part of a challenge, create a challenge entry
    if (args.challengeId) {
      await ctx.db.insert("challenge_entries", {
        challengeId: args.challengeId,
        userId: args.userId,
        creationId,
        votes: 0,
      });
    }

    // If it used a template, increment usage count
    if (args.templateId) {
      const template = await ctx.db.get(args.templateId);
      if (template) {
        await ctx.db.patch(args.templateId, { usageCount: template.usageCount + 1 });
        
        // Give points to template creator
        const currentSeason = new Date().getFullYear() + "-Q" + Math.floor((new Date().getMonth() + 3) / 3);
        const leaderboardEntry = await ctx.db
          .query("leaderboard")
          .filter((q) => q.eq(q.field("userId"), template.creatorId))
          .filter((q) => q.eq(q.field("season"), currentSeason))
          .first();
          
        if (leaderboardEntry) {
          await ctx.db.patch(leaderboardEntry._id, { points: leaderboardEntry.points + 2 });
        } else {
          await ctx.db.insert("leaderboard", {
            userId: template.creatorId,
            points: 2,
            wins: 0,
            season: currentSeason,
          });
        }
      }
    }

    // Give points to the creator for making a creation
    const currentSeason = new Date().getFullYear() + "-Q" + Math.floor((new Date().getMonth() + 3) / 3);
    const leaderboardEntry = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("season"), currentSeason))
      .first();
      
    if (leaderboardEntry) {
      await ctx.db.patch(leaderboardEntry._id, { points: leaderboardEntry.points + 1 });
    } else {
      await ctx.db.insert("leaderboard", {
        userId: args.userId,
        points: 1,
        wins: 0,
        season: currentSeason,
      });
    }

    return creationId;
  },
});

export const createTemplate = mutation({
  args: {
    creatorId: v.id("users"),
    prompt: v.string(),
    structuredPrompt: v.string(),
    style: v.string(),
    thumbnailUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("templates", {
      ...args,
      usageCount: 0,
    });
    
    // Give points to the creator for making a template
    const currentSeason = new Date().getFullYear() + "-Q" + Math.floor((new Date().getMonth() + 3) / 3);
    const leaderboardEntry = await ctx.db
      .query("leaderboard")
      .filter((q) => q.eq(q.field("userId"), args.creatorId))
      .filter((q) => q.eq(q.field("season"), currentSeason))
      .first();
      
    if (leaderboardEntry) {
      await ctx.db.patch(leaderboardEntry._id, { points: leaderboardEntry.points + 10 });
    } else {
      await ctx.db.insert("leaderboard", {
        userId: args.creatorId,
        points: 10,
        wins: 0,
        season: currentSeason,
      });
    }

    return templateId;
  },
});

export const listTemplates = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .order("desc")
      .take(args.limit ?? 20);
  },
});

export const listTemplatesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("templates")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
      .order("desc")
      .collect();
  },
});
