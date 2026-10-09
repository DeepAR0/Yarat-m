import { Check, Orbit, X, Link } from 'lucide-react';
import { Coord } from '../utils/boardEngine';
import { Lesson } from '../utils/lesson';

export function LessonCoach({ lesson, path, count, loop, tapMode, onSkip }: { lesson: Lesson; path: Coord[]; count: number; loop: boolean; tapMode: boolean; onSkip: () => void }) {
  const ready = lesson === 'loop' ? loop : count >= 3;
  const instruction = ready ? tapMode ? 'Hazır! Patlat’a dokun.' : 'Hazır! Parmağını bırak.'
    : lesson === 'loop' ? path.length ? '1 → 2 → 3 → 4 → 1: başlangıca dön.' : 'Aynı renkten dört taşı bağla, başlangıca dön.'
    : tapMode ? 'Numaralı taşlara sırayla dokun: 1 → 2 → 3.' : 'Parmağını 1’den 2’ye ve 3’e sürükle.';
  return <section className={`lesson-coach ${ready ? 'lesson-ready' : ''}`} aria-label="Oynayarak öğren">
    <span className="lesson-icon" aria-hidden="true">{ready ? <Check size={18}/> : lesson === 'loop' ? <Orbit size={18}/> : <Link size={18}/>}</span>
    <div><strong>{lesson === 'loop' ? 'Halkayı kapat' : 'İlk bağlantın'}</strong><p role="status">{instruction}</p><small>{lesson === 'loop' ? 'Halka, uzaktaki aynı renk taşları da temizler.' : 'Başka bir aynı renk zinciri de deneyebilirsin.'}</small></div>
    <button onClick={onSkip} className="lesson-skip" aria-label="Alıştırmayı atla"><X size={15}/><span>Atla</span></button>
  </section>;
}

export function LessonRoute({ path }: { path: Coord[] }) {
  if (path.length < 2) return null;
  const d = path.map(([r,c],i) => `${i ? 'L' : 'M'}${c*100+50} ${r*100+50}`).join(' ');
  return <svg className="path-overlay lesson-route" viewBox="0 0 600 600" aria-hidden="true"><path d={d} fill="none" stroke="#426d5f" strokeOpacity=".35" strokeWidth="4" strokeDasharray="7 9" strokeLinejoin="miter"/></svg>;
}
