"use client";
import { useFTTHModemsStore } from "@/store/FTTHModemsStore";

const FTTHModemsList = () => {
  const modems = useFTTHModemsStore((state) => state.modems);
  const error = useFTTHModemsStore((state) => state.error);
  const isLoading = useFTTHModemsStore((state) => state.isLoading);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>FTTH Modems</h1>
      {modems.length > 0 ? (
        <ul>
          {modems.map((modem) => (
            <li key={modem.Modem_ID}>
              Modem ID: {modem.Modem_ID}, Location: ({modem.Lat}, {modem.Long}),
              OLT: {modem.OLT}, POP: {modem.POP}, FAT: {modem.FAT}, Symbol:{" "}
              {modem.Symbol}, Error: {modem.Error}
            </li>
          ))}
        </ul>
      ) : (
        <p>No modems available</p>
      )}
    </div>
  );
};

export default FTTHModemsList;
