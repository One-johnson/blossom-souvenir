
// Fix: Access Convex server factory functions via namespace import and any casting to bypass named export errors
import * as convexServer from "convex/server";

export const query = (convexServer as any).query;
export const mutation = (convexServer as any).mutation;
export const action = (convexServer as any).action;
