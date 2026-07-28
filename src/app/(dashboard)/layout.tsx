import { Providers } from "@/components/providers";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </Providers>
  );
}
