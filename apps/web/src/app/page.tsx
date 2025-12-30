'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

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

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Mini Local AI Chat</h1>

      {/* メッセージ一覧 */}
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '1rem',
          height: '400px',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: '#999' }}>メッセージはありません</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '1rem',
                padding: '0.5rem',
                borderRadius: '4px',
                backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#fff',
                border: msg.role === 'user' ? '1px solid #90caf9' : '1px solid #eee',
              }}
            >
              <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
              <div style={{ marginTop: '0.25rem' }}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 入力欄 + 送信 */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="メッセージを入力..."
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minHeight: '60px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#1976d2',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-end',
          }}
        >
          {isLoading ? '送信中...' : '送信'}
        </button>
      </div>

      {/* Publishボタン */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handlePublish}
          disabled={!sessionId}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#4caf50',
            color: 'white',
            cursor: sessionId ? 'pointer' : 'not-allowed',
          }}
        >
          Publish
        </button>
        {publishedCid && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#e8f5e9',
              borderRadius: '4px',
            }}
          >
            <strong>CID:</strong> {publishedCid}
          </div>
        )}
      </div>

      {/* CID入力 + Loadボタン */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={loadCidInput}
          onChange={(e) => setLoadCidInput(e.target.value)}
          placeholder="CIDを入力..."
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleLoad}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#ff9800',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Load
        </button>
      </div>

      {sessionId && (
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Session ID: {sessionId}
        </p>
      )}
    </div>
  );
}
