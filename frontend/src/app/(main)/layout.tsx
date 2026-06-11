import Navbar from "@/components/layout/Navbar";
import { NotificationPanel } from "@/components/layout/NotificationPanel";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <NotificationPanel />
      {children}
    </>
  );
}
