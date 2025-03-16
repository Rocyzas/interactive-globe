"use client";
import { useEffect, useState } from 'react';

const GlobeComponent = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);

  // Fetch the GeoJSON data from the public directory
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/dummy-geojson.json');
      const data = await response.json();
      setGeoJsonData(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Wait until the data is loaded
    if (!geoJsonData) return;

    const script = document.createElement('script');
    script.src = '//unpkg.com/globe.gl';
    script.async = true;
    script.onload = () => {
      const world = new window.Globe(document.getElementById('globeViz'))
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .hexPolygonsData(geoJsonData.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.3)
        .hexPolygonUseDots(true)
        .hexPolygonColor(() => `#${Math.round(Math.random() * Math.pow(2, 24)).toString(16).padStart(6, '0')}`)
        .hexPolygonLabel(({ properties: d }) => `
          <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
          Population: <i>${d.POP_EST}</i>
        `);
    };

    document.body.appendChild(script);
  }, [geoJsonData]); // Trigger this effect when geoJsonData is loaded

  return <div id="globeViz" style={{ width: '100%', height: '100vh' }}></div>;
};

export default GlobeComponent;
