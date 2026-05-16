import { authRoutes, usersRoutes, followsRoutes } from "./users/index.js";
import { bookRoutes, bookmarksRoutes } from "./books/index.js";
import { rankingRoutes } from "./rankings/index.js";
import type { Router } from "express";

export const routes: [string, Router][] = [
  ["/auth", authRoutes],
  ["/ranking", rankingRoutes],
  ["/books", bookRoutes],
  ["/users", usersRoutes],
  ["/follow", followsRoutes],
  ["/bookmarks", bookmarksRoutes],
];
