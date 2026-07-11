import { BookOpen } from "lucide-react";

const FacebookStories = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1877F2]/10">
      <BookOpen className="h-7 w-7 text-[#1877F2]" />
    </div>
    <h2 className="text-lg font-semibold text-white">Stories Not Available</h2>
    <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
      Facebook does not provide Story analytics to third-party apps. Please visit
      <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:underline mx-1">Meta Business Suite</a>
      to view your Story insights.
    </p>
  </div>
);

export default FacebookStories;