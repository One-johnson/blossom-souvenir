
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").order("desc").collect();
    
    // Resolve souvenir names and images for the order items
    return Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const souvenir = await ctx.db.get(item.souvenirId);
            return {
              ...item,
              souvenirName: souvenir?.name || "Deleted Item",
              souvenirImage: souvenir ? await ctx.storage.getUrl(souvenir.image) : null,
            };
          })
        );
        return {
          ...order,
          userName: user?.name || "Unknown User",
          items: itemsWithDetails,
        };
      })
    );
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return Promise.all(
      orders.map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            const souvenir = await ctx.db.get(item.souvenirId);
            return {
              ...item,
              souvenirName: souvenir?.name || "Deleted Item",
              souvenirImage: souvenir ? await ctx.storage.getUrl(souvenir.image) : null,
            };
          })
        );
        return {
          ...order,
          items: itemsWithDetails,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    items: v.array(
      v.object({
        souvenirId: v.id("souvenirs"),
        quantity: v.number(),
        priceAtTime: v.number(),
      })
    ),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "PENDING_WHATSAPP",
      createdAt: Date.now(),
    });

    // Clear cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    // Notify admins
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "ADMIN"))
      .collect();
    
    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        message: `New order placed! Total: $${args.totalPrice.toFixed(2)}`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return orderId;
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { 
      status: args.status as "PENDING_WHATSAPP" | "COMPLETED" | "CANCELLED" 
    });
  },
});

export const updateStatuses = mutation({
  args: { ids: v.array(v.id("orders")), status: v.string() },
  handler: async (ctx, args) => {
    const status = args.status as "PENDING_WHATSAPP" | "COMPLETED" | "CANCELLED";
    for (const id of args.ids) {
      await ctx.db.patch(id, { status });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const removeMany = mutation({
  args: { ids: v.array(v.id("orders")), },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
  },
});
