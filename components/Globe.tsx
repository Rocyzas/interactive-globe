"use client";
import { useEffect } from 'react';

const GlobeComponent = () => {
    
  // Dummy GeoJSON data for countries
  const dummyGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-10.0, 10.0],
              [10.0, 10.0],
              [10.0, -10.0],
              [-10.0, -10.0],
              [-10.0, 10.0],
            ],
          ],
        },
        properties: {
          ADMIN: "Test Country",
          ISO_A2: "TC",
          POP_EST: 5000000,
        },
      },
    ],
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//unpkg.com/globe.gl';
    script.async = true;
    script.onload = () => {

      const world = new window.Globe(document.getElementById('globeViz'))
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .hexPolygonsData(dummyGeoJson.features)
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
  }, []);

  return <div id="globeViz" style={{ width: '100%', height: '100vh' }}></div>;
};

export default GlobeComponent;