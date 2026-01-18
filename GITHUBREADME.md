Skip to content
vercel-labs
json-render
Repository navigation
Code
Issues
7
 (7)
Pull requests
Actions
Projects
Security
Insights
Owner avatar
json-render
Public
vercel-labs/json-render
Go to file
t
Name		
ctate
ctate
make model configurable (#17)
4375678
 · 
14 hours ago
.github/workflows
add unit tests
3 days ago
.husky
format
3 days ago
apps/web
make model configurable (#17)
14 hours ago
examples/dashboard
make model configurable (#17)
14 hours ago
packages
codegen (#15)
15 hours ago
.gitignore
init
3 days ago
.npmrc
init
3 days ago
AGENTS.md
type-check after each turn
3 days ago
LICENSE
fix license
3 days ago
README.md
better copy
3 days ago
package.json
add unit tests
3 days ago
pnpm-lock.yaml
codegen (#15)
15 hours ago
pnpm-workspace.yaml
init
3 days ago
turbo.json
make model configurable (#17)
14 hours ago
vitest.config.ts
add unit tests
3 days ago
Repository files navigation
README
Apache-2.0 license
json-render
Predictable. Guardrailed. Fast.

Let end users generate dashboards, widgets, apps, and data visualizations from prompts — safely constrained to components you define.

npm install @json-render/core @json-render/react
Why json-render?
When users prompt for UI, you need guarantees. json-render gives AI a constrained vocabulary so output is always predictable:

Guardrailed — AI can only use components in your catalog
Predictable — JSON output matches your schema, every time
Fast — Stream and render progressively as the model responds
Quick Start
1. Define Your Catalog (what AI can use)
import { createCatalog } from '@json-render/core';
import { z } from 'zod';

const catalog = createCatalog({
  components: {
    Card: {
      props: z.object({ title: z.string() }),
      hasChildren: true,
    },
    Metric: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),      // Binds to your data
        format: z.enum(['currency', 'percent', 'number']),
      }),
    },
    Button: {
      props: z.object({
        label: z.string(),
        action: ActionSchema,        // AI declares intent, you handle it
      }),
    },
  },
  actions: {
    export_report: { description: 'Export dashboard to PDF' },
    refresh_data: { description: 'Refresh all metrics' },
  },
});
2. Register Your Components (how they render)
const registry = {
  Card: ({ element, children }) => (
    <div className="card">
      <h3>{element.props.title}</h3>
      {children}
    </div>
  ),
  Metric: ({ element }) => {
    const value = useDataValue(element.props.valuePath);
    return <div className="metric">{format(value)}</div>;
  },
  Button: ({ element, onAction }) => (
    <button onClick={() => onAction(element.props.action)}>
      {element.props.label}
    </button>
  ),
};
3. Let AI Generate
import { DataProvider, ActionProvider, Renderer, useUIStream } from '@json-render/react';

function Dashboard() {
  const { tree, send } = useUIStream({ api: '/api/generate' });

  return (
    <DataProvider initialData={{ revenue: 125000, growth: 0.15 }}>
      <ActionProvider actions={{
        export_report: () => downloadPDF(),
        refresh_data: () => refetch(),
      }}>
        <input
          placeholder="Create a revenue dashboard..."
          onKeyDown={(e) => e.key === 'Enter' && send(e.target.value)}
        />
        <Renderer tree={tree} components={registry} />
      </ActionProvider>
    </DataProvider>
  );
}
That's it. AI generates JSON, you render it safely.

Features
Conditional Visibility
Show/hide components based on data, auth, or complex logic:

{
  "type": "Alert",
  "props": { "message": "Error occurred" },
  "visible": {
    "and": [
      { "path": "/form/hasError" },
      { "not": { "path": "/form/errorDismissed" } }
    ]
  }
}
{
  "type": "AdminPanel",
  "visible": { "auth": "signedIn" }
}
Rich Actions
Actions with confirmation dialogs and callbacks:

{
  "type": "Button",
  "props": {
    "label": "Refund Payment",
    "action": {
      "name": "refund",
      "params": {
        "paymentId": { "path": "/selected/id" },
        "amount": { "path": "/refund/amount" }
      },
      "confirm": {
        "title": "Confirm Refund",
        "message": "Refund ${/refund/amount} to customer?",
        "variant": "danger"
      },
      "onSuccess": { "set": { "/ui/success": true } },
      "onError": { "set": { "/ui/error": "$error.message" } }
    }
  }
}
Built-in Validation
{
  "type": "TextField",
  "props": {
    "label": "Email",
    "valuePath": "/form/email",
    "checks": [
      { "fn": "required", "message": "Email is required" },
      { "fn": "email", "message": "Invalid email" }
    ],
    "validateOn": "blur"
  }
}
Packages
Package	Description
@json-render/core	Types, schemas, visibility, actions, validation
@json-render/react	React renderer, providers, hooks
Demo
git clone https://github.com/vercel-labs/json-render
cd json-render
pnpm install
pnpm dev
http://localhost:3000 — Docs & Playground
http://localhost:3001 — Example Dashboard
Project Structure
json-render/
├── packages/
│   ├── core/        → @json-render/core
│   └── react/       → @json-render/react
├── apps/
│   └── web/         → Docs & Playground site
└── examples/
    └── dashboard/   → Example dashboard app
How It Works
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ User Prompt │────▶│  AI + Catalog│────▶│  JSON Tree  │
│ "dashboard" │     │ (guardrailed)│     │(predictable)│
└─────────────┘     └──────────────┘     └─────────────┘
                                               │
                    ┌──────────────┐            │
                    │  Your React  │◀───────────┘
                    │  Components  │ (streamed)
                    └──────────────┘
Define the guardrails — what components, actions, and data bindings AI can use
Users prompt — end users describe what they want in natural language
AI generates JSON — output is always predictable, constrained to your catalog
Render fast — stream and render progressively as the model responds
License
Apache-2.0

About
AI → JSON → UI

json-render.dev
Resources
 Readme
License
 Apache-2.0 license
 Activity
 Custom properties
Stars
 5.8k stars
Watchers
 16 watching
Forks
 263 forks
Report repository
Releases
No releases published
Packages
No packages published
Contributors
5
@ctate
@vercel[bot]
@ubmit
@shivenaggarwal
@YogeshK34
Deployments
58
 Production 14 hours ago
 Preview 14 hours ago
+ 56 deployments
Languages
TypeScript
98.1%
 
CSS
1.1%
 
JavaScript
0.8%
Footer
© 2026 GitHub, Inc.
Footer navigation
Terms
Privacy
Security
Status
Community
Docs
Contact
Manage cookies
Do not share my personal information
 
