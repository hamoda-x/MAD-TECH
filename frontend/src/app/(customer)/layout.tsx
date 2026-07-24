import CustomerLayoutClient from "@/components/customer/CustomerLayoutClient";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerLayoutClient>{children}</CustomerLayoutClient>;
}
