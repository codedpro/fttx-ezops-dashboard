import axios from "axios";
import { ModemDetails } from "@/types/ModemDetails";
import qs from "qs";
export const fetchModemDetails = async (
  id: string,
  token: string
): Promise<ModemDetails> => {
  const data = qs.stringify({
    FTTH_ID: id,
  });

  const config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${process.env.NEXT_PUBLIC_LNM_API_URL}/ModemDetails`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
    data: data,
  };

  try {
    const response = await axios.request(config);

    return response.data;
  } catch (error) {
    console.error("Error fetching modem details:", error);
    throw new Error("Failed to fetch modem details");
  }
};

export const performHardRefresh = async (modemId: string) => {
  /*  const response = await fetch(
    `https://your-api.com/refresh-modem/${modemId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to refresh modem data");
  }
 */
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return true;
};
