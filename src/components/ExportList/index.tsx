// components/ExportList.tsx

'use client';

import React, { useState } from 'react';
import { ExportData, ExportItemType } from '@/types/exports';
import ExportItem from './ExportItem';

interface ExportListProps {
  categories: ExportData;
}

const ExportList: React.FC<ExportListProps> = ({ categories }) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () =>
      Object.keys(categories).reduce<Record<string, boolean>>((acc, category) => {
        acc[category] = true; // All categories are open by default
        return acc;
      }, {})
  );

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="export-list">
      {Object.entries(categories).map(([category, exports]) => (
        <div key={category} className="category-section mb-6">
          <h2
            className="cursor-pointer text-xl font-semibold mb-2 flex justify-between items-center"
            onClick={() => toggleCategory(category)}
          >
            {category}
            <span>{openCategories[category] ? '-' : '+'}</span>
          </h2>
          {openCategories[category] && (
            <div className="export-items space-y-4">
              {exports.map((exportItem: ExportItemType) => (
                <ExportItem key={exportItem.id} exportItem={exportItem} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExportList;
