export const FTTX_CRA_PROGRESS_DATA = {
  Stats: {
    WeeklyVisited: 18,
    WeeklyApprovedCRARegion: 25,
    WeeklyApprovedCRA: 51,
  },
  ChartData: {
    TotalIncentiveCoverage: 7401474,
    ApprovedIncentiveCoverage: 2806747,
  },
  WeeklyProgress: {
    W1_Dey: { Visited: 47, Approved: 26 },
    W2_Dey: { Visited: 54, Approved: 0 },
    W3_Dey: { Visited: 29, Approved: 29 },
    W4_Dey: { Visited: 10, Approved: 0 },
    W1_Bahman: { Visited: 41, Approved: 23 },
    W2_Bahman: { Visited: 25, Approved: 18 },
  },
  BarChartData: {
    ApprovedByCRA: {
      Value: 381153,
      POPs: 505,
    },
    ApprovedByCRARegion: {
      Value: 639019,
      POPs: 666,
    },
    VisitedByCRARegion: {
      Value: 745827,
      POPs: 801,
    },
    IranfttxCoverage: {
      Value: 1210794,
      POPs: 1583,
    },
  },
} as const;
