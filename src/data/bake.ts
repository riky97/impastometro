/** Baking parameters per oven type. All values are tunable after real bakes. */
// ASSUMPTION: every number below is reconstructed from public knowledge.
export const BAKE = {
  electric: {
    topC: 450,
    topCMax: 500,
    bottomC: 300,
    lowChamberSeconds: 90,
    standardSeconds: [60, 90],
  },
  gas: { stoneC: [400, 450], seconds: [60, 90] },
  wood: { vaultC: [430, 485], seconds: [60, 90] },
  home: { preheatMin: [45, 60], minutes: [4, 7] },
} as const;
