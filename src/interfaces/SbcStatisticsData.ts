export interface SbcStatisticsData {
  sbcName: string,
  challengeIndex?: number,
  challengeId?: number,
  solvedCount?: number,
  isTradeable: boolean,
  repeatCount: number,
  refreshInterval: number,
  expiresAt: number,
  startedAt: number,

  futbinPrice?: number,
  avgTradeCount?: number,
  avgTradeSum?: number,
  avgUntradeCount?: number,
  avgUntradeSum?: number,

  prio?: number,
  priceLimit?: number,
  solutionsLimit?: number,
  generateVirtuals?: boolean

  packName: string,
  packsOpened?: number,
  avgRewardSum?: number,
}