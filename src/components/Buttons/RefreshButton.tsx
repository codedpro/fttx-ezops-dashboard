"use client";

import { useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios";
import qs from "qs";

const RefreshButton = ({
  modemId,
  token,
}: {
  modemId: string;
  token: string;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);

    const data = qs.stringify({
      FTTH_ID: modemId,
    });

    const config = {
      method: "post",
      url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/IBSNGForceRefresh`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data,
    };

    try {
      const response = await axios(config);

      if (response.status === 200) {
        router.refresh();
      } else {
        throw new Error("Failed to refresh modem");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={`text-xl text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors ${isRefreshing ? "cursor-not-allowed" : ""}`}
      title="Refresh Status"
    >
      <FaSyncAlt className={isRefreshing ? "animate-spin" : ""} />
    </button>
  );
};

export default RefreshButton;
