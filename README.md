# Dekge

Chat with your PDFs. Upload a document, ask a question in plain English, and get an
answer drawn from the document itself, streamed back as it's written.

**Live demo:** [dekge.vercel.app](https://dekge.vercel.app)

> **Design rule:** answers come from the document, not the model's memory. Each question
> pulls the four most relevant pages of *that* file, and the model is told to say it
> doesn't know when the answer isn't in them.

Dekge started from Josh tried coding's
[Build a Complete SaaS Platform with Next.js 13, React, Prisma, tRPC, Tailwind](https://youtu.be/ucX2zXAZ1I0)
course (2023). I built along with it, then kept going. [What I changed](#what-i-changed-from-the-tutorial)
is listed below, and so are the [known issues](#known-issues-and-which-step-fixes-them),
including two that came with the course code.

```
  UPLOAD (once per file)                               ASK (every question)
 +---------------------------------------------+      +----------------------------------------------------+
 |  PDF --> UploadThing --> split into pages   |      |  question --> same OpenAI embedding                |
 |      --> count pages, check the plan limit  |      |           --> Pinecone: the 4 closest pages,       |
 |      --> OpenAI embedding for each page     |      |               filtered to this file only           |
 |      --> Pinecone index "dekge",            |      |           --> OpenAI GPT-6 Luna,                   |
 |          tagged with the file's ID          |      |               with those pages + earlier messages  |
 |      --> status in PostgreSQL:              |      |           --> answer streamed to the browser,      |
 |          PROCESSING -> SUCCESS or FAILED    |      |               then saved to PostgreSQL             |
 +---------------------------------------------+      +----------------------------------------------------+
```

---

## How it works

1. **Upload.** UploadThing stores the PDF and calls back to the server, which creates a
   `File` row with status `PROCESSING`. LangChain's `PDFLoader` splits the PDF into
   pages, and the page count is checked against the user's plan.
2. **Index.** Each page is embedded with OpenAI (`text-embedding-ada-002`, 1,536
   dimensions) and written to the Pinecone index `dekge` with the file's ID in its
   metadata. The status becomes `SUCCESS`, or `FAILED` if indexing fails or the file is
   over the limit.
3. **Ask.** `/api/message` checks that you're signed in (Kinde), validates the input
   with Zod, confirms you own the file, and saves your question. It embeds the question
   the same way, asks Pinecone for the 4 closest pages *from that file only*, and sends
   them to OpenAI's GPT-6 Luna along with earlier messages from the chat. (It ran on
   GPT-3.5 Turbo at temperature 0 until OpenAI retired that model in October 2026.)
4. **Stream.** The answer streams back as it's generated (Vercel AI SDK) and is saved
   when it finishes. The chat shows your question right away, before the server replies,
   and loads older messages 10 at a time as you scroll up.

## Plans

| | Free | Pro ($15 a month) |
|---|---|---|
| Files | 10 | 50 |
| Pages per PDF | 5 | 25 |
| Largest file | 4 MB | 16 MB |

Billing runs through Stripe Checkout in test mode, so no real charges are made. To try
Pro on the demo, use Stripe's test card `4242 4242 4242 4242` with any future date and
any CVC. Files that failed for being too long are re-enabled when you upgrade.

---

## What I changed from the tutorial

- **Database:** moved from MySQL on PlanetScale to PostgreSQL on Neon after PlanetScale
  ended its free tier.
- **Keeping files apart:** replaced Pinecone namespaces with a `fileId` metadata filter,
  because the free index didn't offer namespaces.
- **Plan limits:** added a page-count column and per-plan file quotas, and re-enable
  failed files when a user upgrades.
- **Cleanup:** deleting a file in the app also deletes it from UploadThing's storage.
- **Billing:** added cancellation handling to the Stripe webhook (it can't run yet; see
  the known issues).
- **Upgrades:** moved to newer OpenAI, LangChain and Stripe packages (Stripe's SDK from
  v13 to v17) and set up deployment on Vercel.
- **Design:** my own landing page and color scheme, prototyped in Figma first.
- **Keeping it running (Nov 2026):** upgraded the Pinecone client to v2 after Pinecone
  moved its free indexes to serverless, and switched the chat model to GPT-6 Luna after
  OpenAI retired GPT-3.5 Turbo.

---

## What building it taught me

- **Free tiers change under you.** PlanetScale dropped its free plan partway through, so
  the data moved to PostgreSQL. Pinecone's free index had no namespaces, so each file's
  vectors are kept apart with metadata instead.
- **The services you build on get retired.** In November 2026 the live demo broke twice
  in one afternoon. Pinecone had moved the index to its serverless platform, so the 2023
  client was calling an address that no longer existed. Once that was fixed, every answer
  failed because OpenAI had retired GPT-3.5 Turbo, and the newer models also reject the
  `temperature: 0` setting. Both times the server logs named the failing call, so each
  fix was small: a client upgrade, then a one-line model change.
- **Tutorial code is a starting point, not a spec.** Going back through the code after
  the course turned up two bugs it shipped with: renewal and cancellation webhooks that
  never run, and chat history that sends the oldest messages instead of the newest.
- **A limit has to hold everywhere.** Files over the page limit are marked `FAILED`, but
  they're still embedded, and the chat never checks a file's status. A rule enforced in
  one place isn't enforced.

---

## Known issues (and which step fixes them)

- **Renewals and cancellations never reach the database** (from the course). The Stripe
  webhook returns early unless the event's metadata has a `userId`, and only checkout
  sessions carry one, so invoice and subscription events are dropped. *Step 1.*
- **Chat history is backwards** (from the course). The query takes the 6 *oldest*
  messages (`orderBy: asc`, `take: 6`), so long chats lose recent context. *Step 1.*
- **Deleting a file leaves its vectors in Pinecone.** *Step 1.*
- **Over-limit files are still embedded**, and `/api/message` doesn't check that a file
  finished processing. *Step 1.*
- **Packages from 2023** (Next.js 13.5, LangChain 0.0.x, Kinde 1.x) are behind on
  security fixes. The Pinecone client is held at v2, the newest that works with this
  LangChain version. *Step 1.*
- **Whole pages, no citations.** Dense pages blur answers, and you can't see which page
  an answer came from. *Step 2.*
- **No retrieval tests**, so a change to retrieval can't be measured. *Step 3.*
- **Indexing runs inside the upload callback**, so a large file can run into the
  serverless time limit. *Later.*
- **Prompt injection.** A PDF can include text written to steer the model. Dekge only
  displays answers and takes no actions, so the risk is a misleading answer. *Later.*

## Roadmap

| Step | What | Skills |
|---|---|---|
| 1 | Fix the bugs above, delete vectors with their file, upgrade packages | Stripe webhooks, Prisma, Pinecone |
| 2 | Overlapping chunks with page numbers in their metadata, and page citations in answers | RAG, text splitting |
| 3 | A 30-question retrieval test: top-4 hit rate and mean reciprocal rank, pages vs. chunks | Evaluation, information retrieval |
| 4 | `.txt` and `.docx` uploads | LangChain document loaders |
| 5 | Compare GPT's answers with an open-weight model running locally (Ollama) | Local LLMs |

---

## Repository layout

```
src/app/api/uploadthing/core.ts       upload callback: load the PDF, count pages, embed, index
src/app/api/message/route.ts          answer a question: auth, retrieve 4 pages, call GPT, stream
src/app/api/webhooks/stripe/route.ts  Stripe events -> the user's plan
src/trpc/index.ts                     tRPC procedures: files, messages, upload status, checkout
src/components/chat/                  chat UI: instant updates, streaming, infinite scroll
src/components/PdfRenderer.tsx        PDF viewer (react-pdf)
src/config/stripe.ts                  plans: file quotas, pages per PDF, price IDs
src/lib/                              OpenAI, Pinecone, Stripe and UploadThing clients
src/middleware.ts                     sign-in required for /dashboard and /auth-callback
prisma/schema.prisma                  User, File and Message tables, and the upload status
```

---

## Running it locally

You need Node.js 20, [pnpm](https://pnpm.io), and free accounts with a PostgreSQL host
([Neon](https://neon.tech) works), [Kinde](https://kinde.com),
[UploadThing](https://uploadthing.com), [OpenAI](https://platform.openai.com),
[Pinecone](https://www.pinecone.io) and [Stripe](https://stripe.com) (test mode).
Commands are for PowerShell.

```powershell
pnpm install                 # also runs prisma generate
copy .env.example .env       # then fill in your keys; .env is git-ignored
pnpm prisma db push          # create the tables
pnpm dev                     # then open http://localhost:3000
```

- **Pinecone:** create a serverless index named `dekge` with 1,536 dimensions and the
  cosine metric. The client finds it from your API key alone.
- **Kinde:** add `http://localhost:3000/api/auth/kinde_callback` as an allowed callback
  URL and `http://localhost:3000` as an allowed logout redirect.
- **Stripe webhooks:** install the [Stripe CLI](https://docs.stripe.com/stripe-cli), run
  `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, and put the signing
  secret it prints in `STRIPE_WEBHOOK_SECRET`.

---

## Security notes

- `.env` is git-ignored; only `.env.example` (names, no values) is committed.
- Every request for a file or its messages checks that the signed-in user owns it.
- Stripe webhooks are verified with the signing secret before they're read.
- Retrieval is filtered by file ID, so a question can only pull pages from that file.
- Before going public, the full commit history was scanned for keys: none found, and
  no `.env` file was ever committed. Every commit uses GitHub's no-reply email.

---

Started from Josh tried coding's course; the changes since then are mine. Shared so
people can review my work.
