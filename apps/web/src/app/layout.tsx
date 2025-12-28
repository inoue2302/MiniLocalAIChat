export const metadata = {
  title: 'Mini Local AI Chat',
  description: 'Local LLM Chat with IPFS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
