
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    // Case-insensitive check
    const existing = await ctx.db
      .query("categories")
      .collect();
    
    const duplicate = existing.find(c => c.name.toLowerCase() === name.toLowerCase());
    
    if (duplicate) return duplicate._id;
    return await ctx.db.insert("categories", { name });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) return;

    const defaultCategoryName = "Uncategorized";

    // Gracefully handle associated souvenirs by reassigning them
    const relatedSouvenirs = await ctx.db
      .query("souvenirs")
      .withIndex("by_category", (q) => q.eq("category", category.name))
      .collect();

    if (relatedSouvenirs.length > 0) {
      // Ensure "Uncategorized" exists as a formal category
      const uncategorized = await ctx.db
        .query("categories")
        .withIndex("by_name", (q) => q.eq("name", defaultCategoryName))
        .unique();
      
      if (!uncategorized) {
        await ctx.db.insert("categories", { name: defaultCategoryName });
      }

      // Reassign items
      for (const souvenir of relatedSouvenirs) {
        await ctx.db.patch(souvenir._id, { 
          category: defaultCategoryName 
        });
      }
    }

    await ctx.db.delete(args.id);
  },
});
