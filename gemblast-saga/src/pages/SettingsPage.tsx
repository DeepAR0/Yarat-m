import { ChevronRight, Diamond, Lightbulb, RotateCcw, ShieldCheck } from 'lucide-react';
import type { Settings } from '../utils/session';

export function SettingsPage({ settings: current, privacyOptions, onToggle, onAdPrivacy, onGuide, onPrivacy, onErase }: {
  settings: Settings; privacyOptions: boolean; onToggle: (key: keyof Settings) => void;
  onAdPrivacy: () => void; onGuide: () => void; onPrivacy: () => void; onErase: () => void;
}) {
  return <>
    <div className="page-intro"><div className="eyebrow">OYUNU KENDİ RİTMİNE AYARLA</div><h1>Ayarlar</h1><p>Daha sakin, daha sessiz ya da daha dokunsal.</p></div>
    <section className="settings-list">{([{ key: 'sound', title: 'Oyun sesleri', text: 'Zincir boyunca yükselen notalar ve rezonans sesleri.' }, { key: 'haptics', title: 'Dokunsal geri bildirim', text: 'Desteklenen iPhone modellerinde hafif titreşim.' }, { key: 'reducedMotion', title: 'Hareketi azalt', text: 'Çekirdek hareketlerini ve ışık dalgalarını sadeleştir.' }] as const).map(setting => <div className="setting-row" key={setting.key}><div><strong id={`setting-${setting.key}`}>{setting.title}</strong><p>{setting.text}</p></div><button role="switch" aria-checked={current[setting.key]} aria-labelledby={`setting-${setting.key}`} className="switch" onClick={() => onToggle(setting.key)}><span/></button></div>)}</section>
    <section className="settings-links"><a href="./support.html" className="secondary-button"><Lightbulb size={20}/>Yardım ve destek<ChevronRight size={18}/></a>{privacyOptions && <button onClick={onAdPrivacy}><ShieldCheck size={20}/>Reklam gizlilik tercihleri<ChevronRight size={18}/></button>}<button onClick={onGuide}><Lightbulb size={20}/>Nasıl oynanır<ChevronRight size={18}/></button><button onClick={onPrivacy}><ShieldCheck size={20}/>Gizlilik ve verilerin<ChevronRight size={18}/></button><button className="danger-link" onClick={onErase}><RotateCcw size={20}/>Tüm ilerlemeyi sıfırla<ChevronRight size={18}/></button></section>
    <div className="about-app"><Diamond size={24}/><strong>Gemblast Saga</strong><span>Sürüm 2.0.0 · Enerjiyi çiz, dünyayı uyandır.</span></div>
  </>;
}
