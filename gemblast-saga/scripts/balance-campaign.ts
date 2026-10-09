/** Offline heuristic probe. Not a human win-rate estimate, and never changes player boards. */
import {writeFile} from 'node:fs/promises';
import {STAGES} from '../src/types/game';
import {createSession,commitMove,shuffleSession,stageFor,applyRewardContinue,type Session} from '../src/utils/session';
import {areNeighbors,isValidPath,previewClear,createRNG,type Coord} from '../src/utils/boardEngine';

type Action={path:Coord[];loop:boolean}|{shuffle:true};
function candidates(session:Session,rng:()=>number) {
  const stage=stageFor(session), grid=session.grid;
  const ranked:{path:Coord[];loop:boolean;value:number}[]=[];
  const seen=new Set<string>();let visited=0;
  const add=(path:Coord[],loop:boolean)=>{
    if(!isValidPath(grid,path,loop))return;
    const keys=path.map(([r,c])=>r*6+c), end=keys.at(loop?-2:-1);
    const signature=keys.slice(0,loop?-1:undefined).sort((a,b)=>a-b).join(',')+':'+end+':'+loop;
    if(seen.has(signature))return;seen.add(signature);
    const preview=previewClear(grid,path,loop), counts:Record<string,number>={};
    let multiplier=1;const seals=new Set<string>();
    for(const [r,c] of preview.clearedCoords){counts[grid[r][c].color]=(counts[grid[r][c].color]??0)+1;multiplier=Math.min(27,multiplier*grid[r][c].multiplier);
      for(const [dr,dc] of [[0,1],[0,-1],[1,0],[-1,0]])if(grid[r+dr]?.[c+dc]?.locked)seals.add(`${r+dr},${c+dc}`);
    }
    const quota=stage.quotas.reduce((n,q)=>n+Math.min(Math.max(0,q.target-session.collected[q.color]),counts[q.color]??0),0);
    const earned=preview.clearedCoords.length*30*multiplier*(loop?2:1);
    const scoreProgress=Math.min(Math.max(0,stage.targetScore-session.score),earned)/60;
    const loopNeed=loop&&session.loopsMade<(stage.loopsTarget??Number(!!stage.requireLoop))?14:0;
    const powerNeed=session.specialsTriggered<(stage.specialsTarget??0)?preview.triggeredSpecialsCount*14:0;
    const powerSetup=path.length>=6?9:path.length>=4?4:0;
    ranked.push({path:path.map(([r,c])=>[r,c]),loop,value:quota*3+scoreProgress+seals.size*6+loopNeed+powerNeed+powerSetup+preview.clearedCoords.length*.3+rng()*12});
  };
  function visit(path:Coord[]) {
    if(++visited>4500)return;
    if(path.length>=3)add(path,false);
    const [r,c]=path.at(-1)!;
    if(path.length>=4&&areNeighbors(r,c,...path[0]))add([...path,path[0]],true);
    if(path.length>=6)return;
    const neighbors:Coord[]=[];
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc){const nr=r+dr,nc=c+dc;
      if(grid[nr]?.[nc]&&!grid[nr][nc].locked&&grid[nr][nc].color===grid[r][c].color&&!path.some(([pr,pc])=>pr===nr&&pc===nc))neighbors.push([nr,nc]);
    }
    neighbors.sort(()=>rng()-.5);
    for(const next of neighbors)visit([...path,next]);
  }
  // Scan explicit four-cell squares before bounded DFS, so the cap never hides a ready ring.
  for(let r=0;r<5;r++)for(let c=0;c<5;c++)add([[r,c],[r,c+1],[r+1,c+1],[r+1,c],[r,c]],true);
  const starts=grid.flatMap((row,r)=>row.flatMap((cell,c)=>cell.locked?[]:[[r,c] as Coord]));
  starts.sort(()=>rng()-.5);
  for(const start of starts)visit([start]);
  return ranked.sort((a,b)=>b.value-a.value);
}
function run(stageId:number,seed:number,strategySeed:number) {
  let session=createSession('classic',stageId,new Date('2026-10-08T12:00:00Z'),{seed,teachingLayout:false});
  const rng=createRNG(strategySeed),actions:Action[]=[];
  while(session.outcome==='playing') {
    const options=candidates(session,rng);
    if(!options.length)break;
    const best=options[0];
    // Spend a limited shuffle when only low-value options remain; never spend a move for it.
    if(best.value<18&&session.shufflesLeft){session=shuffleSession(session);actions.push({shuffle:true});continue;}
    const move=commitMove(session,best.path,best.loop)!;actions.push({path:best.path,loop:best.loop});session=move.next;
  }
  const baseWon=session.outcome==='won';
  let continuedWon=baseWon;
  if(!baseWon&&session.outcome==='lost') {
    session=applyRewardContinue(session);
    while(session.outcome==='playing'){
      const best=candidates(session,rng)[0];if(!best)break;
      session=commitMove(session,best.path,best.loop)!.next;
    }
    continuedWon=session.outcome==='won';
  }
  return {baseWon,continuedWon,actions,movesUsed:actions.filter(a=>'path' in a).length};
}
const count=Number(process.argv[2]??8);
// Optional stage range ("31-60") probes part of the campaign without rewriting the fixtures.
const [from,to]=(process.argv[3]??'').split('-').map(Number);
const partial=Number.isFinite(from)&&Number.isFinite(to);
const results=[];const witnesses=[];
for(const stage of STAGES.slice(5).filter(s=>!partial||(s.id>=from&&s.id<=to))) {
  let wins=0,continued=0,witness;
  for(let i=0;i<count;i++){
    const seed=(stage.id*1009+i*9176)>>>0;
    const result=run(stage.id,seed,seed+11);
    wins+=Number(result.baseWon);continued+=Number(result.continuedWon);
    if(result.baseWon&&!witness)witness={stageId:stage.id,seed,actions:result.actions};
  }
  // Find at least one genuine unassisted route; do not quietly award extra moves.
  if(!witness)for(let i=count;i<count+40;i++){
    const seed=(stage.id*1009+i*9176)>>>0;const result=run(stage.id,seed,seed+11);
    if(result.baseWon){witness={stageId:stage.id,seed,actions:result.actions};break;}
  }
  if(witness)witnesses.push(witness);
  const row={stageId:stage.id,moves:stage.moves,score:stage.targetScore,trials:count,wins,withContinue:continued,unassistedWitness:!!witness};
  results.push(row);console.log(JSON.stringify(row));
}
if(!partial){
await writeFile('release/balance-probe.json',JSON.stringify({method:'Bounded greedy heuristic; not human win rates. Fixed seeds; no gameplay adaptation.',results},null,2)+'\n');
await writeFile('tests/fixtures/campaign-witnesses.json',JSON.stringify(witnesses,null,2)+'\n');
if(witnesses.length!==STAGES.length-5)process.exitCode=1;
}
