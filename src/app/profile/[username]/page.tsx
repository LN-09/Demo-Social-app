import { getProfileByUsername, getUserLikedPosts, getUserPosts, IsFollowing } from "@/actions/profile.action";
import { notFound } from "next/navigation";
import ProfilePageClient from "@/app/profile/[username]/ProfilePageClient";

export async function generateMetaData({params}: {params:{username :string}}) {
  const  user = await getProfileByUsername(params.username);
  if(!user) return;

  return {
    title: `${user.name ?? user.name} `,
    description: user.bio || `Check out ${user.name}'s profile`,
  }
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const  user = await getProfileByUsername(params.username);

  if(!user) return notFound();
  const [posts, likePosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    IsFollowing(user.id),
  ]);

  return <ProfilePageClient
    user = {user}
    posts = {posts}
    likedPosts = {likePosts}
    isFollowing = {isCurrentUserFollowing}
  />;
}

export default ProfilePageServer;
