import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

const MetricDetailView = () => {
  const { metricId } = useParams();
  const navigate = useNavigate();

  // Format the metric ID for display
  const title = metricId 
    ? metricId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Metric Detail';

  return (
    <div className="p-6 md:p-8 space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/instagram')}
          className="text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Overview
        </Button>
      </div>

      <Card className="bg-[#161B22] border-gray-800 shadow-xl rounded-xl">
        <CardHeader className="border-b border-gray-800/50 pb-4">
          <CardTitle className="text-2xl text-white font-semibold">
            {title} Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-500 bg-[#0B1121]/50 rounded-lg border border-dashed border-gray-700/50">
            <p className="text-lg">Detailed drill-down view for <span className="font-semibold text-pink-500">{title}</span></p>
            <p className="text-sm mt-2">Charts and data tables will be rendered here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricDetailView;
