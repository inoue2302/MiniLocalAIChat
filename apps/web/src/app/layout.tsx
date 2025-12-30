import 'highlight.js/styles/github-dark.css';
import './globals.css';

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
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
