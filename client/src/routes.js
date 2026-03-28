import Dashboard from "./views/Dashboard.js";
import User from "./views/UserProfile.js";
import TableList from "./views/Transaction.js";
import Typography from "./views/Subscription.js";
import Icons from "./views/NewsFeed.js";
import Maps from "./views/Goals.js";
import Scan from "./views/Scan.js";

const dashboardRoutes = [
  {
    path: "dashboard",
    name: "Overview",
    icon: "nc-icon nc-chart-pie-35",
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "wallet",
    name: "Manage Wallet",
    icon: "nc-icon nc-notes",
    component: TableList,
    layout: "/admin",
  },
  {
    path: "scan",
    name: "Scan Receipts",
    icon: "nc-icon nc-zoom-split",
    component: Scan,
    layout: "/admin",
  },
  {
    path: "subscription",
    name: "Manage Subs",
    icon: "nc-icon nc-paper-2",
    component: Typography,
    layout: "/admin",
  },
  {
    path: "goals",
    name: "Goals",
    icon: "nc-icon nc-pin-3",
    component: Maps,
    layout: "/admin",
  },
  {
    path: "news",
    name: "News Feed",
    icon: "nc-icon nc-atom",
    component: Icons,
    layout: "/admin",
  },
  {
    path: "user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: User,
    layout: "/admin",
  },
];

export default dashboardRoutes;
