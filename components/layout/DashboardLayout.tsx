"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MenuIcon, XIcon } from "@/components/icons/Icons";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FE] dark:bg-[#0B0D1B]">
      {/* Desktop sidebar */}
      <Sidebar className="hidden lg:flex" />

      {/* Main content */}
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        {/* Desktop header */}
        <div className="hidden lg:block">
          <Header title={title} />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden bg-[#F8F9FE] dark:bg-[#0B0D1B]">
          {children}
        </main>
      </div>
    </div>
  );
}
