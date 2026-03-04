# Promethean Sovereign Economy Enhancement Plan
## Phase 6.1: Advanced Economic Features

**Created:** 2026-02-12  
**Status:** Planning → Awaiting Approval  
**Baseline:** ✅ Verified (UVT Ledger, Mining, Dashboard, Basic Quests)

---

## 🎯 Executive Summary

This plan implements 5 major enhancements to the Promethean Discord Economy, transforming it from a basic mining system into a sophisticated, self-sustaining economic ecosystem with AI-powered incentives, spending mechanics, and autonomous content generation.

**Total Estimated Time:** 3-4 hours  
**Deployment Strategy:** Incremental (deploy after each phase for testing)

---

## 📋 Implementation Order & Dependencies

**Dependency Flow:**
1. Quest Completion → 2. AI Mining → 3. UVT Spending → 4. Narrative Engine → 5. Enhanced Dashboard

**Rationale for Order:**
1. **Quest Completion** first - extends existing `/quest` system, no new dependencies
2. **AI Mining** second - enhances existing mining, uses Gemini API we already have
3. **UVT Spending** third - requires stable UVT supply from enhanced mining
4. **Narrative Engine** fourth - can utilize UVT spending for premium content
5. **Enhanced Dashboard** last - displays all new metrics from previous phases

---

## 🔧 Phase 1: Quest Completion System

### Objective
Allow admins to mark quests complete and automatically award UVT to users who completed them.

### Technical Approach
1. **Create Quest Storage** (Firestore)
   - Collection: `quests`
   - Schema: questId, title, description, reward, status, createdBy, createdAt, claimedBy, completedAt

2. **New Commands**
   - `/quest` (existing) - now saves to Firestore
   - `/claim <quest-id>` - user claims they completed it
   - `/approve <quest-id> @user` - admin approves and awards UVT
   - `/quests` - list all open/claimed quests

3. **Files to Modify**
   - `discord-client.ts` - add new command handlers
   - Create `treasury/quest-manager.ts` - quest CRUD operations

---

## 🧠 Phase 2: AI-Powered Mining (Quality-Based Rewards)

### Objective
Use Gemini to analyze message quality and award 0.01-0.1 UVT for high-value contributions.

### Technical Approach
- Call Gemini API with message content
- Rate contribution value (1-10) based on: insight, effort, helpfulness
- Map score to UVT:
  - 1-3: 0.001 UVT (low effort)
  - 4-6: 0.01 UVT (good)
  - 7-8: 0.05 UVT (great)
  - 9-10: 0.1 UVT (exceptional)

### Files to Modify
- `discord-client.ts` - enhance `messageCreate` handler
- Create `tools/message-scorer.ts` - Gemini scoring logic

---

## 🛒 Phase 3: UVT Spending System

### Objective
Allow users to spend UVT on valuable services.

### Spending Options
1. **AI Art Generation** - 5 UVT (`/generate-art`)
2. **Premium Role** - 50 UVT (`/buy-role`)
3. **AI Analysis/Report** - 10 UVT (`/analyze`)
4. **Priority Support** - 20 UVT (`/priority-ticket`)

### Technical Approach
- Add `debit()` method to `discord-ledger.ts`
- Create `services/` directory for each service
- Commands: `/shop`, `/buy <item-id>`

---

## 📝 Phase 4: Sovereign Narrative Engine

### Objective
Auto-generate blog posts, thought leadership content, and community insights.

### Content Types
- **Weekly Sovereign Insights** (philosophical essays on sovereignty, AI, economics)
- **Progress Reports** (data-driven updates on community growth)
- **Explainer Articles** (educational content on network states, technology)

### Technical Approach
- Scheduled generation with node-cron
- Command: `/generate-insight`, `/commission-essay <topic>`
- Save to Firestore `blog_posts`
- Costs 100 UVT for custom commissioned essays

### Files to Create
- `tools/narrative-engine.ts`
- `cron/weekly-content.ts`

---

## 📊 Phase 5: Enhanced Dashboard

### Objective
Add rich visualizations and comprehensive metrics to dashboard.

### New Metrics
- UVT Velocity (transactions/day)
- Gini Coefficient (wealth distribution)
- Active Citizens (7-day)
- Quest Completion Rate
- Historical trends (7-day charts)

### Technical Approach
- Create `analytics/metrics-calculator.ts`
- ASCII charts in embeds (lightweight)
- Cache expensive calculations

---

## 📦 Deployment Strategy

After each phase:
1. Run local verification tests
2. Deploy to Cloud Run
3. Test in Discord
4. Monitor logs for 10 minutes
5. Proceed to next phase

---

## 💰 Cost Estimate

| Service | Current | After Enhancements |
|---------|---------|-------------------|
| Gemini API | ~$2/month | ~$20/month |
| Firestore | $0 (free tier) | ~$5/month |
| Cloud Run | $0 (free tier) | $0 |
| **Total** | **$2/month** | **$25/month** |

---

## 📅 Timeline Estimate

| Phase | Total Time |
|-------|-----------|
| 1. Quest Completion | 1 hour |
| 2. AI Mining | 45 min |
| 3. UVT Spending | 1h 20min |
| 4. Narrative Engine | 1 hour |
| 5. Enhanced Dashboard | 45 min |
| **TOTAL** | **~5 hours** |

---

## ✅ Approval Checklist

Before we proceed, please confirm:
- [ ] **Scope:** All 5 phases approved
- [ ] **Order:** Implementation order makes sense
- [ ] **Budget:** $25/month ongoing cost acceptable
- [ ] **Timeline:** ~5 hours development approved
- [ ] **Any Changes?** Features to add/remove/modify?

---

**Ready to begin?** Reply with your approval or requested changes.
