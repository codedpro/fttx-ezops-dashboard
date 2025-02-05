export const FTTX_PROGRESS_DATA = {
    Excavation: {
      TotalDistance: "4,892.6 Km",
      Irancell: {
        Plan: 3418.7,
        Actual: 2764.5,
        Weekly: 69.7,
      },
      FCP: {
        Plan: 3172.4,
        Actual: 2128.1,
        Weekly: 0,
      },
    },
    FiberShoot: {
      TotalDistance: "3,995.6 Km",
      Irancell: {
        Plan: 4160.0,
        Actual: 1698.9,
        Weekly: 47.4,
      },
      FCP: {
        Plan: 4913.3,
        Actual: 2296.7,
        Weekly: 35.5,
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
  