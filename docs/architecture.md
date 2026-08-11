# Architecture

## Principles

The project is a dashboard platform, not a collection of hardcoded cards. Dashboard state drives the UI, widget manifests drive the library and settings forms, and provider adapters isolate external APIs.

```text
AppState -> Dashboard engine -> Widget registry -> Widget component
                                    |
                                    v
                              Provider registry -> external service
```

## Web application

`AppState` is versioned and validated by the shared Zod schema. Components access it through a Zustand store, while persistence is delegated to `DashboardStorageAdapter`. V1 provides `LocalStorageAdapter`; a future database adapter should implement the same boundary rather than introducing storage calls into UI components.

Each dashboard owns its widget instances, desktop layout, and display settings. React Grid Layout edits the canonical desktop layout. Small screens derive a deterministic single-column order and intentionally disable layout editing.

Every `WidgetDefinition` contains metadata, dimensions, defaults, a settings schema, declarative fields, and the component. The registry is the only engine-level registration point. Widget components receive validated settings and platform callbacks. Data widgets request normalized objects from provider interfaces and use TanStack Query for caching and refresh behavior.

## API application

The optional Hono API enhances static mode. V1 exposes `/api/health` and `/api/rss` only. The RSS route is purpose-specific and is not an arbitrary request relay.

Before each request and redirect, the RSS fetcher validates the URL, resolves every address, rejects any non-public range, and pins the chosen public address for the connection. It also limits ports, redirect depth, response types, bytes, time, cache duration, and client request frequency. XML entity processing is disabled and summaries are reduced to plain text.

## Compatibility

Persistence and exports carry independent schema-version fields. Unknown versions fail closed. Future releases add explicit migrations in the storage boundary. Widget manifests also carry versions so widget-specific migrations can be introduced without coupling them to grid code.
