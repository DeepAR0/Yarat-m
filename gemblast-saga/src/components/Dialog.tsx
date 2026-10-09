import { ReactNode, useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

export function Dialog({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const titleId=useId();
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
      else document.querySelector<HTMLButtonElement>('[data-home]')?.focus();
    };
  }, []);
  return <dialog ref={ref} className={`dialog ${className}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); close.current(); }}>
    <div className="dialog-head"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="Kapat" onClick={onClose}><X size={20} /></button></div>
    {children}
  </dialog>;
}
