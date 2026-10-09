# Gemblast Saga — web 1.8.0 progression map

9 October 2026. User asks for a Candy Crush-like spatial campaign and questions
the separate Explore page. Explore and Adventure merged; Adventure is initial
page and all home/brand/game-return destinations. Four navigation tabs.

## Implemented
- Three vector terrains, winding connected trails, 30 ordered native button stops.
- Actual contiguous stage wins light lanterns, restore water, connect stars and
  open realm gates. Stars and locks shown with symbols and numbers as well as color.
- Real campaign goals in the stage modal, including quotas, seals, loops and powers.
  A saved legacy attempt uses stageFor so its displayed goals match its board.
- Story landmarks use the existing unlock guard; no locked story text revealed.
- Final tower closed until both 30 contiguous wins and seven distinct echoes.
- Resume follows saved stage/realm; daily and unlimited play available on main map.
- Realm jumps and current position jump focus the destination; reduced motion uses
  instant scroll. DOM level order stays 1..30. Touch targets 60px+; jump buttons 44px.
- No image background, ambient particle system, new dependency or persistent timer.
- Existing board rules, saves, styles and native package preserved.

## Verification
- TypeScript check passed.
- Four map SSR tests passed: ordered nodes/locked story safety; realm unlocking
  and sparse profile; final tower guard; earlier saved-stage resume context.
- Existing 79 engine/session/league/reward/motion tests passed. New map test lives
  in tests/journey-map.test.ts and participates in npm test (83 total).
- Source diff has no native/release-config changes. Existing iOS ZIP still 1.6.1.
- Build and source packaging run through the Sites workflow before publication.

## Limits
Control-browser is unavailable. No preview server or alternative browser path was
started. No browser screenshots, mobile scrolling/touch/keyboard/VoiceOver or
200% zoom QA claimed. Static geometry reserves margins at 320px, but actual
rendering and feel still need device verification. No player retention data.
