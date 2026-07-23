import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-mad-bg">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 pt-16 lg:p-8 lg:pt-8">{children}</main>
    </div>
  );
}
