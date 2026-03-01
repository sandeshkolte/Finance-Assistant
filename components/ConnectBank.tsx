"use client";

import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function ConnectBank() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bank/setu/create-consent", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        // Redirect the user to Setu's consent portal
        window.location.href = data.url;
      } else {
        alert("Failed to initialize connection. Please check console.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
    >
      {loading ? "Connecting..." : "Connect Bank"}
    </button>
  );
}

