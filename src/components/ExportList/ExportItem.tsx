// components/ExportItem.tsx

'use client';

import React, { useState } from 'react';
import { ExportItemType, ExportParams, ExportResponse } from '@/types/exports';
import * as XLSX from 'xlsx';

interface ExportItemProps {
  exportItem: ExportItemType;
}

const ExportItem: React.FC<ExportItemProps> = ({ exportItem }) => {
  const [city, setCity] = useState<string>('');
  const [numberParameter, setNumberParameter] = useState<number | ''>('');
  const [planStatus, setPlanStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleDownload = async () => {
    setLoading(true);

    const params: ExportParams = { id: exportItem.id };
    if (exportItem.isCity) params.city = city;
    if (exportItem.isNumberParameter && typeof numberParameter === 'number') {
      params.numberParameter = numberParameter;
    }
    if (exportItem.isPlanStatus) params.planStatus = planStatus;

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch export data');
      }

      const data: ExportResponse = await response.json();

      // Generate XLSX file
      const xlsxData = generateXLSX(data);

      // Create a blob and trigger download
      const blob = new Blob([xlsxData], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const date = new Date();
      const dateString = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date
        .getHours()
        .toString()
        .padStart(2, '0')}-${date.getMinutes().toString().padStart(2, '0')}-${date
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;

      a.download = `${exportItem.name}_${dateString}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to download export');
    } finally {
      setLoading(false);
    }
  };

  const generateXLSX = (data: ExportResponse): ArrayBuffer => {
    const wb = XLSX.utils.book_new();

    for (const sheetName in data) {
      const wsData = data[sheetName];
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return xlsxData;
  };

  return (
    <div className="export-item border p-4 rounded shadow">
      <h3 className="text-lg font-medium">{exportItem.name}</h3>
      <div className="parameters mt-2 space-y-2">
        {exportItem.isCity && (
          <div>
            <label className="block font-semibold">City:</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select City</option>
              <option value="City A">City A</option>
              <option value="City B">City B</option>
              <option value="City C">City C</option>
            </select>
          </div>
        )}
        {exportItem.isNumberParameter && exportItem.numberParameters && (
          <div>
            <label className="block font-semibold">Number Parameter:</label>
            <select
              value={numberParameter}
              onChange={(e) =>
                setNumberParameter(
                  e.target.value ? parseInt(e.target.value) : ''
                )
              }
              className="w-full border p-2 rounded"
            >
              <option value="">Select Number</option>
              {exportItem.numberParameters.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}
        {exportItem.isPlanStatus && exportItem.planStatus && (
          <div>
            <label className="block font-semibold">Plan Status:</label>
            <select
              value={planStatus}
              onChange={(e) => setPlanStatus(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Status</option>
              {exportItem.planStatus.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Downloading...' : 'Download'}
      </button>
    </div>
  );
};

export default ExportItem;
