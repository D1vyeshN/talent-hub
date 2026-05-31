import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ResourcesPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold">Resources</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Career guides, resume tips, interview prep, and more. Coming soon.
      </p>
      <Link
        href="/"
        className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
    </div>
  );
}