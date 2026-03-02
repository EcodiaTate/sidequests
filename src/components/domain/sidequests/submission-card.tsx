import { Chip } from "@/components/ui/chip";
import { SUBMISSION_STATES } from "@/lib/constants/sidequests";
import type { Submission } from "@/types/domain";

type Props = {
  submission: Submission;
  questTitle?: string;
};

export function SubmissionCard({ submission, questTitle }: Props) {
  const stateConfig = SUBMISSION_STATES[submission.state];

  return (
    <div className="card pad-3 flex gap-3" style={{ border: "var(--neo-border-thin) solid var(--border)" }}>
      {submission.media_url && (
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <img
            src={submission.media_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        {questTitle && (
          <p className="text-fluid-xs t-muted truncate">{questTitle}</p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-fluid-xs font-medium px-1.5 py-0.5 rounded"
            style={{
              background: stateConfig.color,
              color: stateConfig.colorFg,
            }}
          >
            {stateConfig.label}
          </span>

          {submission.state === "approved" && (
            <span className="text-fluid-xs font-medium"
              style={{ color: "var(--ec-mint-600)" }}>
              +{submission.final_eco} ECO / +{submission.final_xp} XP
            </span>
          )}
        </div>

        {submission.caption && (
          <p className="text-fluid-xs t-muted mt-1 line-clamp-2">
            {submission.caption}
          </p>
        )}

        <p className="text-fluid-xs t-subtle mt-1">
          {new Date(submission.created_at ?? "").toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
