# Concord Locksmith — Lisa Review #2 Content Edits — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply COO Lisa Lage's round-2 copy review (`Concord Website Review-2.docx`) to the static `concordlock` site — two site-wide removals plus ~30 per-page copy edits, mostly expanding geographic wording from "Contra Costa County" to "surrounding areas/counties".

**Architecture:** Static hand-authored HTML site (no build step, no templating). Each page is a standalone `.html` file under `concordlock/`. Edits are exact find-and-replace against verified current source lines. Two global removals (`footer-emg` line on 22 pages, `emergency-band` block on 10 pages) are done with one scripted pass each; the rest are per-page edits. "Tests" here are `grep` assertions (old string gone, new string present) plus a local-server visual spot-check — there is no unit-test harness and none should be invented.

**Tech Stack:** Static HTML/CSS, `server.js` (local preview), Fly.io deploy (`fly.toml`, Dockerfile). Working dir: `C:\Users\kizsl\OneDrive\Desktop\Concord Locksmith\concordlock` (git repo).

---

## ⚠️ Open Questions — RESOLVE BEFORE EXECUTING (do not guess)

These are genuine conflicts where the doc assumes wording the site no longer has, or asks for content that already exists in a different form. Per the review, Lisa is the decision-maker.

1. **Banner removal on `faq.html` and `reviews.html`.** Lisa's red-banner removal lists Services/Contact/Residential/Commercial/Automotive/Safe/Keyless/Self-Defense, then says "*so far — not done with all pages yet*". The banner (`class="emergency-band"`) also lives on `faq.html` and `reviews.html`. **Assumption (low risk):** remove from all 10 pages. Flag if Lisa wants those two kept.

2. **`areas.html` "nearby cities" line — STALE.** Lisa asks to change *"Here are the nearby cities we serve most — and if you're elsewhere in Contra Costa County..."* → *"...Contra Costa or surrounding counties..."*. But the current line was **already reworded** in a prior pass to: *"Here are the **Contra Costa cities** we serve most — and **wherever you are**, give us a call and we'll let you know."* Decision: (a) overwrite with Lisa's exact target wording [**recommended** — matches her geographic-expansion theme], or (b) keep current "wherever you are". Plan implements (a); see Task 3 / E2.

3. **`residential.html` "add these back" — ALREADY PRESENT in longer form.** Lisa thinks two sentences were removed and asks to add them back:
   - *"Most residential jobs in Concord and nearby cities can be scheduled the same day."*
   - *"Just moved into a new home? Rekeying the locks ensures the old key... no longer works and your new home is secure."*

   Both concepts **already exist** as longer paragraphs at `residential.html:182-183` ("Most residential jobs in Concord — rekeys, lock swaps, lockouts — are finished in a single visit..." and "Just moved into a new home in Concord or anywhere in Contra Costa County? Rekeying is usually the smartest first call..."). Her separate "so previous keys" edit (E3) is *inside* that same line 183. **Needs Lisa's call:** replace the long paragraphs with her shorter sentences, keep both, or leave as-is? Plan leaves Task 4b (E7) as a STUB pending her answer; E3/E4/E5/E6 proceed regardless.

4. **Phone-link behavior (General section).** "Pick an App" popup on desktop and "*This website has been blocked from automatically starting a call*" on mobile. This is browser/OS behavior around `tel:` links, **not necessarily a site bug**. Desktop "Pick an App" appears when the OS has no registered phone handler (expected on a PC). The mobile block is Chrome's guard against `tel:` navigation not tied to a clear user gesture. Plan includes an **investigation task** (Task 14), not a guaranteed fix — see that task for the audit steps and the likely-unfixable desktop case.

5. **Tagline (optional).** "A Growing Legacy Since 1947" — Lisa: "*I like this tagline if you want to use it anywhere*". Optional, no location specified. Plan defers as Task 15 (placement TBD with Lisa).

---

## File Map

| File | Footer removal | Banner removal | Copy edits |
|---|---|---|---|
| `index.html` | ✅ | — | — |
| `story.html` | ✅ | — | — |
| `why.html` | ✅ | — | — |
| `services.html` | ✅ | ✅ | — |
| `contact.html` | ✅ | ✅ (diff. heading) | — |
| `faq.html` | ✅ | ✅ (Q1) | — |
| `reviews.html` | ✅ | ✅ (Q1) | — |
| `areas.html` | ✅ | — | E1, E2 |
| `areas/clayton.html` · `martinez` · `pleasant-hill` · `walnut-creek` | ✅ | — | — |
| `services/residential.html` | ✅ | ✅ | E3, E4, E5, E6, (E7 pending) |
| `services/commercial.html` | ✅ | ✅ | E8, E9, E10, E11 |
| `services/property-management.html` | ✅ | — | E12, E13, E14, E15, E16 |
| `services/automotive.html` | ✅ | ✅ | E17, E18, E19, E20, E21 |
| `services/safes.html` | ✅ | ✅ | E22, E23 |
| `services/keyless.html` | ✅ | ✅ | E24, E25, E26, E27 |
| `services/door-repair.html` | ✅ | — | E28, E29 |
| `services/access-control.html` | ✅ | — | E30, E31 |
| `services/gate-repair.html` | ✅ | — | E32 |
| `services/self-defense.html` | ✅ | ✅ | — |

22 files get the footer removal; 10 get the banner removal; 11 get copy edits.

---

## Task 1: Pre-flight — clean branch + baseline

**Files:** none (git only)

- [ ] **Step 1: Confirm clean tree and branch**

```bash
cd "/c/Users/kizsl/OneDrive/Desktop/Concord Locksmith/concordlock"
git status --porcelain   # expect empty
git switch -c review-2-content-edits
```

- [ ] **Step 2: Baseline anchor counts (record these numbers)**

```bash
grep -rc 'class="footer-emg"' . --include=*.html | grep -v ':0' | wc -l   # expect 22
grep -rl 'class="emergency-band"' . --include=*.html | wc -l               # expect 10
```
Expected: 22 and 10.

---

## Task 2: Global removal — footer "Locked out after hours" line (22 pages)

**Files:** Modify all 22 `*.html` containing `class="footer-emg"`.

The line is identical and self-contained on every page:
`        <p class="footer-emg"><em>Locked out after hours? Call us &mdash; emergency service available</em></p>`

- [ ] **Step 1: Run the removal script**

```bash
cd "/c/Users/kizsl/OneDrive/Desktop/Concord Locksmith/concordlock"
python - <<'PY'
import glob, re, os
files = glob.glob('**/*.html', recursive=True)
pat = re.compile(r'[ \t]*<p class="footer-emg">.*?</p>\s*\n', re.DOTALL)
changed = 0
for f in files:
    s = open(f, encoding='utf-8').read()
    n = pat.sub('', s)
    if n != s:
        open(f, 'w', encoding='utf-8').write(n)
        changed += 1
print("footer-emg removed from", changed, "files")
PY
```
Expected: `footer-emg removed from 22 files`

- [ ] **Step 2: Verify zero remain**

```bash
grep -rc 'footer-emg' . --include=*.html | grep -v ':0' || echo "CLEAN: 0 remaining"
```
Expected: `CLEAN: 0 remaining`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Remove 'Locked out after hours' footer line site-wide (Lisa review #2)"
```

---

## Task 3: Global removal — red "Need Emergency Service" banner block (10 pages)

**Files:** Modify the 10 `*.html` containing `class="emergency-band"`. (Includes `contact.html`, whose heading differs but whose wrapper `<div class="emergency-band">` is identical — the script keys on the wrapper, so it is caught.) Per **Q1**, this includes `faq.html` and `reviews.html`.

Block shape (residential example, lines 204-217):
```html
  <!-- ═══ EMERGENCY BAND ═══ -->
  <div class="emergency-band">
    <div class="emg-inner"> ... </div>
  </div>
```

- [ ] **Step 1: Run the block-removal script (nesting-aware)**

```bash
cd "/c/Users/kizsl/OneDrive/Desktop/Concord Locksmith/concordlock"
python - <<'PY'
import glob, re
files = glob.glob('**/*.html', recursive=True)
changed = 0
for f in files:
    s = open(f, encoding='utf-8').read()
    i = s.find('<div class="emergency-band">')
    if i == -1:
        continue
    # walk forward counting <div ...> / </div> to find matching close
    depth = 0; j = i
    tag = re.compile(r'<(/?)div\b')
    while True:
        m = tag.search(s, j)
        if not m: break
        depth += -1 if m.group(1) else 1
        j = m.end()
        if depth == 0:
            end = s.find('>', j) + 1
            break
    # absorb the preceding "EMERGENCY BAND" comment + leading whitespace if present
    start = i
    cstart = s.rfind('<!--', 0, i)
    if cstart != -1 and 'EMERGENCY BAND' in s[cstart:i]:
        start = cstart
    # trim leading indentation on the start line and one trailing newline
    line_start = s.rfind('\n', 0, start) + 1
    block_end = end
    while block_end < len(s) and s[block_end] in ' \t': block_end += 1
    if block_end < len(s) and s[block_end] == '\n': block_end += 1
    s = s[:line_start] + s[block_end:]
    open(f, 'w', encoding='utf-8').write(s)
    changed += 1
print("emergency-band removed from", changed, "files")
PY
```
Expected: `emergency-band removed from 10 files`

- [ ] **Step 2: Verify zero remain and no broken markup**

```bash
grep -rc 'emergency-band\|Need Emergency Service\|We respond fast' . --include=*.html | grep -v ':0' || echo "CLEAN: 0 remaining"
```
Expected: `CLEAN: 0 remaining`

- [ ] **Step 3: Visual spot-check one page in browser** (verify layout intact between hero and CTA — see Task 13 for server start). On `residential.html`, confirm the page flows hero → service sections → CTA with no red band and no visual gap/broken div.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Remove 'Need Emergency Service' red banner from 10 pages (Lisa review #2)"
```

---

## Task 4a: `areas.html` copy edits (E1, E2)

**Files:** Modify `areas.html`

- [ ] **E1 — add auto-key programming & lock repairs to in-shop list** (`areas.html:89`)

Find: `in-shop work like key cutting, safe service, and self-defense sales happens at the counter.`
Replace: `in-shop work like key cutting, auto key programming and lock repairs, safe service, and self-defense sales happens at the counter.`

- [ ] **E2 — nearby-cities line** (`areas.html:90`) — see **Q2**; this overwrites the prior-pass wording with Lisa's exact target.

Find: `Here are the Contra Costa cities we serve most &mdash; and wherever you are, give us a call and we'll let you know.`
Replace: `Here are the nearby cities we serve most &mdash; and if you're elsewhere in Contra Costa or surrounding counties, give us a call and we'll let you know.`

- [ ] **Verify**

```bash
grep -c "auto key programming and lock repairs" areas.html        # expect 1
grep -c "Contra Costa or surrounding counties" areas.html         # expect 1
grep -c "wherever you are, give us a call" areas.html             # expect 0
```

- [ ] **Commit**

```bash
git add areas.html && git commit -m "areas: in-shop list + nearby-cities wording (E1,E2)"
```

---

## Task 4b: `residential.html` copy edits (E3–E6; E7 pending Q3)

**Files:** Modify `services/residential.html`

- [ ] **E3 — "so previous keys" rewrite** (within line 183)

Find: `so previous keys &mdash; old owners, contractors, agents &mdash; no longer work`
Replace: `so previous keys that old owners, contractors, or agents may still have, no longer work`

- [ ] **E4 — keypad locks in lock-type list** (`residential.html:184`)

Find: `deadbolts, knobs, levers, and smart locks`
Replace: `deadbolts, knobs, levers, keypad locks and smart locks`

- [ ] **E5 — locked-out CTA tail** (`residential.html:189`)

Find: `Don't wait outside: (925) 689-1534.`
Replace: `Call (925) 689-1534 for quick response.`

- [ ] **E6 — rekey-or-replace wording** (`residential.html:193`)

Find: `We'll tell you honestly which one your doors actually need`
Replace: `We'll tell you honestly if your locks need rekeying or replacement`

- [ ] **E7 — add-back of "same day" / "just moved" sentences** — **STUB, BLOCKED ON Q3.** Do not implement until Lisa confirms whether to replace the existing longer paragraphs (`residential.html:182-183`) with her shorter versions, keep both, or leave as-is. Leave this checkbox unchecked.

- [ ] **Verify (E3–E6)**

```bash
cd services
grep -c "may still have, no longer work" residential.html                 # expect 1
grep -c "keypad locks and smart locks" residential.html                   # expect 1
grep -c "Call (925) 689-1534 for quick response" residential.html         # expect 1
grep -c "if your locks need rekeying or replacement" residential.html     # expect 1
grep -c "Don't wait outside" residential.html                             # expect 0
```

- [ ] **Commit**

```bash
git add services/residential.html
git commit -m "residential: E3-E6 copy edits (E7 pending Lisa decision)"
```

---

## Task 5: `commercial.html` copy edits (E8–E11)

**Files:** Modify `services/commercial.html`

- [ ] **E8** (`:187`) Find: `industrial buildings across Contra Costa County,` → Replace: `industrial buildings across Contra Costa and surrounding Counties,`

- [ ] **E9** (`:188`) Find: `For higher-security needs we install restricted keyways, so keys physically cannot be copied at a hardware store.`
Replace: `For higher-security needs, we install restricted keyways, ensuring keys cannot be copied at hardware stores or even at our location without authorization.`

- [ ] **E10** (`:189`) Find: `Three generations of working with Concord businesses` → Replace: `Three generations of working with Concord and surrounding businesses`

- [ ] **E11** (`:198`) Find: `rental properties throughout Concord and Contra Costa County.` → Replace: `rental properties throughout Concord and surrounding areas.`

- [ ] **Verify**

```bash
grep -c "Contra Costa and surrounding Counties" services/commercial.html              # expect 1
grep -c "even at our location without authorization" services/commercial.html         # expect 1
grep -c "Concord and surrounding businesses" services/commercial.html                 # expect 1
grep -c "rental properties throughout Concord and surrounding areas" services/commercial.html  # expect 1
grep -c "physically cannot be copied" services/commercial.html                        # expect 0
```

- [ ] **Commit**

```bash
git add services/commercial.html && git commit -m "commercial: E8-E11 copy edits"
```

---

## Task 6: `property-management.html` copy edits (E12–E16)

**Files:** Modify `services/property-management.html`

- [ ] **E12** (`:100`, heading) Find: `Your Contra Costa County Locksmith Vendor` → Replace: `Your Contra Costa and surrounding Counties Locksmith Vendor`

- [ ] **E13** (`:117`) Find: `vendor for Contra Costa County owners and managers for over 75 years.` → Replace: `vendor for owners and managers for over 75 years.`

- [ ] **E14** (`:155`) Find: `we respond throughout Concord and Contra Costa County to get your people back in.` → Replace: `we respond throughout Contra Costa and surrounding Counties to get your people back in.`

- [ ] **E15** (`:167`) Find: `managers across Contra Costa County keep us on their vendor list.` → Replace: `managers across Contra Costa and surrounding Counties keep us on their vendor list.`

- [ ] **E16** (`:184`) Find: `Scattered units or several buildings across Concord, Walnut Creek, Pleasant Hill, Martinez and the rest of the county?` → Replace: `Scattered units or several buildings across Contra Costa, Solano and Alameda Counties?`

- [ ] **Verify**

```bash
f=services/property-management.html
grep -c "Your Contra Costa and surrounding Counties Locksmith Vendor" $f   # expect 1
grep -c "vendor for owners and managers for over 75 years" $f             # expect 1
grep -c "respond throughout Contra Costa and surrounding Counties" $f      # expect 1
grep -c "managers across Contra Costa and surrounding Counties" $f         # expect 1
grep -c "Contra Costa, Solano and Alameda Counties" $f                     # expect 1
grep -c "rest of the county" $f                                           # expect 0
```

- [ ] **Commit**

```bash
git add services/property-management.html && git commit -m "property-management: E12-E16 copy edits"
```

---

## Task 7: `automotive.html` copy edits (E17–E21)

**Files:** Modify `services/automotive.html`

- [ ] **E17** (`:136`, H2 — preserve `<em>` markup) Find: `<em>Mobile</em> or In-Shop &mdash; We Come to You` → Replace: `<em>Mobile</em> or In-Shop &mdash; We Are Where You Need Us`

- [ ] **E18** (`:183`) Find: `can replace a "dealer-only" key at all.` → Replace: `can replace a "dealer-only" key.`

- [ ] **E19** (`:183`) Find: `come to you anywhere in Concord and Contra Costa County.` → Replace: `come to you anywhere in Concord and surrounding areas.`

- [ ] **E20** (`:193`) Find: `we verify ownership before cutting any automotive key.` → Replace: `we verify ownership before originating any automotive key.`

- [ ] **E21** (`:210`) Find: `a single dealer key for a work truck can cost a fortune` → Replace: `originating a single dealer key for a work truck can cost a fortune`

- [ ] **Verify**

```bash
f=services/automotive.html
grep -c "We Are Where You Need Us" $f                                 # expect 1
grep -c "dealer-only\" key at all" $f                                  # expect 0
grep -c "Concord and surrounding areas" $f                            # expect 1
grep -c "before originating any automotive key" $f                    # expect 1
grep -c "originating a single dealer key for a work truck" $f         # expect 1
```

- [ ] **Commit**

```bash
git add services/automotive.html && git commit -m "automotive: E17-E21 copy edits"
```

---

## Task 8: `safes.html` copy edits (E22, E23)

**Files:** Modify `services/safes.html`

- [ ] **E22** (`:183`) Find: `what we don't. Combination changes after a move` → Replace: `what we don't. We provide combination changes after a move`
  (Anchor on the preceding `what we don't. ` to guarantee uniqueness.)

- [ ] **E23** (`:197`) Find: `service them for Concord businesses.` → Replace: `service them for Concord and surrounding area businesses.`

- [ ] **Verify**

```bash
grep -c "We provide combination changes after a move" services/safes.html        # expect 1
grep -c "Concord and surrounding area businesses" services/safes.html            # expect 1
```

- [ ] **Commit**

```bash
git add services/safes.html && git commit -m "safes: E22-E23 copy edits"
```

---

## Task 9: `keyless.html` copy edits (E24–E27)

**Files:** Modify `services/keyless.html`

- [ ] **E24** (`:120`, H1) Find: `Keyless Entry &amp; Smart Locks in Concord` → Replace: `Keyless Entry &amp; Smart Locks in Concord and Surrounding Areas`
  (Note: this string also appears in `<title>`/schema — apply only to the `<h1>` at line 120. Use the surrounding `<h1>...</h1>` context to target it.)

- [ ] **E25** (`:137`) Find: `across the full spectrum. Less to lose, more to manage.` → Replace: `across the full spectrum.`

- [ ] **E26** (`:149`) Find: `Easy to update, easy to share.` → Replace: `Stand-alone and easy to update.`

- [ ] **E27** (`:182`) Find: `across Concord and Contra Costa County.` → Replace: `across Concord and surrounding areas.`

- [ ] **Verify**

```bash
f=services/keyless.html
grep -c "<h1>Keyless Entry &amp; Smart Locks in Concord and Surrounding Areas</h1>" $f   # expect 1
grep -c "Less to lose, more to manage" $f                            # expect 0
grep -c "Stand-alone and easy to update" $f                          # expect 1
grep -c "across Concord and surrounding areas" $f                    # expect 1
```

- [ ] **Commit**

```bash
git add services/keyless.html && git commit -m "keyless: E24-E27 copy edits"
```

---

## Task 10: `door-repair.html` copy edits (E28, E29)

**Files:** Modify `services/door-repair.html`

- [ ] **E28** (`:99`, H1 only — NOT `<title>`/schema/breadcrumb which also contain this string) Find: `<h1>Door &amp; Hardware Repair in Concord</h1>` → Replace: `<h1>Door &amp; Hardware Repair in Concord and Surrounding Areas</h1>`

- [ ] **E29** (`:117`) Find: `in a single visit &mdash; residential and commercial, in Concord and throughout Contra Costa County.` → Replace: `in a single visit &mdash; residential and commercial, in Concord and surrounding areas.`

- [ ] **Verify**

```bash
f=services/door-repair.html
grep -c "<h1>Door &amp; Hardware Repair in Concord and Surrounding Areas</h1>" $f   # expect 1
grep -c "in Concord and surrounding areas." $f                                     # expect 1
grep -c "throughout Contra Costa County" $f                                        # expect 0
```

- [ ] **Commit**

```bash
git add services/door-repair.html && git commit -m "door-repair: E28-E29 copy edits"
```

---

## Task 11: `access-control.html` copy edits (E30, E31)

**Files:** Modify `services/access-control.html`

- [ ] **E30** (`:116`) Find: `HOAs across Concord and Contra Costa County.` → Replace: `HOAs across Contra Costa, Solano and Alameda Counties.`

- [ ] **E31** (`:117`) Find: `We get electronic entry working again, whether we installed it or not.` → Replace: `We get electronic entries working again, whether we installed it or not.`

- [ ] **Verify**

```bash
f=services/access-control.html
grep -c "HOAs across Contra Costa, Solano and Alameda Counties" $f    # expect 1
grep -c "We get electronic entries working again" $f                 # expect 1
grep -c "electronic entry working again" $f                          # expect 0
```

- [ ] **Commit**

```bash
git add services/access-control.html && git commit -m "access-control: E30-E31 copy edits"
```

---

## Task 12: `gate-repair.html` copy edit (E32)

**Files:** Modify `services/gate-repair.html`

- [ ] **E32** (`:116`) Find: `locking mechanisms throughout Concord and Contra Costa County.` → Replace: `locking mechanisms throughout Contra Costa, Solano and Alameda Counties.`

- [ ] **Verify**

```bash
grep -c "throughout Contra Costa, Solano and Alameda Counties" services/gate-repair.html   # expect 1
grep -c "throughout Concord and Contra Costa County" services/gate-repair.html             # expect 0
```

- [ ] **Commit**

```bash
git add services/gate-repair.html && git commit -m "gate-repair: E32 copy edit"
```

---

## Task 13: Local visual verification (all changed pages)

**Files:** none

- [ ] **Step 1: Start local server**

```bash
cd "/c/Users/kizsl/OneDrive/Desktop/Concord Locksmith/concordlock"
node server.js   # or: npm start  (confirm port from server.js / package.json)
```

- [ ] **Step 2: Spot-check each changed page** in a browser (or Playwright MCP): home, areas, residential, commercial, property-management, automotive, safes, keyless, door-repair, access-control, gate-repair, contact, faq, reviews. Confirm for each:
  - No "Locked out after hours" line in the footer Hours column.
  - No red "Need Emergency Service" band (10 banner pages).
  - The specific copy edits read correctly; no stray `&mdash;`/`&amp;` rendering as literal text; no broken layout where the band was removed.

- [ ] **Step 3: Stop server.**

---

## Task 14: Phone-link (`tel:`) behavior audit — see Q4 (investigation, not a guaranteed fix)

**Files:** investigate `main.js`, then all `*.html` `href="tel:..."` usages (107 occurrences)

- [ ] **Step 1: Determine how click-to-call is wired**

```bash
grep -n "tel:" main.js *.html services/*.html areas/*.html | head
grep -rn "addEventListener\|location.href\|window.open\|preventDefault" main.js
```
Goal: confirm whether calls are plain `<a href="tel:9256891534">` (correct) or triggered via JS (`location.href='tel:'`, intercepted clicks), which is what triggers Chrome's "blocked from automatically starting a call" guard on mobile.

- [ ] **Step 2: If any `tel:` navigation is JS-driven, convert to plain anchors** so the call is a direct user-gesture navigation. Show the exact before/after once the offending code is located (cannot pre-write — depends on Step 1 findings).

- [ ] **Step 3: Document the desktop case for Lisa.** The desktop "Pick an App" popup is the OS asking which app should handle `tel:` — expected on a PC with no softphone, and **not fixable from the site**. Note this back to Lisa rather than chasing a code change.

- [ ] **Step 4: Commit only if a real JS-driven defect was fixed.**

---

## Task 15: Tagline placement — DEFERRED (Q5)

Optional. "A Growing Legacy Since 1947." Confirm with Lisa where she wants it (hero subhead? footer? about page?) before adding. No work until then.

---

## Task 16: Final review, merge, deploy

- [ ] **Step 1: Full-site sanity grep — confirm both removed strings are gone everywhere**

```bash
cd "/c/Users/kizsl/OneDrive/Desktop/Concord Locksmith/concordlock"
grep -rc 'footer-emg\|emergency-band' . --include=*.html | grep -v ':0' || echo "CLEAN"
```
Expected: `CLEAN`

- [ ] **Step 2: Review the full diff against the doc**

```bash
git log --oneline main..HEAD
git diff main..HEAD --stat
```
Cross-check every E# against `Concord Website Review-2.docx`. Confirm E7 (Q3), Task 14 fix (Q4), Task 15 (Q5) are intentionally deferred/resolved.

- [ ] **Step 3: Merge to main**

```bash
git switch main && git merge --no-ff review-2-content-edits
```

- [ ] **Step 4: Deploy to Fly.io** (confirm app name from `fly.toml` first). Note the global SafeBrowse/6pn.dev tunnel issue from memory — if `flyctl deploy` hangs on the tunnel, fall back to the documented api.fly.io path.

```bash
flyctl deploy
```

- [ ] **Step 5: Verify live site** matches the local spot-check (Task 13) on 2-3 representative pages.

---

## Self-Review (spec coverage)

- General → phone behavior: Task 14 (Q4). Tagline: Task 15 (Q5). ✅ (both flagged, not silently dropped)
- Footer "Locked out after hours": Task 2 (22 pages). ✅
- Red banner "Need Emergency Service": Task 3 (10 pages, Q1). ✅
- Service Areas (in-shop list + nearby cities): E1, E2 (Q2). ✅
- Residential (5 items): E3–E6 + E7 stub (Q3). ✅
- Commercial (4 items): E8–E11. ✅
- Property Managers (5 items): E12–E16. ✅
- Automotive/Vehicle (5 items): E17–E21. ✅
- Safe (2 items): E22–E23. ✅
- Keyless (4 items): E24–E27. ✅
- Door & Hardware (2 items): E28–E29. ✅
- Access Control & Intercom (2 items): E30–E31. ✅
- Gate Repair (1 item): E32. ✅

All 32 lettered edits + 2 global removals map to tasks. Three items (E7, Task 14 fix, Task 15) are intentionally gated on Lisa's input per the Open Questions.
