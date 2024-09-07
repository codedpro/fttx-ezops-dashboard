export interface IBSNG_Main {
  FTTH_ID: number;
  User_ID: string;
  Parent_User_Id: string;
  Creation_Date: string;
  Expiration_Status: string;
  Online_Status: string;
  Owner_IS: string;
  Customer: string;
  Group: string;
  User_is_Locked: string;
  Charge: string;
  Package_First_Login: string;
  Real_First_Login: string;
  Last_Successful_Login: string;
  DB_Last_Update: string;
}

export interface IBSNG_Internet_Onlines {
  FTTH_ID: number;
  Sub_Service: string;
  QOS: string;
  Login_Time: string;
  Ras_Desc: string;
  Remote_IP: string;
  MAC: string;
  Port: string;
  In_Bytes: number;
  Out_Bytes: number;
  In_Rate: number;
  Out_Rate: number;
  Session_ID: string;
  Rule: string;
  Failed_Reason: string;
  Apn: string;
  SSID: string;
}

export interface IBSNG_Connection_History {
  ID: number;
  FTTH_ID: number;
  User_ID: string;
  Session_Start: string;
  Session_End: string;
  Kill_Reason: string;
  Terminate_Cause: string;
  MAC: string;
  Port: string;
  IPv4: string;
  IPv6: string;
  RAS: string;
}

export interface IBSNG_Ballances {
  ID: number;
  FTTH_ID: number;
  Balance_Name: string;
  Package_Name: string;
  Priority: string;
  Initial_Value: string;
  Value: string;
  First_Use_Time: string;
  First_Use_Exp_Time: string;
  Exp_Time: string;
  QOS: string;
  Committed_Value: string;
  Unused_Value: string;
  Start_Time: string;
}

export interface ModemDetails {
  IBSNG_Main: IBSNG_Main[];
  IBSNG_Internet_Onlines: IBSNG_Internet_Onlines[];
  IBSNG_Connection_History: IBSNG_Connection_History[];
  IBSNG_Ballances: IBSNG_Ballances[];
}
