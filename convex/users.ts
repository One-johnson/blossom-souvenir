
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return Promise.all(
      users.map(async (u) => ({
        ...u,
        profileImageUrl: u.profileImage ? await ctx.storage.getUrl(u.profileImage) : null,
      }))
    );
  },
});

export const getMe = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return null;
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      ...user,
      profileImageUrl: user.profileImage ? await ctx.storage.getUrl(user.profileImage) : null,
    };
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
      return {
        ...user,
        profileImageUrl: user.profileImage ? await (ctx as any).storage.getUrl(user.profileImage) : null,
      };
    }
    return null;
  },
});

export const updateProfile = mutation({
  args: { 
    id: v.id("users"), 
    name: v.optional(v.string()), 
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    currentPassword: v.optional(v.string()), // Required for sensitive changes
    profileImage: v.optional(v.id("_storage"))
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");

    const isSensitiveUpdate = !!(args.password || args.email);
    
    if (isSensitiveUpdate) {
      if (!args.currentPassword) {
        throw new Error("Current password is required to update sensitive information.");
      }
      if (user.passwordHash !== args.currentPassword) {
        throw new Error("Incorrect current password.");
      }
    }

    const updates: any = {};
    if (args.name) updates.name = args.name;
    if (args.email) updates.email = args.email;
    if (args.password) updates.passwordHash = args.password;
    if (args.profileImage) {
      if (user.profileImage) {
        await ctx.storage.delete(user.profileImage);
      }
      updates.profileImage = args.profileImage;
    }
    
    await ctx.db.patch(args.id, updates);
    const updatedUser = await ctx.db.get(args.id);
    return {
      ...updatedUser,
      profileImageUrl: updatedUser?.profileImage ? await ctx.storage.getUrl(updatedUser.profileImage) : null,
    };
  },
});

export const updateStatus = mutation({
  args: { id: v.id("users"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
        status: args.status as "APPROVED" | "PENDING" | "REJECTED" 
    });

    await ctx.db.insert("notifications", {
      userId: args.id,
      message: `Your account status has been updated to: ${args.status}`,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const updateRole = mutation({
  args: { id: v.id("users"), role: v.union(v.literal("ADMIN"), v.literal("CUSTOMER")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
    
    await ctx.db.insert("notifications", {
      userId: args.id,
      message: `Your account role has been updated to: ${args.role}`,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (user?.profileImage) {
      await ctx.storage.delete(user.profileImage);
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();
    for (const item of cartItems) await ctx.db.delete(item._id);

    const wishlistItems = await ctx.db
      .query("wishlistItems")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();
    for (const item of wishlistItems) await ctx.db.delete(item._id);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();
    for (const n of notifications) await ctx.db.delete(n._id);

    await ctx.db.delete(args.id);
  },
});
