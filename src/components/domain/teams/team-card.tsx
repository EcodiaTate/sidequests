import { Users } from "lucide-react";
import Link from "next/link";

type Props = {
  team: {
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    userRole: string;
  };
};

export function TeamCard({ team }: Props) {
  return (
    <Link href={`/teams/${team.id}`} className="card-interactive pad-3 flex items-center gap-3" style={{ border: "var(--neo-border-thin) solid var(--border)", boxShadow: "var(--neo-shadow-sm)" }}>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "var(--ec-mint-100)" }}
      >
        <Users className="w-5 h-5" style={{ color: "var(--ec-mint-600)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-fluid-sm font-semibold t-strong truncate">{team.name}</p>
        {team.description && (
          <p className="text-fluid-xs t-muted truncate">{team.description}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-fluid-sm font-semibold t-strong">{team.memberCount}</p>
        <p className="stamp">members</p>
      </div>
    </Link>
  );
}
