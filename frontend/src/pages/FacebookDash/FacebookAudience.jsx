// ── Facebook Audience Page ────────────────────────────────────────────────────
// Reads fbapi.getAudienceMetrics(), which returns the demographic counts Meta
// actually stored:
//
//   { totalGrowth, ageAndGender: [{ group, female, male }],
//     topLocations: [{ location, value, share }], topInterests }
//
// Fabrication removed in this file:
//   • the top-locations donut, legend and "Distribution" bars printed
//     `loc.value}%` and sized each bar with `width: ${loc.value}%`. `value` is
//     a raw fan count from Meta, not a percentage — so every country bar
//     rendered "1240%" and overflowed its track. Shares now come from the
//     `share` the API computes from the returned counts, and the widths come
//     from the real values.
//   • the age/gender bar chart labelled its Y axis "%" while plotting raw
//     counts, and fell back to a hand-written `[{ group: '', female: 0, male: 0 }]`
//     row whenever the API returned nothing
//   • interests rendered `${interest.value}%` with no unit from the API

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import fbapi from "@/services/fbapi";
import { Users, TrendingDown } from "lucide-react";
import CategoryBars from "@/components/charts/CategoryBars";
import DonutChart from "@/components/charts/DonutChart";
import { PLATFORM_ACCENT, seriesColors } from "@/components/charts/platformTheme";
import { compact } from "@/components/charts/chartTheme";

const FB = PLATFORM_ACCENT.facebook;
const FB_SERIES = seriesColors("facebook", 3);

const FacebookAudience = () => {
  const { isConnected } = useOutletContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const result = await fbapi.getAudienceMetrics();
        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError("Could not load audience data.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  if (error)
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <TrendingDown className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-sm text-gray-400">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white text-xs"
          >
            Retry
          </Button>
        </div>
      </div>
    );

  const ageGender = data?.ageAndGender || [];
  const locations = data?.topLocations || [];
  const interests = Array.isArray(data?.topInterests) ? data.topInterests : [];
  const hasDemographics = ageGender.length > 0 || locations.length > 0;

  // Age bands, ranked by the combined measured fan count.
  const ageRows = ageGender
    .map((a) => ({
      name: a.group,
      value: (Number(a.female) || 0) + (Number(a.male) || 0),
      female: Number(a.female) || 0,
      male: Number(a.male) || 0,
    }))
    .filter((r) => r.value > 0);

  // One measured total per gender across every age band.
  const genderTotals = ageGender.reduce(
    (acc, a) => ({
      female: acc.female + (Number(a.female) || 0),
      male: acc.male + (Number(a.male) || 0),
    }),
    { female: 0, male: 0 }
  );
  const genderRows = [
    { name: "Women", value: genderTotals.female },
    { name: "Men", value: genderTotals.male },
  ].filter((g) => g.value > 0);

  const locationRows = locations
    .map((l) => ({ name: l.location, value: Number(l.value) || 0, share: Number(l.share) || 0 }))
    .filter((l) => l.value > 0);

  if (!isLoading && !hasDemographics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Audience Insights Unavailable</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Meta returns age, gender and country demographics only for pages with enough fans to
            publish demographics. This page has no stored demographic rows yet — nothing is
            estimated or shown as zero.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Age bands ───────────────────────────────────────────────── */}
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Age Distribution</CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Fans per age band, summed from the counts Meta returned for each gender
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-4 w-full bg-gray-700/30" />
                ))}
              </div>
            ) : (
              <CategoryBars
                data={ageRows.map((r) => ({ name: r.name, value: r.value }))}
                color={FB}
                valueLabel="Fans"
                emptyTitle="No age data returned"
                emptyDetail="Meta returned no age-band rows for this page. Age and gender breakdowns require page-level demographic access."
              />
            )}
          </CardContent>
        </Card>

        {/* ── Gender split ────────────────────────────────────────────── */}
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Gender Split</CardTitle>
            <p className="mt-1 text-xs text-slate-400">Totals across every age band Meta reported</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full bg-gray-700/30 rounded-xl" />
            ) : (
              <DonutChart
                data={genderRows}
                dataKey="value"
                nameKey="name"
                colors={FB_SERIES.slice(0, 2)}
                height={220}
                outerRadius={86}
                innerRadius={58}
                centerLabel="Fans by gender"
                centerValue={compact(genderTotals.female + genderTotals.male)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Top locations ───────────────────────────────────────────── */}
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Top Locations</CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Fans by country, with share computed from the returned counts
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-4 w-full bg-gray-700/30" />
                ))}
              </div>
            ) : (
              <CategoryBars
                data={locationRows.map((l) => ({ name: l.name, value: l.value, share: l.share }))}
                color={FB_SERIES[1]}
                valueLabel="Fans"
                emptyTitle="No location data returned"
                emptyDetail="Meta returned no country-level fan counts for this page."
              />
            )}
          </CardContent>
        </Card>

        {/* ── Top interests ───────────────────────────────────────────── */}
        <Card className="surface-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white">Top Audience Interests</CardTitle>
            <p className="mt-1 text-xs text-slate-400">Exactly the interest labels Meta returned</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-700/30 rounded-xl" />
                ))}
              </div>
            ) : interests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-200">No interest data returned</p>
                <p className="mt-1 max-w-xs text-xs text-slate-400">
                  Meta did not return an interest breakdown for this page. Interest affinities are
                  only published for pages above Meta's demographic threshold.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {interests.map((interest, i) => {
                  // Values pass through untouched — the API decides the unit.
                  const shown =
                    typeof interest?.value === "number"
                      ? Number.isInteger(interest.value)
                        ? interest.value.toLocaleString()
                        : Number(interest.value).toFixed(2)
                      : interest?.value ?? "—";
                  return (
                    <li
                      key={`${interest?.name}-${i}`}
                      className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center transition-colors hover:border-[#1877F2]/30"
                    >
                      <p className="text-sm font-semibold text-white tabular-nums">{shown}</p>
                      <p className="mt-1 truncate text-[11px] text-gray-400">{interest?.name}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacebookAudience;