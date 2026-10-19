import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm the NextStep matching assistant. What kind of internship role are you looking for?",
};

export default function ChatWidget({ hidden, open, setOpen }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, busy]);

  if (hidden) return null;

  async function send(e) {
    e.preventDefault();

    const text = input.trim();
    if (!text || busy) return;

    const next = [...messages, { role: 'user', content: text }];

    setMessages(next);
    setInput('');
    setBusy(true);

    try {
      const shown_ids = [
        ...new Set(
          next.flatMap((message) =>
            (message.recommendations || []).map((internship) =>
              Number(internship.id)
            )
          )
        ),
      ];

      const res = await api('/chat', {
        method: 'POST',
        body: {
          messages: next.map(({ role, content }) => ({ role, content })),
          shown_ids,
        },
      });

      const assistantMessage = {
        role: 'assistant',
        content: res.reply,
        recommendations: res.recommendations || [],
      };

      setMessages([...next, assistantMessage]);

      if (
        Array.isArray(res.recommendations) &&
        res.recommendations.length > 0
      ) {
        navigate('/listings', {
          state: {
            recommended: res.recommendations,
          },
        });

        setOpen(false);
      }
    } catch (err) {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: `Sorry, something went wrong: ${err.message}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <section className="chat-panel" aria-label="AI Matching Assistant">
          <div className="chat-head">
            <div>
              <strong>AI Matching Assistant</strong>
              <small>Tell me about your interests and skills</small>
            </div>
            <button
              className="chat-x"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="bubble">
  <strong>{m.role === 'assistant' ? 'Assistant: ' : 'You: '}</strong>

  {m.role === 'assistant' ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {m.content}
    </ReactMarkdown>
  ) : (
    <span>{m.content}</span>
  )}
</div>

                {m.recommendations?.map((r) => (
                  <div className="rec" key={r.id}>
                    <strong>{r.title}</strong>
                    <span>{r.company} · {r.location}</span>

                    {r.matched?.length > 0 && (
                      <small>Matches: {r.matched.join(', ')}</small>
                    )}

                    <div className="rec-actions">
                      <Link
                        to={`/listings/${r.id}`}
                        className="btn btn-outline btn-sm"
                        onClick={() => setOpen(false)}
                      >
                        View details
                      </Link>

                      <Link
                        to={`/listings/${r.id}#apply`}
                        className="btn btn-gold btn-sm"
                        onClick={() => setOpen(false)}
                      >
                        Go to application
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {busy && (
              <div className="msg assistant">
                <div className="bubble">Assistant is typing…</div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form className="chat-input" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              maxLength={1000}
            />
            <button className="btn btn-gold" disabled={busy}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        className="chat-fab"
        onClick={() => setOpen(!open)}
        aria-label="Open AI matching assistant"
        title="AI Matching Assistant"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
          <circle cx="9" cy="12" r=".6" fill="#fff" />
          <circle cx="13" cy="12" r=".6" fill="#fff" />
          <circle cx="17" cy="12" r=".6" fill="#fff" />
        </svg>
        <span className="chat-dot" />
      </button>
    </>
  );
}
