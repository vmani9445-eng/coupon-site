import "./globals.css";
import Navbar from "./Components/Navbar";
import SessionTracker from "./Components/SessionTracker";
import AuthProvider from "./Components/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SessionTracker />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}