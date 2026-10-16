import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Item = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type NewItem = Pick<Item, "name"> & Partial<Pick<Item, "description">>;
type ItemUpdates = Partial<Pick<Item, "name" | "description">>;

// Works from both src/ during development and dist/ after building.
const DATA_DIRECTORY = path.resolve(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIRECTORY, "db.json");

async function readItems(): Promise<Item[]> {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    const contents = await readFile(DATA_FILE, "utf8");
    return JSON.parse(contents) as Item[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    await writeFile(DATA_FILE, "[]\n", "utf8");
    return [];
  }
}

async function writeItems(items: Item[]): Promise<void> {
  await mkdir(DATA_DIRECTORY, { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

export async function getItems(search?: string): Promise<Item[]> {
  const items = await readItems();

  if (!search) return items;

  const term = search.toLowerCase();
  return items.filter((item) =>
    `${item.name} ${item.description}`.toLowerCase().includes(term)
  );
}

export async function getItem(id: string): Promise<Item | undefined> {
  const items = await readItems();
  return items.find((item) => item.id === id);
}

export async function createItem(input: NewItem): Promise<Item> {
  const items = await readItems();
  const now = new Date().toISOString();
  const item: Item = {
    id: randomUUID(),
    name: input.name,
    description: input.description ?? "",
    createdAt: now,
    updatedAt: now
  };

  items.push(item);
  await writeItems(items);
  return item;
}

export async function updateItem(
  id: string,
  updates: ItemUpdates
): Promise<Item | undefined> {
  const items = await readItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return undefined;

  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await writeItems(items);
  return items[index];
}

export async function deleteItem(id: string): Promise<boolean> {
  const items = await readItems();
  const remainingItems = items.filter((item) => item.id !== id);
  if (remainingItems.length === items.length) return false;

  await writeItems(remainingItems);
  return true;
}
