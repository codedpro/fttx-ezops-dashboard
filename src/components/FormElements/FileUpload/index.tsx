"use client";
import React, { useState } from "react";
import { useDropzone } from 'react-dropzone';

import { motion } from "framer-motion";
import { FaUpload } from "react-icons/fa";

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    if (onChange) onChange(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    onDrop: handleFileChange,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded-xl border border-dashed border-gray-4 bg-gray-2 px-4 py-4 hover:border-primary dark:border-darkgray-3 dark:bg-darkgray-2 dark:hover:border-primary sm:py-7.5"
    >
      <input {...getInputProps()} />

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <span className="flex h-13.5 w-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-darkgray-3 dark:bg-gray-dark dark:text-white text-gray-dark">
            <FaUpload />
          </span>
          <p className="mt-2.5 text-body-sm font-medium">
            <span className="text-primary">Click to upload</span> or drag and
            drop
          </p>
          <p className="mt-1 text-body-xs">SVG, PNG, JPG (max, 800 X 800px)</p>
        </div>
      ) : (
        <div className="mt-4">
          {files.map((file, idx) => (
            <motion.div
              key={idx}
              layoutId={idx === 0 ? "file-upload" : `file-upload-${idx}`}
              className="relative z-40 bg-white  dark:border-darkgray-3 dark:bg-[#122031] flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md shadow-sm"
            >
              <div className="flex justify-between w-full items-center gap-4">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layout
                  className="text-base text-darkgray-3 dark:text-neutral-300 truncate max-w-xs"
                >
                  {file.name}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layout
                  className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-neutral-600 dark:bg-darkgray-2 dark:text-white shadow-input"
                >
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </motion.p>
              </div>

              <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layout
                  className="px-1 py-0.5 rounded-md bg-gray-100 dark:text-white text-neutral-600 dark:bg-darkgray-2"
                >
                  {file.type}
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layout
                >
                  Modified {new Date(file.lastModified).toLocaleDateString()}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
