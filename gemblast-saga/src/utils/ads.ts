import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus, MaxAdContentRating, RewardAdPluginEvents } from '@capacitor-community/admob';
import config from '../../release/config.json';
import { watchRewarded } from './rewardedFlow';

export const rewardedAdsAvailable = () => Capacitor.getPlatform() === 'ios' && config.admob.enabled;
let consentFlight: Promise<boolean> | undefined;
let initialized = false, busy = false, privacyRequired = false;
async function consentInfo() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {return await Promise.race([AdMob.requestConsentInfo(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Reklam bağlantısı zaman aşımına uğradı. Yeniden deneyebilirsin.')),40000);})]);}
  finally {clearTimeout(timer);}
}
export async function prepareAdConsent(): Promise<boolean> {
  if (!rewardedAdsAvailable()) return false;
  if (consentFlight) return consentFlight;
  consentFlight = (async () => {
    let info = await consentInfo();
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) info = await AdMob.showConsentForm();
    privacyRequired = info.privacyOptionsRequirementStatus === 'REQUIRED';
    return info.canRequestAds;
  })();
  try { return await consentFlight; } finally { consentFlight = undefined; }
}
export async function adPrivacyRequired() {
  if (!rewardedAdsAvailable()) return false;
  return privacyRequired;
}
export async function showAdPrivacy() { await AdMob.showPrivacyOptionsForm(); const info=await consentInfo(); privacyRequired=info.privacyOptionsRequirementStatus === 'REQUIRED'; }
export async function watchContinueAd(grant: () => void, muted: boolean) {
  if (!rewardedAdsAvailable() || busy) throw new Error('Ödüllü reklam şu anda kullanılamıyor.');
  busy = true;
  try {
    if (!await prepareAdConsent()) throw new Error('Reklam şu anda kullanılamıyor. Oyuna reklamsız devam edebilirsin.');
    if (!initialized) {
      await AdMob.initialize({ initializeForTesting: config.admob.testMode, maxAdContentRating: MaxAdContentRating.General });
      initialized = true;
    }
    await AdMob.setApplicationMuted({muted});
    return await watchRewarded({
      load: () => AdMob.prepareRewardVideoAd({adId:config.admob.iosRewardedId,isTesting:config.admob.testMode,npa:true}),
      show: () => AdMob.showRewardVideoAd(),
      listen: (event, callback) => AdMob.addListener(
        (event === 'earned' ? RewardAdPluginEvents.Rewarded : event === 'dismissed' ? RewardAdPluginEvents.Dismissed : RewardAdPluginEvents.FailedToShow) as RewardAdPluginEvents.Dismissed, callback),
    }, grant);
  } finally { busy = false; }
}
