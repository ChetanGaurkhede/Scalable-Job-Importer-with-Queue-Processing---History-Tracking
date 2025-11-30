import "./globals.css";

export const metadata = {
  title: "Job Import History",
  description: "Monitor job feed imports backed by the Express API"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


