import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firebaseUid: v.string(),
    username: v.string(),
    avatarUrl: v.string(),
    bio: v.string(),
    followers: v.number(),
    following: v.number(),
    coins: v.number(),
    verified: v.boolean(),
    lastRewardClaimedAt: v.optional(v.number()),
    role: v.optional(v.string()),
  })
    .index("by_firebase_uid", ["firebaseUid"])
    .index("by_username", ["username"]),

  creations: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    prompt: v.string(),
    style: v.string(),
    videoUrl: v.string(),
    thumbnailUrl: v.string(),
    views: v.number(),
    likes: v.number(),
    comments: v.number(),
    isTemplate: v.boolean(),
    templateId: v.optional(v.id("templates")),
    challengeId: v.optional(v.id("challenges")),
    seriesId: v.optional(v.id("series")),
    episodeNumber: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_challenge", ["challengeId"])
    .index("by_series", ["seriesId"])
    .searchIndex("search_prompt", { searchField: "prompt" }),

  series: defineTable({
    creatorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    coverImageUrl: v.string(),
    createdAt: v.number(),
    isPublic: v.boolean(),
  }).index("by_creator", ["creatorId"]),

  templates: defineTable({
    creatorId: v.id("users"),
    title: v.optional(v.string()),
    prompt: v.string(),
    structuredPrompt: v.string(), // JSON string for camera, lighting, etc.
    style: v.string(),
    usageCount: v.number(),
    thumbnailUrl: v.string(),
  }).index("by_creator", ["creatorId"])
    .index("by_usage", ["usageCount"]),

  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    imageUrl: v.string(),
    prizePool: v.number(),
    entryFee: v.number(),
    endTime: v.number(),
    creatorId: v.id("users"),
    status: v.string(), // "active", "completed"
  }).index("by_status", ["status"]),

  challenge_entries: defineTable({
    challengeId: v.id("challenges"),
    userId: v.id("users"),
    creationId: v.id("creations"),
    votes: v.number(),
  }).index("by_challenge", ["challengeId"])
    .index("by_user_challenge", ["userId", "challengeId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    tier: v.string(), // "free", "pro", "creator+"
    expiresAt: v.number(),
  }).index("by_user", ["userId"]),

  leaderboard: defineTable({
    userId: v.id("users"),
    points: v.number(),
    wins: v.number(),
    season: v.string(),
  }).index("by_points", ["points"])
    .index("by_user", ["userId"]),

  likes: defineTable({
    userId: v.id("users"),
    creationId: v.id("creations"),
  }).index("by_user_creation", ["userId", "creationId"])
    .index("by_creation", ["creationId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    creationId: v.id("creations"),
  }).index("by_user_creation", ["userId", "creationId"]),

  comments: defineTable({
    userId: v.id("users"),
    creationId: v.id("creations"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_creation", ["creationId"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  }).index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_pair", ["followerId", "followingId"]),

// Notifications table for real-time alerts
  notifications: defineTable({
    recipientId: v.id("users"),
    senderId: v.id("users"),
    type: v.string(), // "like", "comment", "follow", "reward"
    creationId: v.optional(v.id("creations")),
    text: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_recipient", ["recipientId"])
    .index("by_recipient_read", ["recipientId", "isRead"]),
});
