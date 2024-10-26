import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import IranMap from "@/components/Maps/Iran";

const Dashboard = async () => {
  return (
    <DefaultLayout>
      <IranMap />
    </DefaultLayout>
  );
};

export default Dashboard;
