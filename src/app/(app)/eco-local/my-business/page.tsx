import { getMyBusiness } from "@/lib/actions/eco-local";
import { MyBusinessClient } from "@/components/domain/eco-local/my-business-client";

export default async function MyBusinessPage() {
  const business = await getMyBusiness();

  return (
    <div className="container-page py-4">
      <div className="space-y-2 mb-4">
        <h1 className="text-fluid-xl uppercase">My Business</h1>
        <p className="text-fluid-sm t-muted">
          Manage your business profile, offers, and view performance
        </p>
      </div>
      <MyBusinessClient business={business} />
    </div>
  );
}
