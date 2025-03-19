"use client";
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { scaleSequentialSqrt } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";

const GlobeComponent = () => {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const globeRef = useRef(null);

  // Fetch the GeoJSON data from the public directory
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/countries.geojson');
      const data = await response.json();
      setGeoJsonData(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Wait until the data is loaded
    if (!geoJsonData) return;

    const colorScale = scaleSequentialSqrt(interpolateYlOrRd);
    const getVal = (feat) =>
      feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST || 1);

    const script = document.createElement('script');
    script.src = '//unpkg.com/globe.gl';
    script.async = true;
    script.onload = () => {
      const world = new window.Globe(document.getElementById('globeViz'))
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .lineHoverPrecision(0)
        .polygonsData(geoJsonData.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
        .polygonAltitude(0.06)
        .polygonCapColor(feat => colorScale(getVal(feat)))
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
        .polygonStrokeColor(() => '#111')
        .polygonLabel(({ properties: d }) => `
          <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
          GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
          Population: <i>${d.POP_EST}</i>
        `)
        .onPolygonHover(hoverD => world
          .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
          .polygonCapColor(d => d === hoverD ? 'steelblue' : colorScale(getVal(d)))
        )
        .polygonsTransitionDuration(300);

        // .hexPolygonResolution(3)
        // .hexPolygonMargin(0.3)
        // .hexPolygonUseDots(true)
        // .hexPolygonColor(() => `#${Math.round(Math.random() * Math.pow(2, 24)).toString(16).padStart(6, '0')}`)
        // .hexPolygonLabel(({ properties: d }) => `
        //   <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
        //   Population: <i>${d.POP_EST}</i>
        // `);
        globeRef.current = world;

    };

    document.body.appendChild(script);
  }, [geoJsonData]); // Trigger this effect when geoJsonData is loaded

  // Handle dynamic resizing
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("globeViz");
      if (globeRef.current && container) {
        globeRef.current.width([container.clientWidth]);
        globeRef.current.height([container.clientHeight]);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Adjust size on initial load

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div id="globeViz" style={{ width: '100%', height: '100%', backgroundColor: "black"}}></div>;
};

export default GlobeComponent;
