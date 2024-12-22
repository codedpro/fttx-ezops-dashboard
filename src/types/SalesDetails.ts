interface Confirmed {
  "Main Value": number | string;
  "Paid & installation": number | string;
  "Paid (Pending)": number | string;
  Unpaid: number | string;
}

export interface TableData {
  City: string | number;
  Request: string | number;
  Confirmed: Confirmed;
  "Install / Confirmed": number | string;
  "Install / Request": number | string;
  Pending: number | string;
  "Cancelled (customer's request)": number | string;
  Rejected: number | string;
}