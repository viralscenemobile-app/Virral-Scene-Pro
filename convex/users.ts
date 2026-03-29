import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const recalculateAll = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      const followers = await ctx.db
        .query("follows")
        .withIndex("by_following", (q) => q.eq("followingId", user._id))
        .collect();
      const following = await ctx.db
        .query("follows")
        .withIndex("by_follower", (q) => q.eq("followerId", user._id))
        .collect();
      await ctx.db.patch(user._id, {
        followers: followers.length,
        following: following.length,
        coins: 0, // Reset coins as requested
      });
    }
  },
});

export const get = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getOrCreate = mutation({
  args: {
    firebaseUid: v.string(),
    username: v.string(),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_firebase_uid", (q) => q.eq("firebaseUid", args.firebaseUid))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      firebaseUid: args.firebaseUid,
      username: args.username,
      avatarUrl: args.avatarUrl,
      bio: "Architect of digital dreams. 🌌",
      followers: 0,
      following: 0,
      coins: 0,
      verified: true,
      role: "user",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const promoteToAdmin = mutation({
  args: { id: v.id("users"), adminId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can promote users");
    }
    await ctx.db.patch(args.id, { role: "admin" });
  },
});

export const deductCoins = mutation({
  args: { id: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");
    if (user.coins < args.amount) throw new Error("Insufficient coins");

    await ctx.db.patch(args.id, { coins: user.coins - args.amount });
    return true;
  },
});

export const rewardUser = mutation({
  args: { id: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.id, { coins: user.coins + args.amount });
  },
});

export const claimDailyReward = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (user.lastRewardClaimedAt && now - user.lastRewardClaimedAt < oneDay) {
      throw new Error("Daily reward already claimed");
    }

    // Check for active subscription
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .first();

    let rewardAmount = 10;
    if (subscription?.tier === "pro") rewardAmount = 50;
    if (subscription?.tier === "creator+") rewardAmount = 200;
    
    await ctx.db.patch(args.id, { 
      coins: user.coins + rewardAmount,
      lastRewardClaimedAt: now
    });
    return rewardAmount;
  },
});

export const listCreators = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .order("desc")
      .take(args.limit ?? 10);
  },
});

export const tipCreator = mutation({
  args: { tipperId: v.id("users"), creatorId: v.id("users"), amount: v.number() },
  handler: async (ctx, args) => {
    const tipper = await ctx.db.get(args.tipperId);
    const creator = await ctx.db.get(args.creatorId);
    if (!tipper || !creator) throw new Error("User not found");
    if (tipper.coins < args.amount) throw new Error("Insufficient coins");

    await ctx.db.patch(args.tipperId, { coins: tipper.coins - args.amount });
    await ctx.db.patch(args.creatorId, { coins: creator.coins + args.amount });

    // Create notification for creator
    await ctx.db.insert("notifications", {
      recipientId: args.creatorId,
      senderId: args.tipperId,
      type: "reward",
      text: `${args.amount} coins`,
      isRead: false,
      createdAt: Date.now(),
    });

    return true;
  },
});
