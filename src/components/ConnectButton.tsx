import React from "react";
import { useQuso } from "../context/QusoContext";

export const ConnectButton = () => {
  const { user, login, logout } = useQuso();

  return (
    <button
      onClick={() => (user ? logout() : login("google"))}
      style={{
        padding: "10px 18px",
        borderRadius: 8,
        cursor: "pointer",
        background: user ? "#e53935" : "#4CAF50",
        color: "#fff",
        fontWeight: "bold",
        border: "none"
      }}
    >
      {user ? `Disconnect (${user.provider})` : "Connect Wallet"}
    </button>
  );
};
