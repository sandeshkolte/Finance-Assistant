"use client";

import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function ConnectBank() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plaid/create-link-token")
      .then(res => res.json())
      .then(data => setToken(data.link_token));
  }, []);

  const { open, ready } = usePlaidLink({
    token,
    onSuccess: async (public_token) => {
      await fetch("/api/plaid/exchange", {
        method: "POST",
        body: JSON.stringify({ public_token }),
      });
    },
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect Bank
    </button>
  );
}
