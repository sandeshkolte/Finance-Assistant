import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LandingPageClient } from "@/components/landing-page-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <LandingPageClient />
      <Footer />
    </main>
  )
}

