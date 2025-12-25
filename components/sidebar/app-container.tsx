"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarTrigger } from "../ui/sidebar";

function AppContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  return (
    <ScrollArea className="w-full h-screen relative">
      <div className="px-6 py-4 border-b sticky flex items-center justify-between top-0 backdrop-blur-md bg-sidebar/60 z-1">
        <div className="flex items-center">
          {isMobile && <SidebarTrigger className="-ml-1 mr-3" />}
          <div className="space-y-1">
            <h1 className="text-lg font-bold">{title}</h1>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col px-6 py-4 z-0">{children}</div>
    </ScrollArea>

  );
}

export default AppContainer;
