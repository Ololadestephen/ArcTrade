// ArcTrade — Navigation Utilities (app/utils)
export const PUBLIC_ROUTES = ["landing", "wallet"];

export const APP_ROUTES = [
  "dashboard",
  "trade",
  "settings",
];

export const NAV_ITEMS = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "trade", icon: "⚡", label: "Trade" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

export function navigate(target, wallet, setPage) {
  if (APP_ROUTES.includes(target) && !wallet) {
    setPage("wallet");
  } else {
    setPage(target);
  }
}

