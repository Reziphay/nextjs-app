import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Reziphay Next App",
  title: {
    default: "Reziphay Next App",
    template: "%s | Reziphay Next App",
  },
  description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae consequuntur neque sit cumque labore laborum officiis laboriosam tenetur qui eos repudiandae sint maiores laudantium culpa, voluptatem magni molestiae veniam quia.",
  authors: [{ name: "Vugar Safarzada" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  );
}
