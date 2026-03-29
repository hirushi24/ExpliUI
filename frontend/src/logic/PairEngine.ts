export function createPair(index: number) {
  // Small helper used by earlier upload flow experiments to create an empty pair record.
  return {
    id: index,
    A: null,
    B: null,
    metaA: null,
    metaB: null
  };
}

export function pairStatus(pair: any) {
  // Color-style status output is kept for simple readiness checks in older UI code.
  if (!pair.A || !pair.B) return "RED";

  if (!pair.metaA || !pair.metaB) return "YELLOW";

  return "GREEN";
}
