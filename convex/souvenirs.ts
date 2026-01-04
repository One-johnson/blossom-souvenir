
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const souvenirs = await ctx.db.query("souvenirs").collect();
    return Promise.all(
      souvenirs.map(async (s) => ({
        ...s,
        image: await ctx.storage.getUrl(s.image),
        storageId: s.image,
      }))
    );
  },
});

export const get = query({
  args: { id: v.id("souvenirs") },
  handler: async (ctx, args) => {
    const s = await ctx.db.get(args.id);
    if (!s) return null;
    return {
      ...s,
      image: await ctx.storage.getUrl(s.image),
      storageId: s.image,
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
    return await ctx.db.insert("souvenirs", {
      ...args,
      status: args.status as "AVAILABLE" | "OUT_OF_STOCK" | "PREORDER",
      createdAt: now,
      updatedAt: now,
    });
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
      status: args.status as "AVAILABLE" | "OUT_OF_STOCK" | "PREORDER",
      updatedAt: Date.now(),
    });
  },
});

export const updateStatuses = mutation({
  args: { ids: v.array(v.id("souvenirs")), status: v.string() },
  handler: async (ctx, args) => {
    const status = args.status as "AVAILABLE" | "OUT_OF_STOCK" | "PREORDER";
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
