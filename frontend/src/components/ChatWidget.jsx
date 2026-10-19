import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IconChat, IconClose, IconSparkle } from './Icons.jsx';
import { useAuth, CHAT_STORAGE_PREFIX } from '../auth.jsx';

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm the NextStep matching assistant. What kind of internship role are you looking for?",
};

export default function ChatWidget({ hidden, open, setOpen }) {
  // Chat history is saved per account so one user never sees another's chat.
  const { user } = useAuth();
  const storageKey = `${CHAT_STORAGE_PREFIX}:${user?.id ?? 'guest'}`;

  const [messages, setMessages] = useState(() => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(storageKey)
    );

    return Array.isArray(saved) && saved.length > 0
      ? saved.slice(-2)
      : [GREETING];
  } catch {
    return [GREETING];
  }
});
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, busy]);
  useEffect(() => {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify(messages.slice(-2))
    );
  } catch (error) {
    console.error('Could not save chat history:', error);
  }
}, [messages, storageKey]);

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
            <span className="chat-head-icon"><IconSparkle size={20} /></span>
            <div className="chat-head-text">
              <strong>AI Matching Assistant</strong>
              <small>Tell me about your interests and skills</small>
            </div>
            <button
              className="chat-x"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <IconClose size={18} />
            </button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="bubble">
  <strong>{m.role === 'assistant' ? 'Assistant: ' : 'You: '}</strong>

  
{m.role === 'assistant' ? (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      a: ({ children, href, ...props }) => {
        const isInternal =
          typeof href === 'string' && href.startsWith('/');

        const isExternal =
          typeof href === 'string' &&
          /^https?:\/\//i.test(href);

        if (!isInternal && !isExternal) {
          return <>{children}</>;
        }

        return isInternal ? (
          <Link
            to={href}
            onClick={() => setOpen(false)}
          >
            {children}
          </Link>
        ) : (
          <a
            {...props}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        );
      },
    }}
  >
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
                        className="btn btn-tonal"
                        onClick={() => setOpen(false)}
                      >
                        View details
                      </Link>

                      <Link
                        to={`/listings/${r.id}#apply`}
                        className="btn btn-filled"
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
            <button className="btn btn-filled btn-lg" disabled={busy}>
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
        {open ? <IconClose size={26} /> : <IconChat size={26} />}
      </button>
    </>
  );
}
