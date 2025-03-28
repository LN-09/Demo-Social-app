//Là file tiếp cận mới để xử lí Serve actions bằng cách đặt chúng ở file riêng biêt thay vì khai báo trực tiếp trong Component
"use server";

import { PrismaClient } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
const prisma = new PrismaClient();

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!user || !userId) return null;
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (existingUser) return existingUser;
    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });
    return dbUser;
  } catch (error) {
    console.error("Error syncing user:", error);
    return null;
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unathorized");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");
  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    //Can get random users exculde ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [{ NOT: { id: userId } }, { NOT: { followers: { some: { followerId: userId } } } }],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });
    return randomUsers;
  } catch (error) {
    console.error("Error fetching random users:", error);
    return [];
  }
}

export async function ToggleFollow(TargetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (userId === TargetUserId) throw new Error("You cannot follow yourself");
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: TargetUserId,
        },
      },
    });
    if (existingFollow) {
      //unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: TargetUserId,
          },
        },
      });
    } else {
      //follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: TargetUserId,
          },
        }),
        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: TargetUserId, //user being follow
            creatorId: userId, //user follow
          },
        }),
      ]);
    }
    revalidatePath("/"); // purge the cache for the profile page
    return { success: true };
  } catch (error) {
    console.error("Error toggling follow:", error);
    return { success: false, error: "Error to toggle follow" };
  }
}
