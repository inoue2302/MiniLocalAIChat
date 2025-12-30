import 'highlight.js/styles/github-dark.css';

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
      <head>
        <style>{`
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          code {
            font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
          }

          pre {
            border-radius: 4px;
            overflow-x: auto;
          }

          pre code {
            display: block;
            padding: 1rem;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
