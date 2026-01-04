
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getMe = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    return await ctx.db.get(args.userId);
  },
});

export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUsers = await ctx.db.query("users").collect();
    const isFirstUser = existingUsers.length === 0;

    const user = {
      name: args.name,
      email: args.email,
      passwordHash: args.password,
      role: isFirstUser ? ("ADMIN" as const) : ("CUSTOMER" as const),
      status: isFirstUser ? ("APPROVED" as const) : ("PENDING" as const),
      createdAt: Date.now(),
    };
    
    const id = await ctx.db.insert("users", user);

    // Notify existing admins about new registration
    if (!isFirstUser) {
      const admins = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "ADMIN"))
        .collect();
      
      for (const admin of admins) {
        await ctx.db.insert("notifications", {
          userId: admin._id,
          message: `New user registration: ${args.name} (${args.email})`,
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    return { ...user, _id: id };
  },
});

export const login = query({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    
    if (user && user.passwordHash === args.password) {
      return user;
    }
    return null;
  },
});

export const updateProfile = mutation({
  args: { 
    id: v.id("users"), 
    name: v.optional(v.string()), 
    email: v.optional(v.string()),
    password: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    if (args.name) updates.name = args.name;
    if (args.email) updates.email = args.email;
    if (args.password) updates.passwordHash = args.password;
    
    await ctx.db.patch(args.id, updates);
    return await ctx.db.get(args.id);
  },
});

export const updateStatus = mutation({
  args: { id: v.id("users"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
        status: args.status as "APPROVED" | "PENDING" | "REJECTED" 
    });

    // Notify user of status change
    await ctx.db.insert("notifications", {
      userId: args.id,
      message: `Your account status has been updated to: ${args.status}`,
      read: false,
      createdAt: Date.now(),
    });
  },
});
