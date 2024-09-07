import { cookies } from "next/headers";
import TableThree from "@/components/Tables/TableThree";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { FaWifi } from "react-icons/fa";
import { fetchModemDetails } from "@/lib/actions";
import {
  ballancesColumns,
  connectionHistoryColumns,
  internetOnlinesColumns,
} from "@/data/modemColumns";
import RefreshButton from "@/components/Buttons/RefreshButton";

const ModemPage = async ({ params }: { params: { id: string } }) => {
  const cookieStore = cookies();
  const token = cookieStore.get("AccessToken")?.value;

  if (!token) {
    throw new Error("Unauthorized: No Access Token provided");
  }

  const modemId = params.id;
  const modemDetails = await fetchModemDetails(modemId, token);

  const getIconColor = (status: string) => {
    if (status === "Online" || status === "Not Expired")
      return "text-green-500 bg-green-500";
    if (status === "Offline" || !status) return "text-red-500 bg-red-500";
    if (status === "Expired") return "text-yellow-500 bg-yellow-500";
    return "text-gray-500  bg-gray-500";
  };

  const onlineStatus = modemDetails?.IBSNG_Main[0].Online_Status || "Offline";
  const lastUpdate = modemDetails?.IBSNG_Main[0].DB_Last_Update || "Unknown";

  return (
    <DefaultLayout>
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-center space-x-2">
            <FaWifi
              className={`text-2xl ${getIconColor(onlineStatus)} bg-transparent`}
            />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{onlineStatus}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Last Update: {lastUpdate}
            </p>
            <RefreshButton modemId={modemId} token={token} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#122031] shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-[#E2E8F0] flex items-center">
            <span className="text-primary text-3xl mr-2">📡</span> Modem Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "FTTH ID", value: modemDetails.IBSNG_Main[0].FTTH_ID },
              { label: "User ID", value: modemDetails.IBSNG_Main[0].User_ID },
              { label: "Customer", value: modemDetails.IBSNG_Main[0].Customer },
              { label: "Group", value: modemDetails.IBSNG_Main[0].Group },
              {
                label: "Last Successful Login",
                value: modemDetails.IBSNG_Main[0].Last_Successful_Login,
              },
              {
                label: "Expiration Status",
                value: modemDetails.IBSNG_Main[0].Expiration_Status,
                status: true,
              },
              {
                label: "Parent User ID",
                value: modemDetails.IBSNG_Main[0].Parent_User_Id,
              },
              {
                label: "Creation Date",
                value: modemDetails.IBSNG_Main[0].Creation_Date,
              },
              { label: "Owner", value: modemDetails.IBSNG_Main[0].Owner_IS },
              {
                label: "is User Locked",
                value: modemDetails.IBSNG_Main[0].User_is_Locked,
              },
              { label: "Charge", value: modemDetails.IBSNG_Main[0].Charge },
              {
                label: "Real First Login",
                value: modemDetails.IBSNG_Main[0].Real_First_Login,
              },
            ]
              .sort((a, b) => a.label.localeCompare(b.label))
              .map(({ label, value, status }, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1b2a3c]  bg-grid-black/[0.01] dark:bg-grid-white/[0.01]  p-5 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-lg"
                >
                  <p className="text-sm dark:text-gray-400 mb-1">{label}</p>
                  <p
                    className={`font-semibold text-lg dark:text-[#E2E8F0] ${
                      status
                        ? `inline-block px-2 py-1 rounded text-sm ${getIconColor(value)}`
                        : ""
                    }`}
                  >
                    {value}
                  </p>
                </div>
              ))}
          </div>
        </div>

        <div>
          <TableThree
            data={modemDetails.IBSNG_Internet_Onlines}
            columns={internetOnlinesColumns}
            header="Internet Online Sessions"
            emoji="🌐"
          />
        </div>

        <div>
          <TableThree
            data={modemDetails.IBSNG_Connection_History}
            columns={connectionHistoryColumns}
            header="Connection History"
            emoji="🔗"
          />
        </div>

        <div>
          <TableThree
            data={modemDetails.IBSNG_Ballances}
            columns={ballancesColumns}
            header="Balances"
            emoji="💰"
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ModemPage;
