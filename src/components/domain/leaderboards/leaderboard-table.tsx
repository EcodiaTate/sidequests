import { Avatar } from "@/components/ui/avatar";

type Entry = {
  user_id: string | null;
  eco: number | null;
  rank: number | null;
  profile: { id: string; display_name: string | null; avatar_url: string | null } | null;
};

type Props = {
  entries: Entry[];
  currentUserId?: string;
};

function getRankStyle(rank: number | null) {
  if (rank === 1) return { color: "var(--rank-gold)", fontWeight: 700 };
  if (rank === 2) return { color: "var(--rank-silver)", fontWeight: 700 };
  if (rank === 3) return { color: "var(--rank-bronze)", fontWeight: 700 };
  return {};
}

function getRankLabel(rank: number | null) {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank ?? "-"}`;
}

export function LeaderboardTable({ entries, currentUserId }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {entries.map((entry, idx) => {
        const isCurrentUser = entry.user_id === currentUserId;
        return (
          <div
            key={entry.user_id ?? idx}
            className="card pad-3 flex items-center gap-3"
            style={{
              border: "var(--neo-border-thin) solid var(--border)",
              boxShadow: "var(--neo-shadow-sm)",
              ...(isCurrentUser ? { background: "var(--ec-mint-50)" } : {}),
            }}
          >
            {/* Rank */}
            <div className="w-8 text-center shrink-0">
              <span
                className="text-fluid-sm"
                style={getRankStyle(entry.rank)}
              >
                {getRankLabel(entry.rank)}
              </span>
            </div>

            {/* Avatar + name */}
            <Avatar
              src={entry.profile?.avatar_url}
              alt={entry.profile?.display_name ?? "User"}
              size="sm"
              fallback={entry.profile?.display_name ?? "?"}
            />
            <div className="flex-1 min-w-0">
              <p className={`text-fluid-sm truncate ${isCurrentUser ? "font-bold t-strong" : "t-base"}`}>
                {entry.profile?.display_name ?? "User"}
                {isCurrentUser && " (you)"}
              </p>
            </div>

            {/* ECO */}
            <div className="text-right shrink-0">
              <p
                className="text-fluid-sm font-bold"
                style={{ color: "var(--ec-mint-600)" }}
              >
                {entry.eco ?? 0}
              </p>
              <p className="stamp">ECO</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
