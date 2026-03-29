import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getActive = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .first();
  },
});

export const subscribe = mutation({
  args: { 
    userId: v.id("users"),
    tier: v.string(), // "pro", "creator+"
    durationDays: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + args.durationDays * 24 * 60 * 60 * 1000;
    
    // Check if user already has an active subscription
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .first();

    if (existing) {
      // Extend existing
      await ctx.db.patch(existing._id, {
        expiresAt: existing.expiresAt + args.durationDays * 24 * 60 * 60 * 1000,
        tier: args.tier, // Upgrade if needed
      });
      return existing._id;
    } else {
      return await ctx.db.insert("subscriptions", {
        userId: args.userId,
        tier: args.tier,
        expiresAt,
      });
    }
  },
});

export const unsubscribe = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const active = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .first();
    
    if (active) {
      await ctx.db.patch(active._id, { expiresAt: now });
    }
  },
});
