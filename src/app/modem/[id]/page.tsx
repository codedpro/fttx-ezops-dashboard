import { cookies } from "next/headers";
import TableThree from "@/components/Tables/TableThree";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FaMap, FaMapMarkerAlt, FaWifi } from "react-icons/fa";
import { fetchModemDetails } from "@/lib/actions";
import {
  ballancesColumns,
  connectionHistoryColumns,
  internetOnlinesColumns,
} from "@/data/modemColumns";
import RefreshButton from "@/components/Buttons/RefreshButton";
import Link from "next/link";
import DataGrid from "@/components/DataGrid";

const ModemPage = async ({ params }: { params: { id: string } }) => {
  const cookieStore = cookies();
  const token = cookieStore.get("AccessToken")?.value;

  if (!token) {
    throw new Error("Unauthorized: No Access Token provided");
  }

  const modemId = params.id;
  const modemDetails = await fetchModemDetails(modemId, token);

  if (
    !modemDetails ||
    !modemDetails.IBSNG_Main ||
    modemDetails.IBSNG_Main.length === 0
  ) {
    return (
      <DefaultLayout>
        <div className="container mx-auto p-4 space-y-8">
          <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-4">Modem Not Found</h1>
            <p className="text-lg">
              Sorry, we couldn't find any data for the modem with ID:{" "}
              <span className="font-semibold">{modemId}</span>.
            </p>
            <p className="mt-4">
              Please check the modem ID or try again later.
            </p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const getIconColor = (status: string) => {
    if (status === "Online" || status === "Not Expired")
      return "text-green-500 bg-green-500";
    if (status === "Offline" || !status) return "text-red-500 bg-red-500";
    if (status === "Expired") return "text-yellow-500 bg-yellow-500";
    return "text-gray-500  bg-gray-500";
  };

  const onlineStatus = modemDetails?.IBSNG_Main[0].Online_Status || "Offline";
  const lastUpdate = modemDetails?.IBSNG_Main[0].DB_Last_Update || "Unknown";

  const modemdetailsData = [
    { label: "FTTH ID", value: modemDetails?.IBSNG_Main[0]?.FTTH_ID },
    { label: "User ID", value: modemDetails?.IBSNG_Main[0]?.User_ID },
    { label: "Customer", value: modemDetails?.IBSNG_Main[0]?.Customer },
    { label: "Group", value: modemDetails?.IBSNG_Main[0]?.Group },
    {
      label: "Last Successful Login",
      value: modemDetails?.IBSNG_Main[0]?.Last_Successful_Login,
    },
    {
      label: "Expiration Status",
      value: modemDetails?.IBSNG_Main[0]?.Expiration_Status,
      status: true,
    },
    {
      label: "Parent User ID",
      value: modemDetails?.IBSNG_Main[0]?.Parent_User_Id,
    },
    {
      label: "Creation Date",
      value: modemDetails?.IBSNG_Main[0]?.Creation_Date,
    },
    { label: "Owner", value: modemDetails?.IBSNG_Main[0]?.Owner_IS },
    {
      label: "is User Locked",
      value: modemDetails?.IBSNG_Main[0]?.User_is_Locked,
    },
    { label: "Charge", value: modemDetails?.IBSNG_Main[0]?.Charge },
    {
      label: "Real First Login",
      value: modemDetails?.IBSNG_Main[0]?.Real_First_Login,
    },
  ];

  const acsdata = [
    { label: "ACS ID", value: modemDetails?.ACS_Main[0]?.ACS_ID },
    {
      label: "Model Name",
      value: modemDetails?.ACS_Main[0]?.modelName,
    },
    {
      label: "Serial Number",
      value: modemDetails?.ACS_Main[0]?.serialNumber,
    },
    {
      label: "RX Power",
      value: modemDetails?.ACS_Main[0]?.RXPower,
      status: true,
    },
    { label: "TX Power", value: modemDetails?.ACS_Main[0]?.TXPower },
    {
      label: "Manufacturer",
      value: modemDetails?.ACS_Main[0]?.manufacturer,
    },

    { label: "PPP VLAN", value: modemDetails?.ACS_Main[0]?.pppVlan },
    { label: "MAC Address", value: modemDetails?.ACS_Main[0]?.mac },
    {
      label: "Activation Date",
      value: modemDetails?.ACS_Main[0]?.activationDate,
    },
    {
      label: "Blacklisted",
      value: modemDetails?.ACS_Main[0]?.blacklisted,
      status: true,
    },
    {
      label: "Last Session Time",
      value: modemDetails?.ACS_Main[0]?.lastSessionTime,
    },
    {
      label: "Last Empty Session Time",
      value: modemDetails?.ACS_Main[0]?.lastEmptySessionTime,
    },
    {
      label: "Last Bootstrap Time",
      value: modemDetails?.ACS_Main[0]?.lastBootstrapTime,
    },
    {
      label: "Last Reboot Time",
      value: modemDetails?.ACS_Main[0]?.lastRebootTime,
    },
    {
      label: "IP Address",
      value: modemDetails?.ACS_Main[0]?.ipAddress,
    },
    {
      label: "Hardware Version",
      value: modemDetails?.ACS_Main[0]?.hardwareVersion,
    },
    {
      label: "Software Version",
      value: modemDetails?.ACS_Main[0]?.softwareVersion,
    },
    {
      label: "Product Class",
      value: modemDetails?.ACS_Main[0]?.productClass,
    },

    {
      label: "Transceiver Temperature",
      value: modemDetails?.ACS_Main[0]?.TransceiverTemperature,
    },

    { label: "Vgroup", value: modemDetails?.ACS_Main[0]?.Vgroup },
  ];
  return (
    <DefaultLayout>
      <div className="container mx-auto p-4 space-y-8">
        <div className="space-y-4">
          {" "}
          <div className="flex items-center justify-between ">
            <div className="flex items-center justify-center space-x-2">
              <FaWifi
                className={`text-2xl ${getIconColor(onlineStatus)} bg-transparent`}
              />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{onlineStatus}</span>
              </p>
              <Link href={`/map?search=${modemId}`}>
                <FaMap className="text-2xl text-gray-700 dark:text-gray-300 cursor-pointer" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Last Update: {lastUpdate}
              </p>
              <RefreshButton modemId={modemId} token={token} />
            </div>
          </div>{" "}
          <DataGrid
            title="Modem Details (IBSNG)"
            data={modemdetailsData}
            className="grid grid-cols-2 sm:grid-cols-3 gap-6"
            emoji="📡"
          />
          <DataGrid
            title="ACS"
            data={acsdata}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
            emoji="⚙️"
          />
        </div>

        <div>
          <TableThree
            data={modemDetails.IBSNG_Internet_Onlines}
            columns={internetOnlinesColumns}
            header="Internet Online Sessions"
            emoji="🌐"
            initialLimit={5}
          />
        </div>

        <div>
          <TableThree
            data={modemDetails.IBSNG_Connection_History}
            columns={connectionHistoryColumns}
            header="Connection History"
            emoji="🔗"
            initialLimit={5}
          />
        </div>

        <div>
          <TableThree
            data={modemDetails.IBSNG_Ballances}
            columns={ballancesColumns}
            header="Balances"
            emoji="💰"
            initialLimit={5}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ModemPage;
