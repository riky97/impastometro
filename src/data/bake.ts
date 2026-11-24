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
  // Products other than pizza always bake in the home oven.
  focaccia: { tempC: [230, 240], minutes: [15, 20] },
  recco: { tempC: [270, 320], homeTempC: 270, minutes: [4, 8], homeMinutes: [7, 8] },
  pane: { steamTempC: [230, 250], steamMin: [15, 20], finishTempC: [200, 220], totalMin: [35, 40] },
} as const;
