import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("/login", "routes/login.tsx"),
  route("/dashboard", "routes/dashboard.tsx", [
    index("routes/dashboard.home.tsx"),
    route("games", "routes/dashboard.games.tsx"),
    route("games/new", "routes/dashboard.games.new.tsx"),
    route("games/:gameId", "routes/dashboard.games.$gameId.tsx"),
    route("leaderboard", "routes/dashboard.leaderboard.tsx"),
  ]),
] satisfies RouteConfig;
