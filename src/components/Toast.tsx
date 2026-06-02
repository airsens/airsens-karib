import React, { createContext, useContext, useState, useCallback } from 'react';
import { Info, CheckCircle2, X } from 'lucide-react';

interface Toast { id: number; msg: string; kind: 'info' | 'success'; }
interface ToastCtx { push: (msg: string, kind?: 'info' | 'success') => void; }

const Ctx = createContext<ToastCtx>({ push: () => {} });
export const useToast = () => useContext(Ctx);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((msg: string, kind: 'info' | 'success' = 'info') => {
    const id = Date.now() + Math.random();
    setItems(s => [...s, { id, msg, kind }]);
    setTimeout(() => setItems(s => s.filter(t => t.id !== id)), 3600);
  }, []);

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
        {items.map(t => (
          <div key={t.id} className="fade-up row gap-12" style={{
            pointerEvents: 'auto', background: 'var(--bg-elevated)', border: '1px solid var(--line-bright)',
            borderRadius: 10, padding: '11px 15px', boxShadow: '0 12px 40px rgba(0,0,0,.5)',
            minWidth: 280, maxWidth: 460,
          }}>
            <span style={{ color: t.kind === 'success' ? 'var(--green)' : 'var(--cyan)', display: 'flex', flexShrink: 0 }}>
              {t.kind === 'success' ? <CheckCircle2 size={17} /> : <Info size={17} />}
            </span>
            <span className="hi" style={{ fontSize: 13, lineHeight: 1.4, flex: 1 }}>{t.msg}</span>
            <button className="muted" style={{ display: 'flex', flexShrink: 0 }} onClick={() => setItems(s => s.filter(x => x.id !== t.id))}><X size={14} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
};
