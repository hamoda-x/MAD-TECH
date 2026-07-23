import MADTechHeader from "@/components/customer/MADTechHeader";
import MADTechFooter from "@/components/customer/MADTechFooter";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <MADTechHeader />
      <main className="flex-1">{children}</main>
      <MADTechFooter />
    </div>
  );
}
