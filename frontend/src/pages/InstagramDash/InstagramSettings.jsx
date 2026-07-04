import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2, Bell, Shield, LogOut } from 'lucide-react';

const InstagramSettings = () => {
  const { isConnected, profile } = useOutletContext();

  return (
    <div className="p-4 md:p-8 space-y-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your Instagram connection and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 shadow-sm">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-gray-400" />
                <CardTitle className="text-lg text-white">Connection Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isConnected && profile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={profile.profilePicture} alt="Profile" className="w-12 h-12 rounded-full border border-gray-700" />
                    <div>
                      <p className="text-white font-medium">{profile.handle}</p>
                      <p className="text-sm text-emerald-500">Connected</p>
                    </div>
                  </div>
                  <Button variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20">
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400 mb-4">Your Instagram account is currently disconnected.</p>
                  <Button className="bg-[#E1306C] hover:bg-[#E1306C]/90 text-white">
                    Connect Instagram
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 shadow-sm">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-400" />
                <CardTitle className="text-lg text-white">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Weekly Reports</p>
                  <p className="text-sm text-gray-400">Receive a weekly summary of your performance.</p>
                </div>
                <div className="w-10 h-6 bg-[#E1306C] rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#161B22]/90 backdrop-blur-md rounded-xl border border-white/5 shadow-sm">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" />
                <CardTitle className="text-lg text-white">Data Privacy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-400 mb-4">
                We only read your analytics data. We never post on your behalf or access your private messages.
              </p>
              <Button variant="link" className="text-[#E1306C] p-0 h-auto">View Privacy Policy</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstagramSettings;
