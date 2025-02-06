export const FTTX_PROGRESS_DATA = {
  Excavation: {
    TotalDistance: "4,892.6 Km",
    Irancell: {
      Plan: 3418.7,
      Actual: 2764.5,
      Weekly: 69.7,
      WeeklyData: {
        "W1.Dey": 56.75,
        "W2.Dey": 50.22,
        "W3.Dey": 58.28,
        "W4.Dey": 62.78,
        "W1.Bahman": 68.60,
        "W2.Bahman": 69.70
      }
    },
    FCP: {
      Plan: 3172.4,
      Actual: 2128.1,
      Weekly: 0,
      WeeklyData: {
        "W1.Dey": 1.00,
        "W2.Dey": 1.00,
        "W3.Dey": 31.57,
        "W4.Dey": 7.72,
        "W1.Bahman": 15.90,
        "W2.Bahman": 0.00
      }
    },
  },
  FiberShoot: {
    TotalDistance: "3,995.6 Km",
    Irancell: {
      Plan: 4160.0,
      Actual: 1698.9,
      Weekly: 47.4,
      WeeklyData: {
        "W1.Dey": 111.27,
        "W2.Dey": 76.40,
        "W3.Dey": 87.94,
        "W4.Dey": 56.27,
        "W1.Bahman": 68.48,
        "W2.Bahman": 47.40
      }
    },
    FCP: {
      Plan: 4913.3,
      Actual: 2296.7,
      Weekly: 35.5,
      WeeklyData: {
        "W1.Dey": 28.04,
        "W2.Dey": 20.96,
        "W3.Dey": 93.63,
        "W4.Dey": 64.52,
        "W1.Bahman": 35.00,
        "W2.Bahman": 35.50
      }
    },
  },
  FATInstallation: {
    TotalCount: 41301,
    Irancell: {
      Plan: 45823,
      Actual: 19529,
      Weekly: 657,
    },
    FCP: {
      Plan: 39521,
      Actual: 21772,
      Weekly: 10,
    },
  },
  Progress: {
    Excavation: {
      Inhouse: "88%",
      FTK: "75%",
      ServCo: "64%",
      FCP: "67%",
    },
    FiberShoot: {
      Inhouse: "57%",
      FTK: "19%",
      ServCo: "27%",
      FCP: "47%",
    },
    FATInstallation: {
      Inhouse: "43%",
      FTK: "45%",
      ServCo: "30%",
      FCP: "55%",
    },
  },
  Deployment: {
    Ongoing: {
      Cities: 147,
      Households: 3471323,
      Percentage: "68.5%",
    },
    InHouse: {
      Cities: 19,
      Households: 1310898,
      Percentage: "37.8%",
    },
    FTK: {
      Cities: 53,
      Households: 743812,
      Percentage: "21.4%",
    },
    ServCo: {
      Cities: 31,
      AdditionalCities: 3,
      Households: 206242,
      Percentage: "5.9%",
    },
    FCP: {
      Cities: 44,
      Households: 1210371,
      Percentage: "34.9%",
    },
  },
} as const;
