
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const items = await ctx.db
      .query("wishlistItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return Promise.all(
      items.map(async (item) => {
        const souvenir = await ctx.db.get(item.souvenirId);
        return {
          ...item,
          souvenir: souvenir ? {
            ...souvenir,
            image: await ctx.storage.getUrl(souvenir.image),
          } : null,
        };
      })
    );
  },
});

export const toggle = mutation({
  args: {
    userId: v.id("users"),
    souvenirId: v.id("souvenirs"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wishlistItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("souvenirId"), args.souvenirId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Removed
    } else {
      await ctx.db.insert("wishlistItems", {
        userId: args.userId,
        souvenirId: args.souvenirId,
      });
      return true; // Added
    }
  },
});

export const remove = mutation({
  args: { id: v.id("wishlistItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
