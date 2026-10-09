import { Infinity, Map, Radio, Trophy, LockKeyhole } from 'lucide-react';
export function Emblem({ kind }: {kind:'adventure'|'echo'|'zen'|'league'|'seal'}) {
  const Icon={adventure:Map,echo:Radio,zen:Infinity,league:Trophy,seal:LockKeyhole}[kind];
  return <span className={`game-emblem emblem-${kind}`} aria-hidden="true"><span className="emblem-rim"/><Icon size={24}/><i/></span>;
}
