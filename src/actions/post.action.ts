"use server";

import { PrismaClient } from "@prisma/client";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
const prisma = new PrismaClient();
export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return { success: false, error: "User ID not found" };

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: userId,
      },
    });

    revalidatePath("/"); // purge the cache for the home page
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}
