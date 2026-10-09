# App Review notes — Gemblast Saga 1.5.1

Use after production configuration and real-device validation are complete. Do not describe unchecked device results as passed.

Gemblast Saga is a bundled connection puzzle with 30 sequential levels, a date-seeded daily puzzle, and unlimited free play. Core gameplay and local progress work offline, without an app-created account. Capacitor Preferences, native sharing and haptics are used. Assets are bundled; the app does not load the hosted website for gameplay.

Connect at least three neighboring same-color gems (diagonal neighbors are allowed). Refill gravity is downward. Closing a noncrossing loop with at least four unique cells clears all unlocked gems of that color. Longer chains create row/column channels and Nova powers. Meet all displayed score, color, seal and special goals. Drag and tap-to-connect are available. Settings include sound, haptics and reduced motion.

The app contains optional AdMob rewarded ads. Placement: lose a Classic/Adventure level by exhausting moves; choose the clearly labeled "Reklam izle · +5 hamle" button. Completing the rewarded ad grants five additional moves once for that attempt, on the same board. Dismissal without earning grants nothing. A rewarded win earns at most one star. Free retry is always available. Daily competition and free play do not grant rewarded advantages. There are no banners, automatic interstitials, subscriptions or purchases.

Google UMP consent is checked before ad requests. Requests specify non-personalized ads; the app does not make its own ATT authorization request. Applicable privacy options are available in Settings. Denying consent does not gate gameplay. The Google SDK's privacy manifest/data collection must be reflected in the submitted privacy answers.

Game Center is optional: open the "Lig" tab, complete today's daily puzzle, and submit the daily and weekly result. The standard Apple authentication/leaderboard UI is used. No developer-created login credentials are required. Two recurring leaderboards are configured for Istanbul daily midnight and Monday weekly midnight. The separately hosted web leaderboard is not used by the native app. Local adventure saves do not sync between devices.

The bundled privacy policy and support pages are linked in Settings. App-local Preferences access is declared under CA92.1; third-party SDK declarations are also included by their packages. Public Support and Privacy URLs must be supplied in App Store Connect. Review contact and tested physical device/iOS versions must be entered by the publisher before submission.
