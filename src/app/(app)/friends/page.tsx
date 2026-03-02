import { getFriends, getFriendRequests, getBlocked } from "@/lib/actions/social";
import { FriendsClient } from "@/components/domain/friends/friends-client";

export default async function FriendsPage() {
  const [friends, requests, blocked] = await Promise.all([
    getFriends(),
    getFriendRequests(),
    getBlocked(),
  ]);

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-4">Friends</h1>
      <FriendsClient
        initialFriends={friends}
        initialRequests={requests}
        initialBlocked={blocked}
      />
    </div>
  );
}
