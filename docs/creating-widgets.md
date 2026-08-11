# Creating widgets

Create one folder under `apps/web/src/widgets`, export one manifest, then add that export to `widgets/registry.ts`.

```text
widgets/my-widget/
  index.tsx
```

The manifest must provide a stable `type`, a positive `version`, library metadata, default/minimum dimensions, valid defaults, declarative settings fields, a Zod schema, and a component. Its `defaultSettings` must pass `settingsSchema`; the registry test enforces this for every built-in widget.

```tsx
const settingsSchema = z.object({ label: z.string().min(1) })

export const myWidget: WidgetDefinition<z.infer<typeof settingsSchema>> = {
  type: 'my-widget',
  version: 1,
  name: 'My Widget',
  description: 'A concise library description.',
  category: 'developer',
  icon: 'chart',
  component: MyWidget,
  defaultSize: { width: 4, height: 3 },
  minSize: { width: 2, height: 2 },
  defaultSettings: { label: 'Example' },
  settingsFields: [{ key: 'label', type: 'text', label: 'Label' }],
  settingsSchema,
}
```

Components receive `instanceId`, validated `settings`, View/Edit `mode`, a `demo` flag, and `updateSettings`. Keep instance-owned local data such as tasks in settings until a dedicated domain-storage interface exists.

For external data, define or reuse a normalized provider contract. The widget may select a provider from the provider registry but must not parse a vendor response itself. Use TanStack Query with every data-affecting setting in the query key, a sensible minimum refresh interval, disabled background polling, and independent loading/error/empty/success UI.

Add tests for manifest defaults, settings validation, data normalization, and all widget states. Do not add API keys, personal defaults, or direct `localStorage` access.
