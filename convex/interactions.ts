import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleLike = mutation({
  args: { userId: v.id("users"), creationId: v.id("creations") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_creation", (q) => 
        q.eq("userId", args.userId).eq("creationId", args.creationId)
      )
      .unique();

    const creation = await ctx.db.get(args.creationId);
    if (!creation) throw new Error("Creation not found");

    const currentSeason = new Date().getFullYear() + "-Q" + Math.floor((new Date().getMonth() + 3) / 3);

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.creationId, { likes: Math.max(0, creation.likes - 1) });
      
      // Remove points from creator
      const leaderboardEntry = await ctx.db
        .query("leaderboard")
        .filter((q) => q.eq(q.field("userId"), creation.userId))
        .filter((q) => q.eq(q.field("season"), currentSeason))
        .first();
        
      if (leaderboardEntry) {
        await ctx.db.patch(leaderboardEntry._id, {
          points: Math.max(0, leaderboardEntry.points - 5),
        });
      }
      
      return false;
    } else {
      await ctx.db.insert("likes", { userId: args.userId, creationId: args.creationId });
      await ctx.db.patch(args.creationId, { likes: creation.likes + 1 });
      
      // Create notification for creator
      if (creation.userId !== args.userId) {
        await ctx.db.insert("notifications", {
          recipientId: creation.userId,
          senderId: args.userId,
          type: "like",
          creationId: args.creationId,
          isRead: false,
          createdAt: Date.now(),
        });
      }

      // Add points to creator
      const leaderboardEntry = await ctx.db
        .query("leaderboard")
        .filter((q) => q.eq(q.field("userId"), creation.userId))
        .filter((q) => q.eq(q.field("season"), currentSeason))
        .first();
        
      if (leaderboardEntry) {
        await ctx.db.patch(leaderboardEntry._id, {
          points: leaderboardEntry.points + 5,
        });
      } else {
        await ctx.db.insert("leaderboard", {
          userId: creation.userId,
          points: 5,
          wins: 0,
          season: currentSeason,
        });
      }
      
      return true;
    }
  },
});

export const toggleBookmark = mutation({
  args: { userId: v.id("users"), creationId: v.id("creations") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_creation", (q) => 
        q.eq("userId", args.userId).eq("creationId", args.creationId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("bookmarks", { userId: args.userId, creationId: args.creationId });
      return true;
    }
  },
});

export const toggleFollow = mutation({
  args: { followerId: v.id("users"), followingId: v.id("users") },
  handler: async (ctx, args) => {
    if (args.followerId === args.followingId) return false;

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => 
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .unique();

    const follower = await ctx.db.get(args.followerId);
    const following = await ctx.db.get(args.followingId);
    if (!follower || !following) throw new Error("User not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.followerId, { following: Math.max(0, follower.following - 1) });
      await ctx.db.patch(args.followingId, { followers: Math.max(0, following.followers - 1) });
      return false;
    } else {
      await ctx.db.insert("follows", { followerId: args.followerId, followingId: args.followingId });
      await ctx.db.patch(args.followerId, { following: follower.following + 1 });
      await ctx.db.patch(args.followingId, { followers: following.followers + 1 });

      // Create notification for followed user
      await ctx.db.insert("notifications", {
        recipientId: args.followingId,
        senderId: args.followerId,
        type: "follow",
        isRead: false,
        createdAt: Date.now(),
      });

      return true;
    }
  },
});

export const addComment = mutation({
  args: { userId: v.id("users"), creationId: v.id("creations"), text: v.string() },
  handler: async (ctx, args) => {
    const creation = await ctx.db.get(args.creationId);
    if (!creation) throw new Error("Creation not found");

    await ctx.db.insert("comments", {
      userId: args.userId,
      creationId: args.creationId,
      text: args.text,
      createdAt: Date.now(),
    });

    // Create notification for creator
    if (creation.userId !== args.userId) {
      await ctx.db.insert("notifications", {
        recipientId: creation.userId,
        senderId: args.userId,
        type: "comment",
        creationId: args.creationId,
        text: args.text,
        isRead: false,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(args.creationId, { comments: creation.comments + 1 });
  },
});

export const getComments = query({
  args: { creationId: v.id("creations") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_creation", (q) => q.eq("creationId", args.creationId))
      .order("desc")
      .collect();

    // Join with user data
    return await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return { ...comment, user };
      })
    );
  },
});

export const checkInteractions = query({
  args: { userId: v.id("users"), creationId: v.id("creations") },
  handler: async (ctx, args) => {
    const liked = await ctx.db
      .query("likes")
      .withIndex("by_user_creation", (q) => 
        q.eq("userId", args.userId).eq("creationId", args.creationId)
      )
      .unique();

    const bookmarked = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_creation", (q) => 
        q.eq("userId", args.userId).eq("creationId", args.creationId)
      )
      .unique();

    return { liked: !!liked, bookmarked: !!bookmarked };
  },
});

export const checkFollow = query({
  args: { followerId: v.id("users"), followingId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => 
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .unique();
    return !!existing;
  },
});

// Notifications
export const listUserNotifications = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.userId))
      .order("desc")
      .take(args.limit ?? 50);

    return await Promise.all(
      notifications.map(async (notification) => {
        const sender = await ctx.db.get(notification.senderId);
        const creation = notification.creationId 
          ? await ctx.db.get(notification.creationId) 
          : null;
        return { ...notification, sender, creation };
      })
    );
  },
});

export const getUnreadNotificationsCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) => q.eq("recipientId", args.userId).eq("isRead", false))
      .collect();
    return unread.length;
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_read", (q) => q.eq("recipientId", args.userId).eq("isRead", false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});
