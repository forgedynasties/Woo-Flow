import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Material Icons */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        {/* Montserrat Font */}
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-zinc-50 dark:bg-zinc-950 min-h-screen font-montserrat">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8 ml-64">{children}</main>
        </div>
      </body>
    </html>
  );
}