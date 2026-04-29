# Copy & Voice Style Guide

## Brand Positioning

**Core Tagline:** "Stop Guessing Why Your Numbers Don't Match"

**Sub-headline:** "Build, store, and enforce UTM naming conventions across your whole team — without the spreadsheet chaos."

**Positioning:** UTM consistency for teams that care about attribution.

---

## Voice & Tone

### Overall
- **Helpful, not preachy.** We're solving a real problem, not lecturing.
- **Clear over clever.** A marketer who's heard UTM 10 times should still understand you.
- **Action-oriented.** Lead with what you can do, not what we built.
- **Human-first.** Write like you're talking to a person, not a company.

### For ICP B (Marketing Ops / Agencies)
- **Tone:** Professional, efficient, data-smart
- **Avoid:** Hype, buzzwords, "synergize"
- **Use:** "Enforce," "consistent," "automated," "single source of truth"
- **Example:** "Your team can't enforce naming if values live in three spreadsheets. Connect Airtable, pull live values, done."

### For ICP A (Small Business Owner)
- **Tone:** Friendly, non-judgmental, encouraging
- **Avoid:** Technical jargon ("UTM parameter," "attribution model")
- **Use:** Plain words ("tracking tag," "link label," "number mismatch")
- **Example:** "You know when Google says you got 100 clicks but Facebook says 80? That's usually a UTM problem. Here's how to fix it."

---

## Key Messages

### Message 1: The Problem (Attribution Chaos)
**For ICP B:**
"Your team generates UTM links inconsistently. One person writes `campaign_brand_awareness`, another writes `brand-awareness`, another forgets to add campaign at all. Your data is a mess. You have no idea which links actually worked."

**For ICP A:**
"Your Google Analytics shows way fewer conversions than your ad platform. That's usually because your tracking links aren't set up right. When tracking is broken, you make bad decisions about where to spend money."

---

### Message 2: The Solution (Consistency)
**For ICP B:**
"Store your naming rules in one place. Share them with your team. Enforce them automatically. No more manual checking, no more arguments about naming conventions."

**For ICP A:**
"Use a simple structure for your tracking links that Google Analytics will recognize. Paste your links into the tool, it builds them right, and you're done. No spreadsheet, no guessing."

---

### Message 3: The Benefit (Data You Can Trust)
**For ICP B:**
"When your data is consistent, your reports are reliable. You can actually trust your analytics. You spend less time fixing data, more time making decisions."

**For ICP A:**
"When your links are set up right, Google Analytics and your ad platform will actually agree. You'll know which ads are really working. You'll spend money smarter."

---

## Specific Copy Examples

### CTA Buttons
- ❌ "Generate UTM Link" (too technical)
- ✅ "Create a Tracking Link" (ICP A) or "Generate Link" (ICP B, they know what this means)

- ❌ "Connect Data Source"
- ✅ "Connect Airtable" (specific, clear)

### Empty States
**Organic page (new user):**
- ❌ "No UTM links generated yet"
- ✅ "You haven't created any tracking links yet. Ready to get started? Click 'Create a Tracking Link' above. Here's a quick example..." [show example]

### Help Text / Field Labels
**utm_campaign field:**
- ❌ "Campaign identifier for deduplication"
- ✅ "What campaign is this for? E.g., 'spring_sale', 'brand_awareness'"

**utm_content field:**
- ❌ "Content descriptor for A/B testing"
- ✅ "What type of post is this? E.g., 'video_tutorial', 'customer_story'"

### Feature Names
| Internal | For ICP B | For ICP A |
|----------|-----------|-----------|
| utm_campaign | Campaign | Campaign/Category |
| utm_term | Theme | Sub-topic |
| utm_content | Content Hook | Type of Post |
| utm_source | Platform | Where (Facebook, Instagram) |
| utm_medium | Medium | How (organic, direct message) |

---

## Error Messages

### Bad ❌
- "Invalid URL format"
- "Duplicate value"
- "Authentication failed"

### Good ✅
- "That URL doesn't look right. Does it start with https://?"
- "You already have a campaign called 'spring_sale'. Pick a different name or use the existing one."
- "We couldn't connect to Airtable. Check your API key and try again."

---

## Docs & Educational Copy

### For Blog / Content
- **Headline style:** "The [Problem] You Have With [Thing] (And How to Fix It)"
  - Examples: "The Problem You Have With UTM Parameters (And How to Fix It)", "Why Your UTMs Are Broken"
- **Tone:** Helpful, slightly sympathetic to the pain
- **Structure:** Problem → Why it matters → Solution → Example → Tool

### For Emails / Announcements
- **Subject line:** Clear, benefit-first
  - ❌ "UTM Generator v2 Released"
  - ✅ "QR Codes for Your Tracking Links (New)"
- **Body:** One clear benefit + one CTA
  - Avoid: Feature lists, technical details
  - Use: "Here's what changed for you"

---

## Tone Examples by Context

### Success State
- ✅ "Link copied to clipboard!"
- ✅ "Synced 24 values from Airtable"
- ✅ "You're all set! Your team can now share naming conventions."

### Error State
- ✅ "That URL needs to start with https:// or http://"
- ✅ "We couldn't reach Airtable. Is your API key still valid?"
- ✅ "This campaign name is already in your list. Use the existing one or try a different name."

### Onboarding / Guidance
- ✅ "Here's an example tracking link. See how each part matches a field above?"
- ✅ "Your team can see all the naming options you've set up."
- ✅ "This is where your naming rules live. Everyone on your team will use these exact options."

---

## Messaging by Channel

### Website / Hero
- Headline: "Stop Guessing Why Your Numbers Don't Match"
- Sub: "Build, store, and enforce UTM naming conventions across your whole team — without the spreadsheet chaos."
- CTA: "Start Creating Tracking Links"

### Social / Twitter
- "Your team generates UTM links 5 different ways. Your data is inconsistent. Your reports are wrong. There's a better way." [link]
- "Google says 100 conversions. Facebook says 80. The difference? Broken UTM links. Here's how to fix it in 10 minutes." [link]

### Email (Launch)
- Subject: "One tool to stop UTM chaos (free for the first 50 users)"
- Body: "You know that moment when your analytics numbers don't match? That's us, 2 weeks ago. We built something to fix it."

### Help / Support
- Keep it friendly and solution-focused
- Acknowledge the problem ("Yeah, this is confusing at first")
- Explain in plain English
- Show an example
- Link to next step

---

## What NOT to Say

- ❌ "Leverage your UTM data" → Use "Make better decisions with accurate data"
- ❌ "Attribution modeling" → Use "Tracking where conversions come from"
- ❌ "Multi-touch attribution" → Use "Understanding all the touchpoints that led to a sale"
- ❌ "Synergize workflows" → Use "Work together without confusion"
- ❌ "Granular control" → Use "Complete control" or just show the feature
- ❌ "Best-in-class platform" → Show value, don't claim it

---

## Common Phrases

### Replace "UTM" with Context
- In UI labels → Use full term or "Tracking Link" in onboarding
- In help text → Use specific field names ("Campaign", "Platform", "Post Type")
- In marketing → Use "Tracking tags" or just explain what it does

### Replace "Configure" / "Set Up" with:
- "Connect" (for integrations)
- "Create" (for links)
- "Manage" (for values)
- "Build" (for rules/structures)

### Replace "Data Source" with:
- Specific names: "Airtable", "Google Sheets"
- Or generic: "Your naming list"

---

## Accessibility in Copy

- Use short sentences (max 20 words)
- One idea per sentence
- Active voice when possible
- Define jargon on first use
- Descriptive link text (not "click here")
- Example: ✅ "Connect your Airtable base" vs ❌ "click here"
