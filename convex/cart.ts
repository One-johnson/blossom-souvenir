
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const items = await ctx.db
      .query("cartItems")
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

export const add = mutation({
  args: {
    userId: v.id("users"),
    souvenirId: v.id("souvenirs"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("souvenirId"), args.souvenirId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
    } else {
      await ctx.db.insert("cartItems", {
        userId: args.userId,
        souvenirId: args.souvenirId,
        quantity: args.quantity,
      });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("cartItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateQuantity = mutation({
  args: { id: v.id("cartItems"), quantity: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { quantity: args.quantity });
  },
});
