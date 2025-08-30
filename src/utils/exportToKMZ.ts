import { saveAs } from "file-saver";

const exportToKMZ = async (filteredFeatures: any[]) => {
  if (!Array.isArray(filteredFeatures)) {
    console.error("filteredFeatures is not an array:", filteredFeatures);
    return;
  }

  try {
    const groupedFeaturesBySource = filteredFeatures.reduce(
      (acc: any, feature: any) => {
        if (!feature || !feature.properties || !feature.geometry) return acc;

        const { source } = feature;

        if (!acc[source]) {
          acc[source] = [];
        }

        acc[source].push(feature);

        return acc;
      },
      {}
    );

    const geojsonDataArray = Object.keys(groupedFeaturesBySource).map(
      (source) => ({
        source,
        features: {
          type: "FeatureCollection",
          features: groupedFeaturesBySource[source],
        },
      })
    );

    console.log(JSON.stringify(geojsonDataArray));
    const url = '/api';
    const response = await fetch(url + "/GeoToKMZ", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geojsonDataArray),
    });

    if (!response.ok) {
      throw new Error(`Failed to convert to KMZ: ${response.statusText}`);
    }

    const blob = await response.blob();
    const now = new Date();
    const formattedDateTime = now.toISOString().replace(/[:.-]/g, "_");
    saveAs(blob, `MTN_Irancell_FTTX_${formattedDateTime}.kmz`);
  } catch (error) {
    console.error("Error during KMZ export:", error);
  }
};

export default exportToKMZ;
