export type StorySchedule = (fn:()=>void, delay:number)=>()=>void;
const browserSchedule:StorySchedule=(fn,delay)=>{const timer=setTimeout(fn,delay);return ()=>clearTimeout(timer);};
/** Finite, interruptible reveal. Completion does not gate gameplay or reading. */
export function startStoryMotion(onPhase:(phase:number)=>void, reducedMotion=false, schedule:StorySchedule=browserSchedule) {
  let alive=true;
  const cancel:(()=>void)[]=[];
  onPhase(reducedMotion?3:0);
  if(!reducedMotion) for(const [phase,delay] of [[1,350],[2,1850],[3,3650]])cancel.push(schedule(()=>{if(alive)onPhase(phase);},delay));
  return ()=>{alive=false;cancel.forEach(fn=>fn());};
}
