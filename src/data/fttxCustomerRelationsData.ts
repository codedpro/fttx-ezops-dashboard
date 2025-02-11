export const CUSTOMER_RELATIONS_DATA = {
    WeeklyProgress: {
      BO_BackLog_Tickets: {
        Week1: 1376,
        Week2: 1346,
        Week3: 1301,
        Week4: 932,
      },
      BackLog_Tickets_195: {
        Week1: 76,
        Week2: 80,
        Week3: 80,
        Week4: 89,
      },
    },
    BackLog_Live: 939,
    SLA_Status: {
      OUTSLA: { Value: 766, Percentage: 82 },
      INSLA: { Value: 173, Percentage: 18 },
    },
    Distribution: {
      Sales_and_Distribution: { Value: 527, Percentage: 75 },
      Capital_Program_Group: { Value: 108, Percentage: 15 },
      Network_Group: { Value: 64, Percentage: 9 },
      IT: { Value: 2, Percentage: 2 },
    },
    Pending_195_TTs_Live: {
      Total: 89,
      Breakdown: {
        MTN_SND_FTTH: { Value: 60, Percentage: 67 },
        MTN_CPG_Fiber: { Value: 13, Percentage: 15 },
        CRA: { Value: 11, Percentage: 12 },
        MTN_OPS_FTTH: { Value: 2, Percentage: 2 },
        MTN_TX_Infrastructure: { Value: 2, Percentage: 2 },
        Payam_Atlas_MS_FO_FTTH: { Value: 1, Percentage: 1 },
      },
    },
  } as const;
  