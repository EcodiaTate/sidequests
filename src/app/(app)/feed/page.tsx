import { createClient } from "@/lib/supabase/server";
import { getFeedItems } from "@/lib/actions/feed";
import { FeedClient } from "@/components/domain/feed/feed-client";

export default async function FeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const result = await getFeedItems({ scope: "global" });

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-4">Feed</h1>
      <FeedClient
        initialItems={result.data}
        initialCursor={result.nextCursor}
        currentUserId={user?.id}
      />
    </div>
  );
}
