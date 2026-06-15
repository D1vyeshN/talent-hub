import { Suspense } from "react";
import { RecruiterMessagesPage } from "./RecruiterMessage";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecruiterMessagesPage />
    </Suspense>
  );
}