import { redirect } from "next/navigation";

// Assignments are always opened in the context of a batch.
export default function LegacyAssignmentRedirect() {
    redirect("/dashboard/trainer/my-batches");
}
