'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Loader2, Send, Copy, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [publishedCid, setPublishedCid] = useState<string | null>(null);
  const [loadCidInput, setLoadCidInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'エラーが発生しました' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!sessionId) {
      alert('まず会話を開始してください');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/sessions/${sessionId}/publish`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to publish');
      }

      const data = await res.json();
      setPublishedCid(data.cid);
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Publishに失敗しました');
    }
  };

  const handleLoad = async () => {
    if (!loadCidInput.trim()) {
      alert('CIDを入力してください');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/ipfs/${loadCidInput}`);

      if (!res.ok) {
        throw new Error('Failed to load');
      }

      const session = await res.json();
      setSessionId(session.sessionId);

      const loadedMessages: Message[] = session.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      setMessages(loadedMessages);
      setPublishedCid(null);
    } catch (error) {
      console.error('Error loading:', error);
      alert('Loadに失敗しました');
    }
  };

  const handleCopyCid = async () => {
    if (!publishedCid) return;

    try {
      await navigator.clipboard.writeText(publishedCid);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <main className="container py-10">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Mini Local AI Chat</CardTitle>
          <CardDescription>Local LLM chat sessions with IPFS publish/load.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <Button
                variant="secondary"
                onClick={handlePublish}
                disabled={!sessionId}
                className="justify-center"
              >
                Publish
              </Button>
              {publishedCid ? (
                <div className="flex items-center gap-2">
                  <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                    <span className="font-medium">CID:</span> {publishedCid}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCid}
                    className="h-9 w-9 p-0"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ) : (
                <div className="hidden md:block" />
              )}
            </div>

            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <Input
                value={loadCidInput}
                onChange={(e) => setLoadCidInput(e.target.value)}
                placeholder="CIDを入力..."
              />
              <Button variant="outline" onClick={handleLoad}>
                Load
              </Button>
            </div>
          </div>

          <div className="h-[420px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">メッセージはありません</p>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'rounded-lg border bg-background p-3',
                      msg.role === 'user' && 'border-primary/30 bg-primary/[0.06]',
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </div>
                    <div className="mt-2">
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:rounded-md prose-pre:border prose-pre:bg-[#0d1117] prose-pre:p-3">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    返信を生成中…
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="メッセージを入力..."
              disabled={isLoading}
              className="min-h-[96px]"
            />
            <div className="flex items-center justify-between">
              {sessionId ? (
                <div className="text-xs text-muted-foreground">
                  Session ID: <span className="font-mono">{sessionId}</span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  会話を開始するとSession IDが表示されます
                </div>
              )}

              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    送信中…
                  </>
                ) : (
                  <>
                    <Send />
                    送信
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
