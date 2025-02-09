export const FTTX_OPERATION_PROGRESS_DATA = {
  FAT: {
    TotalInstallation: 19529,
    TotalVisitRequest: 2667,
    TotalApproved: 2362,
    Weekly: {
      VisitRequest: 24,
      VisitedByOPS: 0,
      Approved: 0,
      Rejected: 0,
      Ongoing: 24
    }
  },
  Complex: {
    TotalVisitRequest: 40,
    TotalVisited: 22,
    TotalApproved: 9,
    TotalRejected: 7,
    Weekly: {
      Request: 0,
      Visited: 5,
      Approved: 0,
      Delivered: 5,
      Rejected: 0
    }
  },
  Performance: {
    WeeklyProgress: {
      W1_Dey: 76,
      W2_Dey: 81,
      W3_Dey: 28,
      W4_Dey: 9,
      W1_Bahman: 22,
      W2_Bahman: 0
    }
  },
  OLT: {
    Plan: 449,
    TotalInstallation: 434,
    TotalVisitByOPS: 362,
    TotalApproved: 279,
    Weekly: {
      VisitRequest: 2,
      VisitedByOPS: 2,
      Approved: 1,
      Rejected: 1,
      Ongoing: 0
    }
  },
  JCC: {
    TotalRequest: 698.65,
    TotalApproved: 350.55,
    TotalRejected: 307.5,
    Weekly: {
      Request: 20.0,
      Visited: 7.1,
      Approved: 0.6,
      Rejected: 46.4,
      Ongoing: 45.6
    }
  },
  WeeklyProgress: {
    W1_Dey: 0,
    W2_Dey: 2,
    W3_Dey: 7,
    W4_Dey: 9,
    W1_Bahman: 7,
    W2_Bahman: 1
  }
} as const;
