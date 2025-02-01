import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import IranMap from "@/components/Maps/Iran";

interface DashboardProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const Dashboard = async ({ searchParams }: DashboardProps) => {
  const defaultRegion =
    typeof searchParams.region === "string" ? searchParams.region : null;
  const defaultCity =
    typeof searchParams.city === "string" ? searchParams.city : null;

  return (
    <DefaultLayout>
      <IranMap initialRegion={defaultRegion} initialCity={defaultCity} />
    </DefaultLayout>
  );
};

export default Dashboard;
