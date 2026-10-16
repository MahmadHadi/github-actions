import express, { Request, Response } from "express";
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
  updateItem
} from "./store";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "API Testing Backend is running",
    docs: "See README.md for available endpoints"
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// List items. Optional example: GET /api/items?search=express
app.get("/api/items", async (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const items = await getItems(search);
  res.json({ count: items.length, data: items });
});

app.get("/api/items/:id", async (req: Request, res: Response) => {
  const item = await getItem(req.params.id.toString());
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json({ data: item });
});

app.post("/api/items", async (req: Request, res: Response) => {
  const { name, description } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "'name' is required and must be a non-empty string" });
    return;
  }

  if (description !== undefined && typeof description !== "string") {
    res.status(400).json({ error: "'description' must be a string" });
    return;
  }

  const item = await createItem({ name: name.trim(), description });
  res.status(201).json({ message: "Item created", data: item });
});

// PUT replaces the editable fields; name is required.
app.put("/api/items/:id", async (req: Request, res: Response) => {
  const { name, description } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "'name' is required and must be a non-empty string" });
    return;
  }

  if (description !== undefined && typeof description !== "string") {
    res.status(400).json({ error: "'description' must be a string" });
    return;
  }

  const item = await updateItem(req.params.id.toString(), {
    name: name.trim(),
    description: description ?? ""
  });

  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json({ message: "Item replaced", data: item });
});

// PATCH updates only the fields supplied in the JSON body.
app.patch("/api/items/:id", async (req: Request, res: Response) => {
  const { name, description } = req.body ?? {};
  const updates: { name?: string; description?: string } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "'name' must be a non-empty string" });
      return;
    }
    updates.name = name.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      res.status(400).json({ error: "'description' must be a string" });
      return;
    }
    updates.description = description;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Provide at least one field: name or description" });
    return;
  }

  const item = await updateItem(req.params.id.toString(), updates);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json({ message: "Item updated", data: item });
});

app.delete("/api/items/:id", async (req: Request, res: Response) => {
  const deleted = await deleteItem(req.params.id.toString());
  if (!deleted) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json({ message: "Item deleted", id: req.params.id.toString() });
});

// Reflects query parameters, request headers, and JSON body for inspection.
app.all("/api/echo", (req: Request, res: Response) => {
  res.json({
    method: req.method,
    query: req.query,
    headers: req.headers,
    body: req.body ?? null
  });
});

// Try request-header testing. Header required: x-api-key: test-secret
app.get("/api/protected", (req: Request, res: Response) => {
  if (req.header("x-api-key") !== "test-secret") {
    res.status(401).json({ error: "Unauthorized", hint: "Send x-api-key: test-secret" });
    return;
  }

  res.json({ message: "You supplied the correct API key" });
});

// Try timeout testing: GET /api/delay?ms=1500 (maximum delay: 10000 ms).
app.get("/api/delay", async (req: Request, res: Response) => {
  const requestedDelay = Number(req.query.ms ?? 1000);
  const ms = Number.isFinite(requestedDelay)
    ? Math.min(10000, Math.max(0, requestedDelay))
    : 1000;

  await new Promise((resolve) => setTimeout(resolve, ms));
  res.json({ message: "Delay complete", delayedMs: ms });
});

// Deliberately return an HTTP error. Example: GET /api/error?status=418
app.get("/api/error", (req: Request, res: Response) => {
  const requestedStatus = Number(req.query.status ?? 500);
  const status = Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599
    ? requestedStatus
    : 500;

  res.status(status).json({ error: "This error was requested for API testing", status });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Return readable JSON for invalid JSON bodies and other unhandled errors.
app.use((error: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`API Testing Backend listening at http://localhost:${PORT}`);
});
