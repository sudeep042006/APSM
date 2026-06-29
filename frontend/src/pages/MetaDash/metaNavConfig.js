// ── metaNavConfig.js ─────────────────────────────────────────────────
// Nav item arrays separated from the MetaInnerSidebar component file.
// This satisfies Vite's Fast Refresh constraint: a file that exports
// a React component must NOT also export non-component values.
//
// Imported by MetaInnerSidebar (for default, re-exported) and directly
// by FacebookDash / InstagramDash.

import {
  BarChart3, Users, Heart, FileText,
  ThumbsUp, Eye, Video, History, Target, Settings, HelpCircle,
  PlaySquare, TrendingUp, Hash, LayoutDashboard,
} from "lucide-react";

// ── Facebook nav items ───────────────────────────────────────────────
export const FB_NAV = [
  { key: "overview",    label: "Overview",      icon: BarChart3     },
  { key: "content",     label: "Content",       icon: FileText      },
  { key: "audience",    label: "Audience",      icon: Users         },
  { key: "engagement",  label: "Engagement",    icon: Heart         },
  { key: "page_likes",  label: "Page Likes",    icon: ThumbsUp      },
  { key: "reach_views", label: "Reach & Views", icon: Eye           },
  { key: "videos",      label: "Videos",        icon: Video         },
  { key: "stories",     label: "Stories",       icon: History       },
  { key: "groups",      label: "Groups",        icon: Users         },
  { key: "ads",         label: "Ads",           icon: Target        },
  { key: "reports",     label: "Reports",       icon: FileText      },
  { key: "insights",    label: "Insights",      icon: BarChart3     },
  { key: "settings",    label: "Settings",      icon: Settings      },
  { key: "help",        label: "Help",          icon: HelpCircle    },
];

// ── Instagram nav items ──────────────────────────────────────────────
export const IG_NAV = [
  { key: "overview",   label: "Overview",   icon: BarChart3  },
  { key: "content",    label: "Content",    icon: FileText   },
  { key: "audience",   label: "Audience",   icon: Users      },
  { key: "engagement", label: "Engagement", icon: Heart      },
  { key: "stories",    label: "Stories",    icon: History    },
  { key: "reels",      label: "Reels",      icon: PlaySquare },
  { key: "growth",     label: "Growth",     icon: TrendingUp },
  { key: "hashtags",   label: "Hashtags",   icon: Hash       },
  { key: "ads",        label: "Ads",        icon: Target     },
  { key: "insights",   label: "Insights",   icon: BarChart3  },
  { key: "reports",    label: "Reports",    icon: FileText   },
  { key: "settings",   label: "Settings",   icon: Settings   },
  { key: "help",       label: "Help",       icon: HelpCircle },
];
