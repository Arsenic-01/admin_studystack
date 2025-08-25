import {
  FuzzyOverlay,
  NotFoundErrorMessage,
} from "@/components/notFound/Fuzzy";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <NotFoundErrorMessage />
      <FuzzyOverlay />
    </div>
  );
}
