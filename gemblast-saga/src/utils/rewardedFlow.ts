export interface RewardPort {
  load(): Promise<unknown>;
  show(): Promise<{ amount: number }>;
  listen(event: 'earned' | 'dismissed' | 'failed', callback: () => void): Promise<{ remove(): Promise<void> }>;
}
/** One SDK reward callback is the only source of a reward. Closing an ad is not a reward. */
export async function watchRewarded(port: RewardPort, grant: () => void, loadTimeout = 45000, showTimeout = 600000): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const handles: Awaited<ReturnType<RewardPort['listen']>>[] = [];
  let active = true, earned = false;
  try {
    await Promise.race([port.load(), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Reklam yüklenemedi. Bağlantını kontrol edip yeniden dene.')), loadTimeout);
    })]);
    clearTimeout(timer);
    let finish!: () => void, fail!: () => void;
    const closed = new Promise<void>((resolve, reject) => {
      finish = resolve;
      fail = () => reject(new Error('Reklam açılamadı. Yeniden deneyebilirsin.'));
    });
    // Attach a rejection handler before asynchronous listener registration.
    void closed.catch(() => {});
    const reward = () => { if (active && !earned) { earned = true; grant(); } };
    handles.push(await port.listen('earned', reward));
    handles.push(await port.listen('dismissed', finish));
    handles.push(await port.listen('failed', fail));
    timer = setTimeout(fail, showTimeout);
    // iOS's promise resolves on earning, and can remain pending on early dismissal.
    // Both result and event are deduplicated; neither grants on dismissal.
    void port.show().then(item => { if (item.amount > 0) reward(); }).catch(fail);
    await closed;
    return earned;
  } finally {
    active = false;
    clearTimeout(timer);
    await Promise.allSettled(handles.map(handle => handle.remove()));
  }
}
