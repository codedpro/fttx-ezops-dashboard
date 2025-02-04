import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import { PRIMARY_COLOR, getNormalFill } from "./constants";
import {
  FeatureWithDirectName,
  CityData,
} from "./types";

/** Style zoom control buttons. */
export function customizeZoomButtons(zoomControl: am5map.ZoomControl) {
  const customizeZoomButton = (button: am5.Button) => {
    const background = button.get("background") as am5.Rectangle;
    if (background) {
      background.setAll({ fill: am5.color(PRIMARY_COLOR) });
      background.states.create("hover", { fill: am5.color(0xffe680) });
      background.states.create("active", { fill: am5.color(PRIMARY_COLOR) });
      background.states.create("down", { fill: am5.color(PRIMARY_COLOR) });
    }
  };
  customizeZoomButton(zoomControl.plusButton);
  customizeZoomButton(zoomControl.minusButton);

  if (zoomControl.homeButton) {
    const homeBackground = zoomControl.homeButton.get("background");
    if (homeBackground) {
      homeBackground.setAll({ fill: am5.color(PRIMARY_COLOR) });
      homeBackground.states.create("hover", { fill: am5.color(0xffe680) });
      homeBackground.states.create("active", { fill: am5.color(PRIMARY_COLOR) });
      homeBackground.states.create("down", { fill: am5.color(PRIMARY_COLOR) });
    }

    zoomControl.homeButton.children.clear();
    zoomControl.homeButton.children.push(
      am5.Graphics.new(zoomControl.homeButton._root, {
        svgPath: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
        fill: am5.color(0x000000),
        centerX: am5.p50,
        centerY: am5.p50,
        width: 16,
        height: 16,
      })
    );
  }
}

/** Creates a pulsing city marker (bullet) for the point series. */
export function createCityBullet(root: am5.Root, cityOriginalColors: Map<string, am5.Color>, handleCityClick: (container: am5.Container) => void) {
  const container = am5.Container.new(root, {
    tooltipText: "{name}",
    cursorOverStyle: "pointer",
  });
  const bullet = am5.Bullet.new(root, { sprite: container });
  container.events.on("click", () => handleCityClick(container));

  const colorset = am5.ColorSet.new(root, {});
  const initialColor = colorset.next();
  const circle = container.children.push(
    am5.Circle.new(root, {
      radius: 4,
      fill: initialColor,
      strokeOpacity: 0,
    })
  );
  container.children.push(
    am5.Circle.new(root, {
      radius: 4,
      fill: initialColor,
      strokeOpacity: 0,
    })
  );

  const dataItem = container.dataItem;
  if (dataItem && dataItem.dataContext) {
    const city = dataItem.dataContext as CityData;
    cityOriginalColors.set(city.name, initialColor);
  }

  circle.animate({
    key: "scale",
    from: 1,
    to: 5,
    duration: 600,
    loops: Infinity,
    easing: am5.ease.out(am5.ease.cubic),
  });
  circle.animate({
    key: "opacity",
    from: 1,
    to: 0.1,
    duration: 600,
    loops: Infinity,
    easing: am5.ease.out(am5.ease.cubic),
  });

  return bullet;
}

/** Creates a label bullet for each province. */
export function createProvinceLabelBullet(root: am5.Root) {
  const isDark = document.documentElement.classList.contains("dark");
  const labelFill = isDark ? 0x000000 : 0xffffff;
  return am5.Bullet.new(root, {
    sprite: am5.Label.new(root, {
      text: "{regionName}",
      populateText: true,
      fontSize: 10,
      centerX: am5.p50,
      centerY: am5.p50,
      fontWeight: "600",
      fill: am5.color(labelFill),
    }),
  });
}

/** Applies theme-based coloring to provinces and city polygons. */
export function applyDarkModeStyling(
  polygonSeries: am5map.MapPolygonSeries | null,
  regionLabelSeries: am5map.MapPointSeries | null,
  cityPolygonSeries: am5map.MapPolygonSeries | null
) {
  if (!polygonSeries) return;
  const isDark = document.documentElement.classList.contains("dark");
  const normalFill = isDark ? am5.color(0xffffff) : am5.color(0x000000);

  // Province polygons
  const polygonTemplate = polygonSeries.mapPolygons.template;
  polygonTemplate.setAll({
    fill: normalFill,
    stroke: am5.color(isDark ? 0x888888 : 0xd3d3d3),
    tooltipText: "{name}",
    interactive: true,
  });
  polygonSeries.mapPolygons.each((poly: any) => {
    if (!poly.get("active")) {
      poly.set("fill", normalFill);
    } else {
      poly.set("fill", am5.color(PRIMARY_COLOR));
    }
  });

  // Province labels
  if (regionLabelSeries) {
    regionLabelSeries.dataItems.forEach((dataItem: any) => {
      const bullet = dataItem.bullets?.[0];
      if (bullet && bullet.get("sprite") instanceof am5.Label) {
        const label = bullet.get("sprite") as am5.Label;
        label.set("fill", am5.color(isDark ? 0x000000 : 0xffffff));
      }
    });
  }

  // City polygon layer
  if (cityPolygonSeries) {
    const cityPolygonTemplate = cityPolygonSeries.mapPolygons.template;
    cityPolygonTemplate.setAll({
      fill: am5.color(isDark ? 0xf0f0f0 : 0x4a4a4a),
      stroke: am5.color(isDark ? 0x888888 : 0xd3d3d3),
      interactive: false,
    });
    cityPolygonSeries.mapPolygons.each((poly: any) => {
      const newFill = am5.color(isDark ? 0xf0f0f0 : 0x4a4a4a);
      poly.animate({ key: "fill", from: poly.get("fill"), to: newFill, duration: 500 });
      poly.set("fill", newFill);
    });
  }
}

/** Deselects all provinces and resets the map view. */
export function deselectAll(
  chart: am5map.MapChart | null,
  polygonSeries: am5map.MapPolygonSeries | null
) {
  if (!chart || !polygonSeries) return;
  chart.goHome();
  const normalFill = getNormalFill();
  polygonSeries.mapPolygons.each((poly: any) => {
    poly.set("active", false);
    poly.set("fill", normalFill);
  });
}

/** Update the pointSeries with city markers based on store data. */
export function updateCities(
  pointSeries: am5map.MapPointSeries,
  allCities: CityData[],
  availableCities: string[]
) {
  pointSeries.data.setAll([]);
  const filtered = allCities.filter((c) => availableCities.includes(c.name));
  filtered.forEach((city) => {
    pointSeries.data.push({
      geometry: { type: "Point", coordinates: [city.long, city.lat] },
      name: city.name,
    });
  });
  pointSeries.set("visible", true);
}
