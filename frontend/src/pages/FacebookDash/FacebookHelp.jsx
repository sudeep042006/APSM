import React, { useState } from 'react';
import { Search, RefreshCw, BarChart2, Users, Mail, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

// A simple custom accordion item
const AccordionItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-white/10 last:border-0">
    <button
      className="flex w-full items-center justify-between py-4 text-left font-medium text-white transition-all hover:underline"
      onClick={onClick}
    >
      {question}
      <ChevronDown
        className={`h-4 w-4 shrink-0 transition-transform duration-200 text-gray-400 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    <div
      className={`overflow-hidden text-sm text-gray-400 transition-all ${
        isOpen ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      {answer}
    </div>
  </div>
);

export default function FacebookHelp() {
  const [openAccordionIndex, setOpenAccordionIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordionIndex((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      question: "How often does the dashboard refresh Facebook Page data?",
      answer: "Data is synced via the Facebook Graph API every 4 hours. You can also manually trigger a refresh from the Settings page or the dashboard header."
    },
    {
      question: "Why don't my dashboard numbers match Meta Business Suite exactly?",
      answer: "Meta Business Suite provides real-time estimates. Our API pulls validated data which may have a 24-48 hour delay as finalized by Facebook."
    },
    {
      question: "How do I export my reports?",
      answer: "Currently, you can use the 'Export' button located in the top right of the main analytics charts to download a CSV or PDF version of your current view."
    }
  ];

  return (
    <div className="h-full overflow-y-auto w-full p-4 md:p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-10 pb-12">
        
        {/* Section A: Search Header */}
        <div className="flex flex-col items-center text-center mt-6">
          <h1 className="text-3xl font-bold text-white mb-6">How can we help?</h1>
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation, tutorials, and troubleshooting..."
              className="w-full bg-[#161B22] border border-white/10 text-white rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        {/* Section B: Quick Topics (Grid) */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Quick Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex flex-col items-center text-center p-6 bg-[#161B22]/90 backdrop-blur-sm border border-white/5 rounded-xl hover:-translate-y-1 hover:border-white/10 transition-all group cursor-pointer text-left h-full">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <RefreshCw className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Data Syncing</h3>
              <p className="text-sm text-gray-400">Why are my page likes delayed?</p>
            </button>
            
            <button className="flex flex-col items-center text-center p-6 bg-[#161B22]/90 backdrop-blur-sm border border-white/5 rounded-xl hover:-translate-y-1 hover:border-white/10 transition-all group cursor-pointer text-left h-full">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart2 className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Understanding Metrics</h3>
              <p className="text-sm text-gray-400">How is Post Reach calculated?</p>
            </button>
            
            <button className="flex flex-col items-center text-center p-6 bg-[#161B22]/90 backdrop-blur-sm border border-white/5 rounded-xl hover:-translate-y-1 hover:border-white/10 transition-all group cursor-pointer text-left h-full">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Account Management</h3>
              <p className="text-sm text-gray-400">Connecting multiple Facebook Pages.</p>
            </button>
          </div>
        </div>

        {/* Section C: FAQ Accordion */}
        <div className="bg-[#161B22]/90 backdrop-blur-sm border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-2">Frequently Asked Questions</h2>
          <div className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openAccordionIndex === index}
                onClick={() => toggleAccordion(index)}
              />
            ))}
          </div>
        </div>

        {/* Section D: Contact Support */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-2">Still need help?</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            Our engineering team is standing by. We generally respond within 24 hours.
          </p>
          <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white gap-2">
            <Mail className="h-4 w-4" />
            Contact Support
          </Button>
        </div>

      </div>
    </div>
  );
}