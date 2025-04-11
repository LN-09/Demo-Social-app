"use server";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getProfileByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.log("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { id: "desc" }, // Replace 'id' with a valid field from your Prisma schema
    });
    return posts;
  } catch (error) {
    console.log("Error fetching user posts:", error);
    throw new Error("Failed to fetch user posts");
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    const likedPosts = await prisma.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    return likedPosts;
  } catch (error) {
    console.log("Error fetching liked posts:", error);
    throw new Error("Failed to fetch liked posts");
  }
}

export async function UpdateProfile(formData: FormData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        location,
        website,
      },
    });

    revalidatePath(`/profile`);
    return { success: true, message: "Profile updated successfully", user };
  } catch (error) {
    console.log("Error updating profile:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

export async function IsFollowing(userId: string) {
  // const { userId: currentUserId } = await auth();
  // if (!currentUserId) return false;

  try {
  const { userId: currentUserId } = await auth();
  if (!currentUserId) return false;
    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return follow ? true : false;
  } catch (error) {
    console.log("Error checking follow status:", error);
    throw new Error("Failed to check follow status");
  }
}

