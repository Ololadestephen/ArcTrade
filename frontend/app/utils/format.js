// ArcTrade — Format Utilities (app/utils)
export const formatUSD = (value, decimals = 2) =>
  `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;

export const formatSigned = (value) =>
  value >= 0 ? `+${value}` : `${value}`;

export const truncateAddress = (address, head = 4, tail = 4) =>
  address
    ? `${address.slice(0, head)}...${address.slice(-tail)}`
    : "";

export const pnlColor = (pnl) =>
  pnl.startsWith("+") ? "var(--green)" : "var(--red)";

export const healthColor = (health) =>
  health > 70 ? "var(--green)" : health > 40 ? "var(--amber)" : "var(--red)";

