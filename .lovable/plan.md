# X-style Redesign Plan

Scope is large, so I'll break it into 4 batches you can approve. Nothing touches API endpoints, request shapes, or business logic — only markup, styles, and UI behavior.

## Batch 1 — Foundation (do first)

1. **Create `shared-nav.js` + `shared-nav.css**` (the earlier summary claimed these exist; they don't). Single source of truth for:
  - Left sidebar on desktop (≥1024px): logo, Feed, Explore, Vybze, Notifications, Messages, Wallet, Profile, Settings, "Post" CTA.
  - Bottom nav on mobile (<1024px): Feed, Explore, Vybze, Notifications, Profile.
  - Auto-injects into any page with `<div data-shared-nav></div>`. Highlights active route. Dispatches `open-create-post` event.
2. **Fix feed infinite scroll**: current code listens on `feedMain.scroll`, but with the new 3-column layout the window scrolls instead. Switch to an `IntersectionObserver` sentinel at the end of `#feedBox` so it auto-loads regardless of which element scrolls.
3. **Shared skeleton CSS** (`.skeleton`, `.skeleton-text`, shimmer keyframe) reusable across pages.  
Profile page (matches your screenshot)
  - 3-column desktop: [shared sidebar] [profile main] [right rail with "Business tools" panel + Who to follow].
  - Header: banner, avatar overlapping, **Edit profile** button top-right.
  - Identity block: display name, @handle, bio, meta row (briefcase = role, calendar = joined date), Following / Followers counts.
  - Tabs: Posts · Replies · Media · Likes (keep existing data sources; just restyle).
  - **Edit profile dialog**: modal with avatar, banner, name, bio, location, website fields — submits to the existing profile update endpoint unchanged.
  - **Settings icon** in header opens the right-rail Business Tools as an off-canvas drawer on mobile.
  - Skeleton state for header + tab content.

## Batch 2 — Feed card redesign

- Replace post card markup/CSS with X-style: avatar left, header row (name · @handle · • · time · ⋯), body, media, then engagement row using **Lucide-style inline SVGs**: reply (speech bubble), repost (recycle), like (heart, fills red on active), views (bar chart), bookmark, share.
- Hover states, count formatting (1.2K), tap targets ≥40px.
- Skeleton cards while loading + when fetching next page.



## Batch 4 — Vybze, Vybze-player, Search

- **Vybze**: X-style grid/feed of vybze cards with shimmer skeletons, shared nav.
- **Vybze-player**: full-screen vertical player kept, but overlay controls restyled (heart, comment, share, mute) using same SVG icon set; shared nav hidden in fullscreen, visible on tablet+.
- **Search**: sticky search bar, recent/trending sections, result cards using the new post card; skeletons while typing.

## Out of scope (explicitly NOT changing)

- Any fetch URL, payload shape, auth, or backend.
- Feed/profile/vybze JS data flow beyond pagination trigger.
- Hashtag page (already redone), settings, wallet, messages internals.

## Technical notes

- Pure HTML/CSS/JS, no framework, no Tailwind — per your rule.
- All icons inline SVG (no icon font dependency) styled via `currentColor`.
- Skeletons: `@keyframes shimmer` on a `linear-gradient` background.
- Infinite scroll: `IntersectionObserver` on a `#feedSentinel` div appended after `#feedBox`; rootMargin `600px 0px` so it pre-fetches before the user hits bottom.

---

**Reply "go" and I'll start with Batch 1 + 2 (foundation + feed card redesign + scroll fix) in one pass, then ship 3 and 4 in follow-ups.** Or tell me to reorder (e.g. "profile first").