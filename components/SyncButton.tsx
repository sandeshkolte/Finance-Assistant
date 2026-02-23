"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);

    try {
      await fetch("/api/plaid/sync", { method: "POST" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="flex items-center gap-2 px-2 py-2 rounded-xl bg-gray-200 text-white hover:bg-gray-100 transition disabled:opacity-50"
    >
      <RefreshCcw
        className={`w-4 h-4 text-gray-950 ${
  loading
    ? "animate-spin animation-duration-[1.4s]"
    : "transition-transform duration-300"
}`}
      />
    </button>
  );
}