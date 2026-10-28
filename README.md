# SlidePilot

> **AI-Powered Investor Pitch Deck Generator**  
> 🔗 **Live Demo:** [https://slide-pilot-xi.vercel.app/](https://slide-pilot-xi.vercel.app/)

SlidePilot is an AI SaaS platform that transforms raw startup ideas into structured, investor-ready pitch decks in minutes. It bridges the gap between early-stage concepts and polished presentations by combining guardrailed LLM storytelling, context-aware visual generation, durable background orchestration, and PDF export.

---

## 🌟 Key Features

### 🎯 1. Structured Pitch Deck Generation
- **Investor Narrative Architecture**: Turns an unstructured prompt or supporting text into a 5–8 slide investor story: *Title & Tagline*, *Problem*, *Solution*, *Market Opportunity*, *Product Capabilities*, *Business Model*, and *The Ask*.
- **Guardrailed AI Reasoning**: Utilizes the **OpenAI Agents SDK** with custom input validation and output quality-check guardrails to eliminate hallucinations and placeholder text.

### 🎨 2. Context-Aware Visual Direction
- **Tailored 16:9 Slide Imagery**: Automatically crafts artistic prompts matching the narrative and generates high-resolution widescreen slide imagery using **Google Gemini**.
- **Global CDN Delivery**: Optimizes and serves all generated assets through **ImageKit** with responsive loading and caching.

### ⚡ 3. Resilient Background Workflow
- **Durable Step Execution**: Orchestrated by **Inngest** as an event-driven, multi-step pipeline with individual step checkpoints (load deck $\rightarrow$ run agent $\rightarrow$ generate visuals $\rightarrow$ save slides $\rightarrow$ complete).
- **Live Cancellation & Auto-Refund**: Allows users to stop generation mid-process with instant job termination and automatic credit rollback.

### 📊 4. Interactive Slide Viewer & PDF Export
- **Widescreen Presentation Viewer**: Built-in slide carousel featuring collapsible speaker notes, fullscreen image lightbox, and keyboard shortcuts (`←`, `→`, `Esc`).
- **Print-Ready PDF Export**: Dedicated clean print view (`/dashboard/pdf/[id]`) supporting direct browser print-to-PDF export.

### 💳 5. Credit System & Razorpay Billing
- **Transparent Wallet**: Users start with 5 complimentary credits on signup and track credits via an immutable transaction ledger.
- **Secure Payment Gateway**: Integrates **Razorpay** for purchasing credit packages (Starter, Growth, Pro, Founder) backed by cryptographic HMAC SHA-256 signature verification and atomic database updates.

### 📁 6. Persistent Ideas Library & Authentication
- **Ideas Workspace**: Automatically catalogs every pitch deck in a persistent library, allowing users to revisit, view, or export decks anytime.
- **Secure Google Authentication**: Seamless social sign-in powered by **Better-Auth** with secure session cookies.

### 🌌 7. Responsive Glassmorphic Interface
- **Modern UI**: Crafted with pure **Tailwind CSS** featuring custom glassmorphism, responsive sidebar drawer navigation, and smooth motion transitions across mobile and desktop.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React, Tailwind CSS, Phosphor Icons |
| **Backend** | Next.js Route Handlers, Server Actions |
| **Database & ORM** | PostgreSQL, Prisma |
| **Background Jobs** | Inngest (Event-Driven Durable Execution) |
| **AI Models** | OpenAI Agents SDK, Google Gemini API |
| **Media CDN** | ImageKit |
| **Payments** | Razorpay SDK |
| **Authentication** | Better-Auth (Google OAuth) |
