'use client';

import { useEffect, useState } from 'react';

export default function AnalyticsDashboard() {
  const [pageViews, setPageViews] = useState<number[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [visitsByPath, setVisitsByPath] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        // Get total count
        const totalResp = await fetch('/api/analytics?path=');
        const totalData = await totalResp.json();
        setTotalViews(totalData.count);
        // Fetch grouped analytics from API
        const pathsResp = await fetch('/api/analytics');
        const pathsData = await pathsResp.json();
        if (pathsData && typeof pathsData === 'object') {
          const entries = Object.entries(pathsData);
          setVisitsByPath(new Map(entries.map(([k, v]) => [k, (v as any)?.count ?? 0])));
          setPageViews(entries.length > 0 ? entries.map(([, v]) => (v as any)?.count ?? 0) : [0]);
        }
      } catch (error) {
        console.error('[analytics] fetch error', error);
        setPageViews([]);
        setTotalViews(0);
      }
      setLoading(false);
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container py-20">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="container py-20">
      <h2 className="font-display text-2xl font-bold tracking-tight mb-6">
        Analytics Dashboard
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-lg border border-border/70">
          <p className="font-display text-3xl font-bold">{totalViews}</p>
          <p className="text-sm text-muted-foreground">Total Page Views</p>
        </div>
        <div className="p-6 rounded-lg border border-border/70">
          <p className="font-display text-3xl font-bold">{pageViews.length}</p>
          <p className="text-sm text-muted-foreground">Top Paths</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/70">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-3 font-bold">Path</th>
              <th className="text-left p-3 font-bold">Views</th>
              <th className="text-left p-3 font-bold">Last Visited</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(visitsByPath.entries()).map(([path, count]) => (
              <tr key={path}>
                <td className="p-3">{path}</td>
                <td className="p-3">{count}</td>
                <td className="p-3">N/A</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground mt-6">
        Page view tracking is active. Data is stored in the SQLite database.
        {totalViews === 0 && (
          <span>No page views recorded yet.</span>
        )}
      </p>
    </div>
  );
}