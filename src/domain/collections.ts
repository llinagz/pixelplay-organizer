export const reorderIds = <T extends { id: string }>(
  collection: T[],
  orderedIds: string[],
): T[] => {
  const byId = new Map(collection.map((item) => [item.id, item]));
  const ordered: T[] = [];

  for (const id of orderedIds) {
    const item = byId.get(id);
    if (item) ordered.push(item);
  }

  for (const item of collection) {
    if (!orderedIds.includes(item.id)) ordered.push(item);
  }

  return ordered;
};

