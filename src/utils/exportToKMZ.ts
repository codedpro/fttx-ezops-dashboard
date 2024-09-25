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

    const response = await fetch("/GeoToKMZ", {
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

    saveAs(blob, "MTN_Irancell_FTTX_Time.kmz");
  } catch (error) {
    console.error("Error during KMZ export:", error);
  }
};

export default exportToKMZ;
