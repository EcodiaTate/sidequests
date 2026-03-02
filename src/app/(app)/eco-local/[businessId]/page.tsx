import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessById, getBusinessReviews, canReviewBusiness } from "@/lib/actions/eco-local";
import { BusinessDetailClient } from "@/components/domain/eco-local/business-detail-client";
import { BusinessReviewsSection } from "@/components/domain/eco-local/business-reviews-section";

type Props = {
  params: Promise<{ businessId: string }>;
};

export default async function BusinessDetailPage({ params }: Props) {
  const { businessId } = await params;
  const business = await getBusinessById(businessId);

  if (!business) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === business.owner_id;

  const [reviews, canReview] = await Promise.all([
    getBusinessReviews(businessId),
    canReviewBusiness(businessId),
  ]);

  const userReviewId = reviews.find((r) => r.user_id === user?.id)?.id ?? null;

  return (
    <div className="container-page py-4">
      <BusinessDetailClient business={business} isOwner={isOwner} />
      <div className="mt-6">
        <BusinessReviewsSection
          businessId={businessId}
          initialReviews={reviews}
          currentUserId={user?.id ?? null}
          canReview={canReview}
          userReviewId={userReviewId}
        />
      </div>
    </div>
  );
}
