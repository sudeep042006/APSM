import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, BookOpen, MessageSquare, ExternalLink } from 'lucide-react';

const InstagramHelp = () => {
  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Help & Support</h1>
          <p className="text-gray-400 mt-1">Get assistance with your Instagram Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#161B22]/80 backdrop-blur-md border border-white/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Documentation</CardTitle>
                <p className="text-sm text-gray-400">Learn how to read your metrics</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto flex items-center w-full justify-between group">
                Understanding Reach vs Impressions
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <div className="h-[1px] w-full bg-white/5"></div>
              <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto flex items-center w-full justify-between group">
                How Engagement Rate is Calculated
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <div className="h-[1px] w-full bg-white/5"></div>
              <Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto flex items-center w-full justify-between group">
                Connecting a Business Account
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161B22]/80 backdrop-blur-md border border-white/5 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E1306C]/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-[#E1306C]" />
              </div>
              <div>
                <CardTitle className="text-lg text-white">Contact Support</CardTitle>
                <p className="text-sm text-gray-400">Need help from our team?</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Our support team is available Monday to Friday, 9am to 5pm EST. We typically respond within 2 hours.
            </p>
            <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/5">
              <HelpCircle className="w-4 h-4 mr-2" />
              Open a Support Ticket
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstagramHelp;
