export const metadata = {
  title: "Capsule Event Recap Generator",
  description: "Generate shot-by-shot video outlines for Capsule VIP dinner recaps.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#fff" }}>{children}</body>
    </html>
  );
}
