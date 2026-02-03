export function createPair(index: number) {

  return {
    id: index,
    A: null,
    B: null,
    metaA: null,
    metaB: null
  };
}

export function pairStatus(pair: any) {

  if (!pair.A || !pair.B) return "RED";

  if (!pair.metaA || !pair.metaB) return "YELLOW";

  return "GREEN";
}
