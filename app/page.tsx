// "use client"
// import ConnectBank from "@/components/ConnectBank";
// // import { auth } from "@clerk/nextjs/server";
// // import { redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LandingPageClient } from "@/components/landing-page-client";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <LandingPageClient />
      <Footer />
    </main>
  )
}

