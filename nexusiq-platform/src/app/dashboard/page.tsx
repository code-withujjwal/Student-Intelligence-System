"use client";

import { CommandCenter } from "@/components/dashboard/command-center";
import { useState } from "react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      <CommandCenter userName="Alex" loading={loading} />
    </div>
  );
}
