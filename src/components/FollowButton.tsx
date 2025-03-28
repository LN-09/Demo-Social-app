"use client";

import { useState } from "react";
import { Button } from "./common/ui/button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { ToggleFollow } from "@/actions/user.action";

function FollowButton({ userId }: { userId: string }) {
  const [isloading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await ToggleFollow(userId);
      toast.success("Follow successfully");
    } catch (error) {
      console.log("Can not loading" + error);
      toast.error("Error to follower user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isloading}
      className="w-20"
    >
      {isloading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
}

export default FollowButton;
