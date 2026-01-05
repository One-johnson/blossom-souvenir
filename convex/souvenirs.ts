import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const souvenirs = await ctx.db.query("souvenirs").collect();
    return Promise.all(
      souvenirs.map(async (s) => {
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_souvenir", (q) => q.eq("souvenirId", s._id))
          .collect();
        
        const avgRating = reviews.length > 0 
          ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
          : 0;

        return {
          ...s,
          image: await ctx.storage.getUrl(s.image),
          storageId: s.image,
          rating: avgRating,
          reviewCount: reviews.length
        };
      })
    );
  },
});

export const get = query({
  args: { id: v.id("souvenirs") },
  handler: async (ctx, args) => {
    const s = await ctx.db.get(args.id);
    if (!s) return null;
    
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_souvenir", (q) => q.eq("souvenirId", s._id))
      .collect();
    
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
      : 0;

    return {
      ...s,
      image: await ctx.storage.getUrl(s.image),
      storageId: s.image,
      rating: avgRating,
      reviewCount: reviews.length
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.id("_storage"),
    category: v.string(),
    status: v.string(),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const souvenirId = await ctx.db.insert("souvenirs", {
      ...args,
      status: args.status as "AVAILABLE" | "OUT_OF_STOCK" | "PREORDER" | "SOLD",
      createdAt: now,
      updatedAt: now,
    });

    // Notify all customers about the new arrival
    const customers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "CUSTOMER"))
      .collect();

    for (const customer of customers) {
      await ctx.db.insert("notifications", {
        userId: customer._id,
        message: `✨ New Arrival: "${args.name}" has just been added to our collection. Come see what's blooming!`,
        read: false,
        createdAt: now,
      });
    }

    return souvenirId;
  },
});

export const update = mutation({
  args: {
    id: v.id("souvenirs"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("souvenirs"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status as "AVAILABLE" | "OUT_OF_STOCK" | "PREORDER" | "SOLD",
      updatedAt: Date.now(),
    });
  },
});

export const updateStatuses = mutation({
  args: { ids: v.array(v.id("souvenirs")), status: v.string() },
  handler: async (ctx, args) => {
    const status = args.status as "AVAILABLE" | "OUT_OF_STOCK" | "PREORDER" | "SOLD";
    const now = Date.now();
    for (const id of args.ids) {
      await ctx.db.patch(id, { status, updatedAt: now });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("souvenirs") },
  handler: async (ctx, args) => {
    const souvenir = await ctx.db.get(args.id);
    if (souvenir) {
      await ctx.storage.delete(souvenir.image);
    }
    await ctx.db.delete(args.id);
  },
});

export const removeMany = mutation({
  args: { ids: v.array(v.id("souvenirs")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const souvenir = await ctx.db.get(id);
      if (souvenir) {
        await ctx.storage.delete(souvenir.image);
      }
      await ctx.db.delete(id);
    }
  },
});