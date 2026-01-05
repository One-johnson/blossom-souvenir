
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").collect();
  },
});

export const send = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.optional(v.string()),
    message: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("messages", {
      ...args,
      replied: false,
      createdAt: Date.now(),
    });

    // Notify admins of new message
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "ADMIN"))
      .collect();

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        message: `New message from ${args.name}: "${args.subject || 'No subject'}"`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return id;
  },
});

export const reply = mutation({
  args: {
    id: v.id("messages"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) throw new Error("Message not found");

    await ctx.db.patch(args.id, {
      replied: true,
      replyText: args.text,
    });

    // If there's a associated user, notify them
    if (message.userId) {
      await ctx.db.insert("notifications", {
        userId: message.userId,
        message: `Boutique Support replied to your inquiry: "${args.text.substring(0, 50)}..."`,
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
