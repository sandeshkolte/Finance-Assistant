import { prisma } from "@/lib/db";

// export async function GET() {
//   const users = await prisma.user.findMany();

//   return Response.json({
//     success: true,
//     users,
//   });
// }

export async function GET() {
  const user = await prisma.user.create({
    data: {
      email: "sandesh@saas.com",
      name: "Sandesh Admin",
      clerkId: "clerk_" + Date.now(),
    },
  });

  return Response.json({
    success: true,
    user,
  });
}