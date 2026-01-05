
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listBySouvenir = query({
  args: { souvenirId: v.id("souvenirs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_souvenir", (q) => q.eq("souvenirId", args.souvenirId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    userId: v.id("users"),
    userName: v.string(),
    souvenirId: v.id("souvenirs"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const souvenir = await ctx.db.get(args.souvenirId);
    if (!souvenir) throw new Error("Souvenir not found");

    const reviewId = await ctx.db.insert("reviews", {
      ...args,
      createdAt: Date.now(),
    });

    // Notify admins of new review
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "ADMIN"))
      .collect();

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        message: `New ${args.rating}-star review for "${souvenir.name}" from ${args.userName}.`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return reviewId;
  },
});
