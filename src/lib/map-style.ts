/**
 * Google's own "Night" styled-map preset (from the Maps Platform styling
 * wizard) — matches the Bold Editorial redesign's near-black map look
 * used everywhere else in the app, replacing the plain (light) OpenStreetMap
 * tiles this site used before.
 *
 * The mobile app (albmap's lib/core/constants/map_style.dart) uses the
 * exact same style array — Google Maps' JSON styling format is shared
 * across the JS, Android, and iOS SDKs, so keeping both copies in sync
 * keeps the app and website's maps looking identical.
 */
export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  // Google's original "Night" preset shipped these two at #8a8a8a/#616161
  // against this style's #212121/#2c2c2c backgrounds — roughly 2.5-3:1
  // contrast, well under WCAG's 4.5:1 minimum for legible text, so street
  // names read as "barely there" rather than actually missing. Brightened
  // to ~8-10:1, in line with how legible administrative.country (#9e9e9e)
  // and administrative.locality (#bdbdbd) already are in this same style.
  // Also gives road labels their own (near-black) stroke rather than
  // inheriting the global default, which was nearly the same shade as the
  // background it needed to stand out against.
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#b8b8b8" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  // Brighter than the generic road label above, not dimmer — these are
  // the actual street names most people are reading (arterials/highways
  // are more often recognized by shape/route number than by name).
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "road.local", elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];
