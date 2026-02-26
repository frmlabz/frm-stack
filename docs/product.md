# LeadFlow — Omnichannel Lead Capture & AI Agent Platform

## Project Spec Brainstorm

---

# Competitive Intelligence

## Who to Copy & What to Steal

**respond.io** (Singapore, $79-159+/mo) — THE gold standard for messaging-first lead capture. They have the best unified inbox UX with a lifecycle view (lead → customer). Their visual Flow Builder for automation workflows is excellent. They support WhatsApp, Instagram, Facebook Messenger, TikTok, email, and now VoIP/WhatsApp calling. Key insight: they charge per "Monthly Active Contact" not per agent seat at lower tiers, which is smart for SMBs. Their AI Agents can be templated (Sales Agent, Support Agent, Receptionist) or built from scratch.

**Crisp** (France, €45-295/mo) — Cleanest UX in the space. Great knowledge base builder. Their AI Agent builder is no-code and lets you deploy per channel (different agent for WhatsApp vs email). Strong GDPR/EU compliance story. Per-workspace pricing (not per-agent) which is great for small teams.

**Trengo** (Netherlands, ~€99+/mo) — European, omnichannel inbox with good voice support. Their "AI Journeys" concept is interesting — proactive flows that guide customers. Good auto-labeling and conversation summarization features.

**Intercom** (US, $39-139+/mo + per-resolution) — Best workflow engine and product tour system. Their Fin AI agent has ~51% auto-resolution rate. But they're expensive and punish you for successful AI (per-resolution pricing). Still, their UX patterns for conversation routing and escalation are best-in-class.

**Tidio** (Poland, free-$29+/mo) — Great entry point for SMBs. Lyro AI achieves 58%+ resolution rates. Strong Shopify integration. Visual chatbot builder. Closest to our target market in terms of pricing and audience.

## Our Positioning for Serbia

None of these tools are optimized for the Serbian market. Our advantages:

- Serbian language AI agents out of the box
- Local telephony integration (+381 numbers via Telnyx)
- Understanding of Serbian business hours/holidays
- Potential fiscalization integration (connecting sales leads directly to invoicing via your ESIR platform)
- Local payment options and pricing in RSD/EUR
- Price at €29-79/mo to undercut respond.io significantly while being affordable for Serbian SMBs

---

# UI Layout — Main Sections

## 1. Dashboard (Home)

First thing the user sees. Think respond.io's dashboard but more actionable.

**Top row — Key Metrics Cards:**

- New leads today / this week / this month (with trend arrow)
- Unresponded messages (RED if > 0 — this is the whole selling point)
- Average response time
- AI resolution rate (% of conversations handled without human)
- Active conversations right now

**Middle — Action Items / Attention Required:**

- Conversations that need human attention NOW (AI escalated, VIP customer, unanswered > X minutes)
- Missed calls that haven't been followed up
- Leads that went cold (no response in 24h+)
- This section is basically a todo list that guilt-trips the business owner into responding

**Bottom — Activity Feed & Charts:**

- Conversations by channel (pie chart: WhatsApp 45%, Instagram 30%, Email 15%, Calls 10%)
- Lead volume over time (line chart)
- Busiest hours heatmap (helps businesses understand when they need coverage)
- AI vs Human response ratio

---

## 2. Unified Inbox

This is the CORE of the product. Three-column layout (steal from respond.io and Crisp):

### Left Column — Conversation List

- Filter by channel (WhatsApp / Instagram / Email / Calls / All)
- Filter by status (Open / Pending / Resolved / Snoozed)
- Filter by assignee (Unassigned / Me / Team member / AI Agent)
- Search across all conversations
- Each conversation shows: contact name, channel icon, last message preview, timestamp, assigned agent avatar, priority indicator
- Color coding: RED = unresponded, YELLOW = AI handling, GREEN = human responded

### Center Column — Conversation Thread

- Full message history across ALL channels for this contact (if someone DMed on Instagram then WhatsApp, you see both in one thread)
- Channel indicator on each message bubble (so you know which channel it came from)
- AI responses clearly marked with a bot icon
- For calls: show call recording player, duration, transcript (if AI transcribed), and voicemail
- Reply box at bottom with channel selector (respond via WhatsApp even if they wrote on Instagram)
- Quick actions: assign to team member, snooze, mark as lead, add tags, create task
- AI suggestions panel: suggested reply, detected intent, lead score

### Right Column — Contact Profile

- Contact details (name, phone, email, Instagram handle)
- Lead status (New / Contacted / Qualified / Won / Lost)
- Conversation history timeline (all touchpoints)
- Tags and notes
- Custom fields (business can define their own)
- Activity log
- Quick action buttons: Call back, Send WhatsApp template, Create deal

---

## 3. Contacts / CRM Lite

### Contact List View

- Table with sortable columns: Name, Phone, Email, Channel, Lead Status, Last Contact, Assigned To, Tags
- Bulk actions: assign, tag, export, send broadcast
- Smart filters and saved views ("All uncontacted leads from Instagram this week")

### Contact Detail Page

- Everything from the inbox right sidebar, but expanded full-page
- Full conversation history across all channels
- Timeline of all interactions
- Notes and internal tasks
- Deal/opportunity tracking (simple: interested in X, estimated value Y)

---

## 4. AI Agents Configuration

Inspired by respond.io's agent templates + Crisp's no-code builder.

### Agent List

- Each agent has a name, avatar, role (Sales / Support / Receptionist / Custom)
- Status: Active / Paused / Draft
- Stats per agent: conversations handled, resolution rate, avg response time

### Agent Builder (per agent)

**Tab 1 — Identity & Personality:**

- Agent name and avatar
- System prompt / personality description ("You are a friendly sales assistant for [Business Name]. You speak Serbian. You are helpful but not pushy.")
- Language: Serbian / English / Both / Auto-detect
- Tone: Formal / Casual / Professional

**Tab 2 — Knowledge Base:**

- Upload documents (PDF, DOCX, TXT) — product catalogs, price lists, FAQ
- Add website URLs to crawl
- Manual Q&A pairs for precise answers
- The system chunks and embeds these for RAG retrieval
- Test panel: type a question and see what the agent would answer with source attribution

**Tab 3 — Behavior Rules:**

- Active hours (Mon-Fri 8:00-20:00, etc.) — outside these hours, play away message or switch to different behavior
- Channel assignment (this agent handles WhatsApp and Instagram, another handles email)
- Escalation rules:
  - Escalate to human when: customer explicitly asks for human, detected frustration/anger, topic outside knowledge base, conversation exceeds X messages, keywords detected ("refund", "complaint", "manager")
  - Escalation target: specific team member, round-robin, or least-busy agent
- Lead capture rules:
  - Always try to collect: name, phone, email, what they're interested in
  - When lead is captured: notify team via push notification / email / SMS
- Allowed actions:
  - Can share product info: yes/no
  - Can share pricing: yes/no
  - Can book appointments: yes/no (Google Calendar integration)
  - Can send payment links: yes/no
  - Can offer discounts: yes/no (with max discount %)

**Tab 4 — Call Handling (for voice agents):**

- Phone number assignment
- Business hours routing: during hours → ring real person first, after X seconds → AI picks up
- After hours: play prerecorded message / AI answers / voicemail
- IVR menu builder ("Press 1 for sales, 2 for support")
- Call recording: on/off
- Voicemail transcription: on/off
- Forward-to chain: number 1 → no answer → number 2 → no answer → fallback

**Tab 5 — Testing & Preview:**

- Chat simulator — pretend to be a customer and test the agent
- Call simulator — test the voice flow
- View recent real conversations and grade agent performance
- Thumbs up/down on AI responses to improve over time

---

## 5. Automation / Workflows

Visual flow builder (like respond.io / ManyChat):

### Available Triggers

- New message on [channel]
- New incoming call
- Missed call
- Lead status changed
- Tag added/removed
- No response for X minutes/hours
- Business hours start/end
- Keyword detected in message
- New contact created
- CSAT score received

### Available Actions

- Send message (on specific channel, with template selection)
- Assign to agent/team
- Add/remove tag
- Update lead status
- Send notification (push, email, SMS to team members)
- Create task
- Transfer to AI agent
- Transfer to human agent
- Wait/delay
- Branch (if/else conditions)
- HTTP webhook (for custom integrations)
- Update contact field

### Example Flows to Ship Pre-Built

**"Missed Call Recovery":**
Missed call → Wait 2 min → Send WhatsApp: "Izvinite što smo propustili vaš poziv! Kako vam možemo pomoći?" → AI agent takes over → If lead captured → Notify team

**"Instagram Lead Capture":**
New Instagram DM → AI asks what they're interested in → Captures name + phone → Tags as "Instagram Lead" → Notifies sales team → If no human response in 10 min → AI continues conversation

**"After Hours Email Auto-Reply":**
Email received outside business hours → Auto-reply: "Hvala na vašem emailu, odgovorićemo vam sutra ujutru" → Create task for morning → Notify team when business hours start

**"VIP Customer Detection":**
Message received → Check if contact tagged "VIP" → If yes → Immediately assign to owner + send urgent push notification → Skip AI entirely

---

## 6. Phone / Call Center

### Active Calls Dashboard

- Live view of current calls (who's on the phone, duration, which agent)
- Call queue (waiting callers)
- Quick transfer between agents
- Mute/hold controls

### Call History

- List of all calls: incoming/outgoing/missed, duration, recording, transcript
- Filter by date, agent, outcome
- Click to listen to recording inline
- AI-generated call summary
- One-click "follow up" that opens WhatsApp compose to that number

### Phone Numbers Management

- View purchased numbers (+381 and international)
- Assign numbers to departments/agents
- Configure greeting message per number
- Usage and cost tracking

---

## 7. Knowledge Base Manager

### Document Library

- Upload and organize documents by category (Products, Pricing, Policies, FAQ)
- Supported formats: PDF, DOCX, TXT, CSV, URLs
- Version tracking (when was this last updated?)
- Processing status: Processing / Ready / Error
- Per-document stats: how often was this referenced by AI

### Q&A Editor

- Manually add question-answer pairs for precise control
- Review AI-suggested Q&As from real conversations ("customers keep asking this, you should add an answer")
- Test coverage: paste a question, see if the knowledge base can answer it and how confident it is

### Website Crawler

- Enter URLs to crawl
- Schedule re-crawling (daily/weekly) to keep info fresh
- Preview extracted content before activating
- Exclude specific pages or sections

---

## 8. Analytics & Reports

### Conversation Analytics

- Volume by channel over time
- Response time (first response, average, by channel, by agent)
- Resolution rate (AI vs human, by topic)
- CSAT scores and trends
- Busiest hours/days heatmap

### Lead Analytics

- New leads by source/channel
- Conversion funnel: Lead → Contacted → Qualified → Won (with drop-off rates)
- Lead response time vs conversion rate correlation (prove that faster response = more sales)
- Revenue attribution by channel (if deals are tracked)

### Agent Performance

- Per-agent metrics: conversations handled, response time, resolution rate, CSAT
- AI agent: auto-resolution rate, escalation rate, topics it can't handle
- Team overview with leaderboard
- Comparison: before/after AI enablement

### Call Analytics

- Call volume, duration averages, missed call rate
- Peak hours visualization
- AI vs human call handling ratio
- Cost per call

---

## 9. Settings & Configuration

### Channel Connections

- WhatsApp Business API connection wizard (step-by-step with Meta Business verification)
- Instagram Business account connection (via Meta/Facebook login)
- Gmail / IMAP email setup
- Phone number management (Telnyx purchase and configuration)
- Each channel: enable/disable, assign default agent, set auto-responses

### Business Profile

- Business name, address, logo
- Business hours per day of week
- Holiday calendar (Serbian holidays pre-loaded)
- Time zone
- Default language

### Team Management

- Add/remove team members
- Roles: Owner, Admin, Agent, Viewer
- Agent availability status (Online / Away / Offline)
- Working hours per team member
- Notification preferences per team member

### Notifications

- Push notifications (mobile app)
- Email notifications
- SMS notifications to team
- Webhook notifications (for custom tools)
- Granular config: what triggers notifications, who gets them, urgency level

### Integrations

- Google Calendar (appointment booking)
- Google Sheets (lead export, reporting)
- Zapier / Make / n8n webhooks
- Custom REST API with API keys
- Future: fiscalization/ESIR integration

### Branding (for website chat widget)

- Embeddable chat widget for the business's website
- Custom colors, logo, welcome message
- Widget behavior: show/hide based on business hours, page, visitor behavior

---

# Feature Priority — Build Phases

## MVP (Month 1-2)

Core value: "Never miss a lead again"

- Unified inbox (WhatsApp + Instagram + Email)
- Basic contact management with lead status
- Single AI agent with knowledge base (document upload + manual Q&A)
- Business hours configuration (Serbian holidays included)
- Basic call routing: receive → forward to human → after hours voicemail/message
- Push + email notifications for new leads and escalations
- Simple dashboard with key metrics (unresponded count, new leads, response time)
- Settings: channel connections, team members, business profile

## V2 (Month 3-4)

Deeper automation and analytics:

- Multiple AI agents with different roles and channel assignments
- Visual workflow builder with pre-built templates
- Full call center features: recording, transcription, AI-generated call summaries
- Advanced analytics dashboard (all four sections)
- Team management with roles and permissions
- CSAT surveys (post-conversation rating)
- Website chat widget (embeddable)
- Contact merge (detect same person across channels)

## V3 (Month 5+)

Scale and monetize:

- WhatsApp broadcast campaigns (promotional messages)
- Google Calendar booking integration
- Lead scoring (AI-based priority ranking)
- Custom API & webhooks for developers
- Mobile app for agents (iOS + Android)
- White-labeling (for agencies to resell)
- Multi-business support (agency dashboard managing multiple clients)
- AI voice agent (real-time conversation, not just routing)
- Fiscalization integration (lead → invoice pipeline)

---

# Technical Architecture Notes

## Channel Integrations

- **WhatsApp:** WhatsApp Cloud API (Meta-hosted), webhooks for incoming, template messages for outbound
- **Instagram:** Instagram Messaging API via Meta Graph API, requires Instagram Business + Facebook Page
- **Email:** Gmail API with Pub/Sub for real-time push, or generic IMAP/SMTP for non-Gmail
- **Calls:** Telnyx Call Control API for routing + Telnyx RT (WebSocket) for future AI voice

## AI Layer

- **Conversation AI:** Claude API (Anthropic) for message understanding, response generation, intent detection, lead qualification
- **Knowledge Base / RAG:** pgvector (PostgreSQL extension) or Qdrant for vector storage, chunk documents on upload, retrieve relevant chunks per message
- **Voice AI (V3):** Deepgram for real-time STT, Claude for conversation logic, ElevenLabs or Deepgram TTS for voice synthesis

## Real-Time

- WebSockets (Socket.io or native WS) for inbox live updates and notifications
- Redis Pub/Sub for cross-server event distribution

## Backend

- Node.js (Express or Fastify) or Go
- PostgreSQL as primary database (with pgvector extension)
- Redis for caching, queuing (BullMQ), and real-time pub/sub
- S3-compatible storage (Cloudflare R2) for call recordings, uploaded documents

## Frontend

- React / Next.js
- Component library: shadcn/ui for clean, professional look
- Real-time updates via WebSocket connection
- Responsive but desktop-first (agents work on desktop)

## Key Architectural Decisions

- **Multi-tenant from day one** — each business is a tenant with isolated data but shared infrastructure. This enables the agency/white-label model later
- **Event-driven architecture** — every incoming message, call, status change is an event that triggers processing pipelines. Makes it easy to add new channels and automations
- **Queue-first for AI** — all AI processing goes through a job queue so you can handle spikes, retry failures, and rate-limit API calls gracefully

---

# Pricing Model Ideas

Steal from respond.io's model but adapted for Serbia:

| Plan | Price | Included |
|------|-------|----------|
| Starter | €29/mo | 2 users, 500 active contacts, 1 AI agent, WhatsApp + Instagram + Email, basic analytics |
| Growth | €59/mo | 5 users, 2,000 active contacts, 3 AI agents, workflows, call routing, full analytics |
| Pro | €99/mo | 10 users, 5,000 active contacts, unlimited AI agents, AI voice, API access, white-label ready |
| Enterprise | Custom | Unlimited everything, dedicated support, custom integrations, SLA |

Additional charges: Telnyx phone number (~€1/mo) + per-minute call costs, WhatsApp conversation fees (Meta charges these regardless)

---

# Naming Ideas

- **LeadFlow** — clear, international
- **Kontakt** — Serbian-friendly, means what it means
- **LeadVeza** — "Veza" = connection in Serbian
- **Pozivko** — playful take on "Poziv" (call)
- **OmniLead** — descriptive but generic
- **Reachly** — modern SaaS name
- **Uhvati** — "Catch" in Serbian (catch every lead)
