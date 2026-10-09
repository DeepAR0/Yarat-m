export function chainEnergy(count: number, loop: boolean) {
  const tier = loop || count >= 9 ? 4 : count >= 6 ? 3 : count >= 4 ? 2 : count >= 3 ? 1 : 0;
  const label = loop ? 'Renk dalgası hazır' : count >= 9 ? 'Tam güç · 3× Nova' : count >= 6 ? '3× Nova hazır' : count === 5 ? '2× kanal hazır' : count === 4 ? 'Işık kanalı hazır' : count >= 3 ? 'Zincir hazır' : 'Enerjiyi bağla';
  return { tier, label, width: 6 + tier * 2.5, speed: 1.2 - tier * .16 };
}
