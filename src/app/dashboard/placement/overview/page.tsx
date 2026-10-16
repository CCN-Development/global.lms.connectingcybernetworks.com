import { redirect } from "next/navigation";

/** Placement officers currently work in the CCN Forum only. */
export default function PlacementOverviewPage() {
    redirect("/dashboard/placement/ccn-forum");
}