"use client";
import React, { useState } from "react";
import FTTHMap from "@/components/Maps/Main";
import { useFTTHModemLayer } from "@/components/Maps/Main/Layers/FTTHModem";
import { useMFATLayer } from "@/components/Maps/Main/Layers/MFATLayer";
import { useSFATLayer } from "@/components/Maps/Main/Layers/SFATLayer";
import { useHHLayer } from "@/components/Maps/Main/Layers/HHLayer";
import { useOLTLayer } from "@/components/Maps/Main/Layers/OLTLayer";
import { useODCLayer } from "@/components/Maps/Main/Layers/ODCLayer";
import { useTCLayer } from "@/components/Maps/Main/Layers/TCLayer";
import { useFATLineLayer } from "@/components/Maps/Main/Layers/FATLineLayer";
import { useMetroLineLayer } from "@/components/Maps/Main/Layers/MetroLineLayer";
import { useODCLineLayer } from "@/components/Maps/Main/Layers/ODCLineLayer";
import { useDropCableLineLayer } from "@/components/Maps/Main/Layers/DropCableLineLayer";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const FTTHModemsMap: React.FC = () => {
  const modemLayer = useFTTHModemLayer();
  const mFatLayer = useMFATLayer();
  const sFatLayer = useSFATLayer();
  const hhLayer = useHHLayer();
  const oltLayer = useOLTLayer();
  const odcLayer = useODCLayer();
  const tcLayer = useTCLayer();
  const fatLineLayer = useFATLineLayer();
  const metroLineLayer = useMetroLineLayer();
  const odcLineLayer = useODCLineLayer();
  const dropCableLineLayer = useDropCableLineLayer();

  const [isModemLayerVisible, setIsModemLayerVisible] = useState(true);
  const [isMFATLayerVisible, setIsMFATLayerVisible] = useState(true);
  const [isSFATLayerVisible, setIsSFATLayerVisible] = useState(true);
  const [isHHLayerVisible, setIsHHLayerVisible] = useState(true);
  const [isOLTLayerVisible, setIsOLTLayerVisible] = useState(true);
  const [isODCLayerVisible, setIsODCLayerVisible] = useState(true);
  const [isTCLayerVisible, setIsTCLayerVisible] = useState(true);
  const [isFATLayerVisible, setIsFATLayerVisible] = useState(true);
  const [isMetroLayerVisible, setIsMetroLayerVisible] = useState(true);
  const [isODCLineLayerVisible, setIsODCLineLayerVisible] = useState(true);
  const [isDropCableLayerVisible, setIsDropCableLayerVisible] = useState(true);

  const layers = [
    {
      ...modemLayer,
      visible: isModemLayerVisible,
    },
    {
      ...mFatLayer,
      visible: isMFATLayerVisible,
    },
    {
      ...sFatLayer,
      visible: isSFATLayerVisible,
    },
    {
      ...hhLayer,
      visible: isHHLayerVisible,
    },
    {
      ...oltLayer,
      visible: isOLTLayerVisible,
    },
    {
      ...odcLayer,
      visible: isODCLayerVisible,
    },
    {
      ...tcLayer,
      visible: isTCLayerVisible,
    },
    {
      ...fatLineLayer,
      visible: isFATLayerVisible,
    },
    {
      ...metroLineLayer,
      visible: isMetroLayerVisible,
    },
    {
      ...odcLineLayer,
      visible: isODCLineLayerVisible,
    },
    {
      ...dropCableLineLayer,
      visible: isDropCableLayerVisible,
    },
  ];

  return (
    <>
      <DefaultLayout>
        <button onClick={() => setIsModemLayerVisible((prev) => !prev)}>
          Toggle Modem Layer
        </button>
        <button onClick={() => setIsMFATLayerVisible((prev) => !prev)}>
          Toggle MFAT Layer
        </button>
        <button onClick={() => setIsSFATLayerVisible((prev) => !prev)}>
          Toggle SFAT Layer
        </button>
        <button onClick={() => setIsHHLayerVisible((prev) => !prev)}>
          Toggle HH Layer
        </button>
        <button onClick={() => setIsOLTLayerVisible((prev) => !prev)}>
          Toggle OLT Layer
        </button>
        <button onClick={() => setIsODCLayerVisible((prev) => !prev)}>
          Toggle ODC Layer
        </button>
        <button onClick={() => setIsTCLayerVisible((prev) => !prev)}>
          Toggle TC Layer
        </button>
        <button onClick={() => setIsFATLayerVisible((prev) => !prev)}>
          Toggle FAT Line Layer
        </button>
        <button onClick={() => setIsMetroLayerVisible((prev) => !prev)}>
          Toggle Metro Line Layer
        </button>
        <button onClick={() => setIsODCLineLayerVisible((prev) => !prev)}>
          Toggle ODC Line Layer
        </button>
        <button onClick={() => setIsDropCableLayerVisible((prev) => !prev)}>
          Toggle Drop Cable Line Layer
        </button>
        {modemLayer.source &&
          mFatLayer.source &&
          sFatLayer.source &&
          hhLayer.source &&
          oltLayer.source &&
          odcLayer.source &&
          fatLineLayer.source &&
          metroLineLayer.source &&
          odcLineLayer.source &&
          dropCableLineLayer.source &&
          tcLayer.source && <FTTHMap layers={layers} />}
      </DefaultLayout>{" "}
    </>
  );
};

export default FTTHModemsMap;
