"use client";

import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <div className="flex justify-end p-4">
      <UserButton />
    </div>
  );
}
