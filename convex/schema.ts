
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("CUSTOMER")),
    status: v.union(v.literal("PENDING"), v.literal("APPROVED"), v.literal("REJECTED")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  souvenirs: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    image: v.id("_storage"),
    category: v.string(),
    status: v.union(v.literal("AVAILABLE"), v.literal("OUT_OF_STOCK"), v.literal("PREORDER")),
    stock: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["category"]),

  categories: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  cartItems: defineTable({
    userId: v.id("users"),
    souvenirId: v.id("souvenirs"),
    quantity: v.number(),
  }).index("by_user", ["userId"]),

  wishlistItems: defineTable({
    userId: v.id("users"),
    souvenirId: v.id("souvenirs"),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        souvenirId: v.id("souvenirs"),
        quantity: v.number(),
        priceAtTime: v.number(),
      })
    ),
    totalPrice: v.number(),
    status: v.union(v.literal("PENDING_WHATSAPP"), v.literal("COMPLETED"), v.literal("CANCELLED")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
});
