
/* eslint-disable */
/**
 * Generated API definitions.
 */
import { anyApi } from "convex/server";

// Fix: Use 'any' type for api because anyApi is treated as a value in this version of Convex/server
export const api: any = {
  users: {
    list: "users:list",
    getMe: "users:getMe",
    register: "users:register",
    login: "users:login",
    updateStatus: "users:updateStatus",
    updateProfile: "users:updateProfile",
  },
  souvenirs: {
    list: "souvenirs:list",
    get: "souvenirs:get",
    create: "souvenirs:create",
    update: "souvenirs:update",
    updateStatus: "souvenirs:updateStatus",
    updateStatuses: "souvenirs:updateStatuses",
    remove: "souvenirs:remove",
    removeMany: "souvenirs:removeMany",
  },
  categories: {
    list: "categories:list",
    create: "categories:create",
    remove: "categories:remove",
  },
  images: {
    generateUploadUrl: "images:generateUploadUrl",
  },
  cart: {
    list: "cart:list",
    add: "cart:add",
    remove: "cart:remove",
    updateQuantity: "cart:updateQuantity",
  },
  wishlist: {
    list: "wishlist:list",
    toggle: "wishlist:toggle",
    remove: "wishlist:remove",
  },
  orders: {
    listAll: "orders:listAll",
    listByUser: "orders:listByUser",
    create: "orders:create",
    updateStatus: "orders:updateStatus",
    updateStatuses: "orders:updateStatuses",
    remove: "orders:remove",
    removeMany: "orders:removeMany",
  },
  notifications: {
    list: "notifications:list",
    create: "notifications:create",
    markAllRead: "notifications:markAllRead",
    remove: "notifications:remove",
    clearAll: "notifications:clearAll",
  }
};
