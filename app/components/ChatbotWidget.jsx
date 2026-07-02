"use client";

import { useEffect, useRef, useState } from 'react';
import { asksForDirectWork, buildFallbackReply, isOutOfScope, mentionsMoney, mentionsSubscription, needsHumanHelp, normalize } from '../lib/chatRules';
import { ChatBubbleIcon, SparklesIcon } from './Icons';

const initialMessages = [
  {
    role: 'assistant',
    text: 'Hej! Jag är Aegis AI-assistent. Jag kan hjälpa dig hitta rätt tjänst, förstå ditt projekt och ställa rätt frågor innan du kontaktar oss.'
  }
];

const defaultSuggestedPrompts = [
  'Vad kan ni hjälpa med?',
  'Jag vill bygga en AI-chatbot',
  'Vilken lösning passar mig?',
  'Hjälp mig skriva ett mejl'
];

const mailSuggestedPrompts = [
  'Hjälp mig skriva ett mejl',
  'Vilken information ska jag skicka?',
  'Öppna kontaktformuläret'
];

const CHAT_FIRST_OPEN_DELAY_MS = 10000;
const CHAT_AUTO_OPENED_STORAGE_KEY = 'aegis-chat-auto-opened';

const sectionLabels = {
  top: 'startsidan',
  services: 'tjänsteområdet',
  calculator: 'projektkalkylatorn',
  subscriptions: 'abonnemang för webbundehåll och IT-support',
  contact: 'kontaktformuläret'
};

const sectionPrompts = {
  services: 'Jag ser att du tittar på våra tjänster. Vilket område låter mest relevant för dig: hemsida/app, AI, cybersäkerhet, data/Excel eller IoT?',
  calculator: 'Vill du att jag hjälper dig välja rätt delar i projektkalkylatorn? Berätta kort vad du vill bygga.',
  subscriptions: 'Jag ser att du tittar på abonnemang. Är det för dig som privatperson eller för ett företag, och behöver du mest webbundehåll, mindre utveckling eller IT-support?',
  contact: 'Du är nära kontaktformuläret. Vill du att jag hjälper dig formulera ett tydligt meddelande till Aegis innan du skickar?'
};

const sectionSuggestedPrompts = {
  services: [
    'Vilken tjänst passar mig?',
    'Jag behöver hjälp med en hemsida',
    'Jag vill ha IT-support',
    'Hjälp mig skriva ett mejl'
  ],
  calculator: [
    'Vilka delar behöver mitt projekt?',
    'Är mitt projekt litet eller stort?',
    'Jag vill beskriva mitt projekt',
    'Öppna kontaktformuläret'
  ],
  subscriptions: [
    'Är Privat rätt för mig?',
    'Vilket paket passar företag?',
    'Vad ingår i högre nivåer?',
    'Hjälp mig skriva ett mejl'
  ],
  contact: mailSuggestedPrompts
};

const buildSuggestedPrompts = (message) => {
  const normalized = normalize(message);

  if (isOutOfScope(message)) {
    return [
      'Vad kan Aegis hjälpa med?',
      'Jag behöver hjälp med en hemsida',
      'Jag vill ha IT-support',
      'Hjälp mig skriva ett mejl'
    ];
  }

  if (mentionsMoney(message) || /(mejl|mail|kontakt|formular|skicka|offert)/.test(normalized)) {
    return mailSuggestedPrompts;
  }

  if (asksForDirectWork(message)) {
    return mailSuggestedPrompts;
  }

  if (mentionsSubscription(message)) {
    return [
      'Är Privat rätt för mig?',
      'Vilket paket passar företag?',
      'Vad ingår i högre nivåer?',
      'Öppna kontaktformuläret'
    ];
  }

  if (/(ai|chatbot|automation|automatisering|assistent|support)/.test(normalized)) {
    return [
      'Vilka frågor ska chatboten svara på?',
      'Kan chatboten samla kundens mejl?',
      'Kan den skicka vidare svåra frågor?',
      'Hjälp mig skriva ett mejl'
    ];
  }

  if (/(webb|hemsida|app|system|fullstack|bokning|portal)/.test(normalized)) {
    return [
      'Behöver jag en ny sida eller underhåll?',
      'Vilka funktioner behöver sidan?',
      'Kan ni hjälpa efter lansering?',
      'Öppna kontaktformuläret'
    ];
  }

  if (/(sakerhet|cyber|gdpr|intrang|brandvagg|nätverk|natverk)/.test(normalized)) {
    return [
      'Vad behöver säkras först?',
      'Kan ni felsöka IT-problem?',
      'Behöver jag löpande support?',
      'Hjälp mig skriva ett mejl'
    ];
  }

  if (/(excel|data|rapport|databas|automatisera)/.test(normalized)) {
    return [
      'Vad kan automatiseras?',
      'Kan ni samla mina filer?',
      'Kan ni skapa rapporter?',
      'Hjälp mig skriva ett mejl'
    ];
  }

  if (needsHumanHelp(message)) {
    return [
      'Hjälp mig skriva ett mejl',
      'Vilken information ska jag skicka?',
      'Öppna kontaktformuläret'
    ];
  }

  return defaultSuggestedPrompts;
};

const toApiMessages = (messages) =>
  messages.map((message) => ({
    role: message.role,
    content: message.text
  }));

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [pageContext, setPageContext] = useState('startsidan');
  const [answerSource, setAnswerSource] = useState('ready');
  const [suggestedPrompts, setSuggestedPrompts] = useState(defaultSuggestedPrompts);
  const askedSectionsRef = useRef(new Set());
  const hasAutoOpenedRef = useRef(false);
  const isOpenRef = useRef(false);
  const autoOpenTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  useEffect(() => () => {
    if (autoOpenTimerRef.current) {
      window.clearTimeout(autoOpenTimerRef.current);
    }
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const clearAutoOpenTimer = () => {
    if (autoOpenTimerRef.current) {
      window.clearTimeout(autoOpenTimerRef.current);
      autoOpenTimerRef.current = null;
    }
  };

  const markAutoOpenSeen = () => {
    hasAutoOpenedRef.current = true;

    try {
      window.localStorage.setItem(CHAT_AUTO_OPENED_STORAGE_KEY, 'true');
    } catch {
      // localStorage can be unavailable in private or restricted browsing modes.
    }
  };

  const openChat = () => {
    clearAutoOpenTimer();
    markAutoOpenSeen();
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    clearAutoOpenTimer();
  };

  useEffect(() => {
    try {
      if (window.localStorage.getItem(CHAT_AUTO_OPENED_STORAGE_KEY) === 'true') {
        hasAutoOpenedRef.current = true;
        return undefined;
      }
    } catch {
      if (hasAutoOpenedRef.current) {
        return undefined;
      }
    }

    autoOpenTimerRef.current = window.setTimeout(() => {
      markAutoOpenSeen();
      setIsOpen(true);
      autoOpenTimerRef.current = null;
    }, CHAT_FIRST_OPEN_DELAY_MS);

    return () => {
      clearAutoOpenTimer();
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('[data-chat-section]');

    if (!sections.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        const section = visibleEntry.target.getAttribute('data-chat-section');
        const nextContext = sectionLabels[section] || 'startsidan';
        setPageContext(nextContext);

        if (!sectionPrompts[section] || askedSectionsRef.current.has(section)) {
          return;
        }

        window.setTimeout(() => {
          if (!isOpenRef.current || askedSectionsRef.current.has(section)) {
            return;
          }

          askedSectionsRef.current.add(section);
          setSuggestedPrompts(sectionSuggestedPrompts[section] || defaultSuggestedPrompts);
          setMessages((currentMessages) => [
            ...currentMessages,
            { role: 'assistant', text: sectionPrompts[section] }
          ]);
        }, 450);
      },
      {
        threshold: [0.45, 0.65],
        rootMargin: '-12% 0px -22% 0px'
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const askChat = async (nextMessages, userText) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageContext,
          messages: toApiMessages(nextMessages)
        })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.reply) {
        throw new Error(data?.message || 'Chatten kunde inte svara just nu.');
      }

      setAnswerSource(data.source || 'fallback');
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: data.reply }
      ]);
      setSuggestedPrompts(buildSuggestedPrompts(`${userText} ${data.reply}`));
    } catch {
      setAnswerSource('fallback');
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: buildFallbackReply(userText) }
      ]);
      setSuggestedPrompts(buildSuggestedPrompts(userText));
    } finally {
      setIsThinking(false);
    }
  };

  const sendMessage = (message) => {
    const trimmed = message.trim();

    if (!trimmed || isThinking) {
      return;
    }

    const userMessage = { role: 'user', text: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsThinking(true);
    setSuggestedPrompts(buildSuggestedPrompts(trimmed));
    askChat(nextMessages, trimmed);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const openContactForm = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    openChat();
    setSuggestedPrompts(mailSuggestedPrompts);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: 'assistant',
        text: 'Jag öppnar kontaktformuläret. Skriv gärna namn, e-post, telefon och en kort beskrivning av vad du behöver hjälp med.'
      }
    ]);
  };

  const handleSuggestedPrompt = (prompt) => {
    if (prompt === 'Öppna kontaktformuläret') {
      openContactForm();
      return;
    }

    sendMessage(prompt);
  };

  const statusText = answerSource === 'ollama'
    ? 'Gratis lokal AI aktiv'
    : 'Gratis AI-läge redo';

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label="Aegis AI-chatbot"
          className="w-[calc(100vw-2.5rem)] max-w-[390px] overflow-hidden rounded-2xl border border-brand-border bg-slate-950/95 shadow-2xl shadow-brand-glow/25 backdrop-blur-xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-brand-border bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-primary/10 text-brand-primary">
                <ChatBubbleIcon className="h-5 w-5" />
                <SparklesIcon className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full bg-slate-950 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">Aegis AI</h2>
                <p className="text-xs font-medium text-brand-muted">{statusText}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border text-brand-muted transition hover:border-brand-primary hover:text-white"
              aria-label="Stäng chatten"
              title="Stäng chatten"
            >
              <span aria-hidden="true" className="text-xl leading-none">x</span>
            </button>
          </div>

          <div className="h-[360px] overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {messages.map((message, index) => {
                const isAssistant = message.role === 'assistant';

                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isAssistant
                          ? 'border border-brand-border bg-white/[0.04] text-brand-muted'
                          : 'bg-brand-primary text-brand-bg'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="max-w-[84%] rounded-2xl border border-brand-border bg-white/[0.04] px-4 py-3 text-sm leading-6 text-brand-muted">
                    Aegis AI tänker...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-brand-border px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  disabled={isThinking}
                  className="rounded-full border border-brand-border bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-brand-muted transition hover:border-brand-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Skriv din fråga..."
                disabled={isThinking}
                className="min-w-0 flex-1 rounded-xl border border-brand-border bg-white px-3 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={isThinking}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-brand-bg shadow-lg shadow-brand-glow transition hover:bg-brand-primary-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Skicka meddelande"
                title="Skicka"
              >
                <span aria-hidden="true" className="text-lg leading-none">&gt;</span>
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            closeChat();
          } else {
            openChat();
          }
        }}
        className="group flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-primary px-4 py-3 font-black text-brand-bg shadow-xl shadow-brand-glow transition hover:bg-brand-primary-hover active:scale-95"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Stäng Aegis AI-chatbot' : 'Öppna Aegis AI-chatbot'}
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-brand-bg/15">
          <ChatBubbleIcon className="h-4 w-4" />
          <SparklesIcon className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-brand-primary text-brand-bg" />
        </span>
        <span className="text-sm">Chatta med Aegis AI</span>
      </button>
    </div>
  );
}
