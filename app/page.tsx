import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BookOpenTextIcon,
  CheckIcon,
  ClockCounterClockwiseIcon,
  CloudCheckIcon,
  FilePdfIcon,
  ImageSquareIcon,
  LightbulbIcon,
  PresentationChartIcon,
  RocketLaunchIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import "./landing.css";

const signupHref = "/sign-in?callbackUrl=%2Fdashboard";

const features = [
  {
    icon: PresentationChartIcon,
    number: "01",
    title: "A story, already in order",
    copy: "Start with a startup idea. SlidePilot shapes it into a focused 5–8 slide investor narrative, from the problem to the ask.",
    detail: "Problem · Solution · Market · Product · Business model · Ask",
  },
  {
    icon: ImageSquareIcon,
    number: "02",
    title: "Visuals made for your idea",
    copy: "Each slide gets a tailored image prompt and a generated visual, so the deck feels connected to the story you’re telling.",
    detail: "AI-generated imagery for every slide",
  },
  {
    icon: FilePdfIcon,
    number: "03",
    title: "Ready to take with you",
    copy: "Open a clean, print-ready deck preview and save it as a PDF from your browser when it’s time to share.",
    detail: "Print-ready PDF export",
  },
  {
    icon: ClockCounterClockwiseIcon,
    number: "04",
    title: "Pick up where you left off",
    copy: "Your generated decks stay in your account’s Ideas library, ready to revisit whenever you need them.",
    detail: "Saved to your Ideas workspace",
  },
];

const steps = [
  ["Bring the seed", "Describe your startup or product in a few sentences."],
  [
    "Set the direction",
    "Add context so the narrative reflects what you want to present.",
  ],
  [
    "Build the first draft",
    "SlidePilot writes the story and generates matching slide imagery.",
  ],
  [
    "Review and share",
    "Find it in Ideas, move through the slides, then print or save as PDF.",
  ],
];

const audiences = [
  {
    label: "For founders",
    title: "Make the case for what comes next.",
    copy: "Shape an early idea into a clear first investor pitch.",
    icon: RocketLaunchIcon,
  },
  {
    label: "For students & educators",
    title: "Spend less time facing the blank page.",
    copy: "Turn a project concept into a structured presentation draft.",
    icon: BookOpenTextIcon,
  },
  {
    label: "For consultants & teams",
    title: "Get to a useful outline sooner.",
    copy: "Give a new business concept a story your audience can follow.",
    icon: LightbulbIcon,
  },
];

const questions = [
  {
    question: "What kind of presentations does SlidePilot create?",
    answer:
      "SlidePilot is currently optimized for startup and investor pitch decks. It creates a 5–8 slide narrative covering the problem, solution, market, product, business model, and ask.",
  },
  {
    question: "Does it create images as well as slide content?",
    answer:
      "Yes. SlidePilot generates a visual for each slide based on that slide’s image prompt, then saves the image with the deck.",
  },
  {
    question: "Can I edit individual slides in SlidePilot?",
    answer:
      "Individual slide editing is not available in the current version. You can create another draft with a more specific prompt, review it in your workspace, and export it as a PDF.",
  },
  {
    question: "How do I download or share my deck?",
    answer:
      "Open a deck and choose the PDF option. Your browser’s print dialog lets you print it or save it as a PDF.",
  },
  {
    question: "How much does it cost to try?",
    answer:
      "New accounts start with five credits. One credit is used for each deck generation. Paid credit top-ups are not available in the current app yet.",
  },
  {
    question: "Where are my decks saved?",
    answer:
      "Generated decks are saved to your account and listed in Ideas, so you can return to them after leaving the workspace.",
  },
];

function BrandMark({ footer = false }: { footer?: boolean }) {
  return (
    <span className={`lp-brand${footer ? " lp-brand-footer" : ""}`}>
      <span className="lp-brand-symbol" aria-hidden="true">
        <PresentationChartIcon />
      </span>
      <span>SlidePilot</span>
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="lp-header">
        <div className="lp-header-inner">
          <Link href="/" aria-label="SlidePilot home">
            <BrandMark />
          </Link>
          <nav className="lp-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="lp-header-actions">
            <Link className="lp-signin" href="/sign-in">
              Sign in
            </Link>
            <Link className="lp-button lp-button-small" href={signupHref}>
              Start creating <ArrowUpRightIcon aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <section className="lp-hero" aria-labelledby="hero-title">
        <div className="lp-hero-backdrop" aria-hidden="true" />
        <div className="lp-hero-copy lp-shell lp-reveal">
          <div className="lp-hero-copy-inner">
            <div className="lp-eyebrow">
              <SparkleIcon weight="fill" aria-hidden="true" />
              <span>From first thought to first draft</span>
            </div>
            <h1 id="hero-title">
              Your next big idea deserves a <em>better deck.</em>
            </h1>
            <p className="lp-hero-description">
              Turn a startup idea into a polished pitch story, complete with
              AI-generated slide visuals. Start with a prompt. Leave the blank
              slide behind.
            </p>
            <div className="lp-hero-actions">
              <Link className="lp-button" href={signupHref}>
                Generate your first deck <ArrowRightIcon aria-hidden="true" />
              </Link>
              <a className="lp-text-link" href="#how-it-works">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="lp-hero-proof">
              <span className="lp-proof-icon">
                <CheckIcon weight="bold" aria-hidden="true" />
              </span>
              <span>5 starter credits included</span>
              <span className="lp-proof-divider" aria-hidden="true" />
              <span>No card to get started</span>
            </div>
          </div>
        </div>
        <a
          className="lp-scroll-cue lp-shell"
          href="#product-preview"
          aria-label="Scroll to the product preview"
        >
          <span /> SCROLL TO EXPLORE
        </a>
      </section>

      <section
        className="lp-showcase lp-shell"
        id="product-preview"
        aria-labelledby="preview-title"
      >
        <div className="lp-showcase-heading">
          <div>
            <span className="lp-kicker">A FIRST LOOK INSIDE</span>
            <h2 id="preview-title">
              A story worth <em>showing.</em>
            </h2>
          </div>
          <p>
            From the opening slide to a ready-to-share PDF, your first draft
            starts to take shape.
          </p>
        </div>
        <div
          className="lp-hero-visual lp-reveal"
          aria-label="SlidePilot pitch deck preview"
        >
          <div className="lp-visual-glow" aria-hidden="true" />
          <div className="lp-deck-window">
            <div className="lp-window-bar">
              <div className="lp-window-dots" aria-hidden="true">
                <i /> <i /> <i />
              </div>
              <span className="lp-window-title">SLIDEPILOT / PITCH DECK</span>
              <span className="lp-window-state">
                <span /> DRAFT READY
              </span>
            </div>
            <div className="lp-preview-body">
              <div className="lp-preview-rail">
                <span className="lp-rail-label">YOUR DECK</span>
                <span className="lp-rail-line lp-rail-line-active" />
                <span className="lp-rail-line" />
                <span className="lp-rail-line" />
                <span className="lp-rail-line" />
                <span className="lp-rail-line" />
                <span className="lp-rail-line" />
                <span className="lp-rail-count">01 / 07</span>
              </div>
              <article className="lp-preview-slide">
                <div
                  className="lp-slide-image"
                  role="img"
                  aria-label="Aerial view of a city at dusk"
                />
                <div className="lp-slide-shade" aria-hidden="true" />
                <div className="lp-slide-content">
                  <span className="lp-slide-kicker">THE FUTURE, IN REACH</span>
                  <h2>Make room for a smarter city.</h2>
                  <p>A new way to power the places we call home.</p>
                  <span className="lp-slide-index">01 — THE OPPORTUNITY</span>
                </div>
                <span className="lp-slide-brand">SP / 01</span>
              </article>
            </div>
            <div className="lp-window-footer">
              <span>
                <SparkleIcon weight="fill" aria-hidden="true" /> 7 slides
                created
              </span>
              <span>
                <ImageSquareIcon aria-hidden="true" /> Custom visuals
              </span>
              <span className="lp-window-export">
                <FilePdfIcon aria-hidden="true" /> PDF ready
              </span>
            </div>
          </div>
          <div className="lp-float-note lp-note-top">
            <span className="lp-note-spark">
              <SparkleIcon weight="fill" aria-hidden="true" />
            </span>
            <span>
              <strong>One prompt.</strong>
              <br />A complete story.
            </span>
          </div>
          <div className="lp-float-note lp-note-bottom">
            <span className="lp-note-check">
              <CheckIcon weight="bold" aria-hidden="true" />
            </span>
            <span>
              <strong>Saved to Ideas</strong>
              <br />
              Ready when you are
            </span>
          </div>
        </div>
      </section>

      <section
        className="lp-problem lp-section"
        id="problem"
        aria-labelledby="problem-title"
      >
        <div className="lp-shell lp-problem-grid">
          <div className="lp-section-intro">
            <span className="lp-kicker">THE BLANK-SLIDE PROBLEM</span>
            <h2 id="problem-title">
              The idea is yours.
              <br />
              <em>The busywork doesn’t have to be.</em>
            </h2>
            <p>
              A good presentation takes more than good ideas. It takes time to
              find the story, shape the slides, and make every visual feel like
              it belongs.
            </p>
          </div>
          <div className="lp-problem-list">
            <article className="lp-problem-row">
              <span className="lp-problem-mark">01</span>
              <div>
                <h3>Where do you even begin?</h3>
                <p>
                  A blank canvas makes it hard to know what your audience needs
                  to hear first.
                </p>
              </div>
              <span className="lp-problem-cross" aria-hidden="true">
                ×
              </span>
            </article>
            <article className="lp-problem-row">
              <span className="lp-problem-mark">02</span>
              <div>
                <h3>Good points, scattered story.</h3>
                <p>
                  Research, notes, and ideas don’t automatically become a clear
                  narrative.
                </p>
              </div>
              <span className="lp-problem-cross" aria-hidden="true">
                ×
              </span>
            </article>
            <article className="lp-problem-row">
              <span className="lp-problem-mark">03</span>
              <div>
                <h3>Hours lost to visual polish.</h3>
                <p>
                  Finding images and matching them to every slide can pull you
                  away from the idea.
                </p>
              </div>
              <span className="lp-problem-cross" aria-hidden="true">
                ×
              </span>
            </article>
          </div>
        </div>
      </section>

      <section
        className="lp-features lp-section"
        id="features"
        aria-labelledby="features-title"
      >
        <div className="lp-shell">
          <div className="lp-heading-row">
            <div className="lp-section-intro">
              <span className="lp-kicker">A DECK, WITHOUT THE DETOUR</span>
              <h2 id="features-title">
                Your idea has a <em>co-pilot.</em>
              </h2>
            </div>
            <p>
              From a rough concept to a presentation you can review, share, and
              return to.
            </p>
          </div>
          <div className="lp-feature-grid">
            {features.map(({ icon: Icon, number, title, copy, detail }) => (
              <article className="lp-feature" key={number}>
                <div className="lp-feature-top">
                  <span className="lp-feature-icon">
                    <Icon weight="duotone" aria-hidden="true" />
                  </span>
                  <span className="lp-feature-number">{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
                <span className="lp-feature-detail">
                  <CheckIcon weight="bold" aria-hidden="true" /> {detail}
                </span>
              </article>
            ))}
          </div>
          <p className="lp-feature-note">
            SlidePilot currently focuses on investor-pitch decks. A custom
            template library and in-app slide editor are not part of the current
            product.
          </p>
        </div>
      </section>

      <section
        className="lp-how lp-section"
        id="how-it-works"
        aria-labelledby="how-title"
      >
        <div className="lp-shell lp-how-grid">
          <div className="lp-section-intro lp-how-intro">
            <span className="lp-kicker">FOUR STEPS TO YOUR FIRST DRAFT</span>
            <h2 id="how-title">
              From “what if”
              <br />
              to <em>“let’s show them.”</em>
            </h2>
            <p>
              No slide-by-slide setup. Give the idea a little context and let
              SlidePilot build the first pass.
            </p>
            <Link className="lp-inline-link" href={signupHref}>
              Start with your idea <ArrowRightIcon aria-hidden="true" />
            </Link>
          </div>
          <ol className="lp-steps">
            {steps.map(([title, copy], index) => (
              <li className="lp-step" key={title}>
                <span className="lp-step-number">0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                {index < steps.length - 1 ? (
                  <span className="lp-step-connector" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="lp-benefits lp-section"
        aria-labelledby="benefits-title"
      >
        <div className="lp-shell lp-benefit-panel">
          <div className="lp-benefit-copy">
            <span className="lp-kicker">MORE TIME FOR THE IDEA</span>
            <h2 id="benefits-title">
              Make your first draft the <em>starting point.</em>
            </h2>
            <p>
              SlidePilot takes care of the first structure and visuals, so you
              can spend your energy on the details only you can bring.
            </p>
          </div>
          <ul className="lp-benefit-list">
            <li>
              <CheckIcon weight="bold" aria-hidden="true" />
              <span>
                <strong>Find the thread.</strong> A clear pitch flow gives your
                idea a beginning, middle, and ask.
              </span>
            </li>
            <li>
              <CheckIcon weight="bold" aria-hidden="true" />
              <span>
                <strong>Skip the asset hunt.</strong> Start with generated
                imagery for each slide.
              </span>
            </li>
            <li>
              <CheckIcon weight="bold" aria-hidden="true" />
              <span>
                <strong>Keep momentum.</strong> Your deck stays in Ideas and is
                ready to export.
              </span>
            </li>
          </ul>
          <div className="lp-benefit-stamp" aria-hidden="true">
            <span>IDEA</span>
            <ArrowUpRightIcon />
            <span>IN MOTION</span>
          </div>
        </div>
      </section>

      <section className="lp-people lp-section" aria-labelledby="people-title">
        <div className="lp-shell">
          <div className="lp-people-heading">
            <span className="lp-kicker">BUILT FOR YOUR NEXT BIG MOMENT</span>
            <h2 id="people-title">
              Different rooms.
              <br />
              <em>One place to start.</em>
            </h2>
            <p>
              SlidePilot is made for people who have something worth
              presenting—and not a whole afternoon to build the first draft.
            </p>
          </div>
          <div className="lp-people-grid">
            {audiences.map(({ label, title, copy, icon: Icon }, index) => (
              <article className="lp-person" key={label}>
                <span className="lp-person-icon">
                  <Icon weight="duotone" aria-hidden="true" />
                </span>
                <span className="lp-person-label">
                  0{index + 1} / {label}
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <p className="lp-social-proof-note">
            We’re building our first customer stories. These are the people
            SlidePilot is designed to help—not fabricated testimonials.
          </p>
        </div>
      </section>

      <section
        className="lp-pricing lp-section"
        id="pricing"
        aria-labelledby="pricing-title"
      >
        <div className="lp-shell lp-pricing-grid">
          <div className="lp-section-intro">
            <span className="lp-kicker">A LITTLE HEAD START</span>
            <h2 id="pricing-title">
              Your first five ideas are <em>on us.</em>
            </h2>
            <p>
              New accounts include five generation credits. Each new deck uses
              one credit. No payment details needed to begin.
            </p>
            <span className="lp-pricing-note">
              <CloudCheckIcon aria-hidden="true" /> Decks are saved in your
              account’s Ideas workspace.
            </span>
          </div>
          <div className="lp-price-card">
            <div className="lp-price-card-top">
              <span>SLIDEPILOT STARTER</span>
              <span className="lp-price-badge">FREE TO START</span>
            </div>
            <div className="lp-price">
              <span>$</span>0 <small>to get started</small>
            </div>
            <p className="lp-price-subtitle">
              Everything you need to try your first pitch draft.
            </p>
            <ul>
              <li>
                <CheckIcon weight="bold" aria-hidden="true" /> 5 generation
                credits included
              </li>
              <li>
                <CheckIcon weight="bold" aria-hidden="true" /> 5–8 slides per
                generated deck
              </li>
              <li>
                <CheckIcon weight="bold" aria-hidden="true" /> AI-generated
                slide visuals
              </li>
              <li>
                <CheckIcon weight="bold" aria-hidden="true" /> Saved decks in
                Ideas
              </li>
              <li>
                <CheckIcon weight="bold" aria-hidden="true" /> Print or save to
                PDF
              </li>
            </ul>
            <Link className="lp-button lp-price-button" href={signupHref}>
              Use my 5 free credits <ArrowRightIcon aria-hidden="true" />
            </Link>
            <p className="lp-price-footnote">
              Paid plans and credit top-ups are not available in the current
              app.
            </p>
          </div>
        </div>
      </section>

      <section
        className="lp-faq lp-section"
        id="faq"
        aria-labelledby="faq-title"
      >
        <div className="lp-shell lp-faq-grid">
          <div className="lp-section-intro">
            <span className="lp-kicker">GOOD TO KNOW</span>
            <h2 id="faq-title">
              A few things before <em>you begin.</em>
            </h2>
            <p>Clear answers about what SlidePilot can do today.</p>
          </div>
          <div className="lp-faq-list">
            {questions.map(({ question, answer }) => (
              <details className="lp-faq-item" key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-final-cta lp-shell" aria-labelledby="final-title">
        <div className="lp-final-inner">
          <div className="lp-final-spark" aria-hidden="true">
            <SparkleIcon weight="fill" />
          </div>
          <span className="lp-kicker">YOUR IDEA, IN PRESENTATION FORM</span>
          <h2 id="final-title">
            Let’s make the
            <br />
            <em>first draft happen.</em>
          </h2>
          <p>
            Bring the idea. SlidePilot will help with the story and the slides.
          </p>
          <Link className="lp-button" href={signupHref}>
            Create your first deck <ArrowRightIcon aria-hidden="true" />
          </Link>
          <span className="lp-final-footnote">
            5 credits included with a new account · Sign in with Google
          </span>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-shell lp-footer-inner">
          <Link href="/" aria-label="SlidePilot home">
            <BrandMark footer />
          </Link>
          <p>Give the idea a deck it can grow into.</p>
          <nav aria-label="Footer navigation">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <Link href="/sign-in">Sign in</Link>
          </nav>
          <span className="lp-copyright">
            © {new Date().getFullYear()} SlidePilot
          </span>
        </div>
      </footer>
    </main>
  );
}
