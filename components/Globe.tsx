"use client";
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { scaleSequentialSqrt } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";

const GlobeComponent = () => {
  const globeRef = useRef(null);

  // Fetch the GeoJSON data from the public directory
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [countriesData, setCountriesData] = useState(null);

  useEffect(() => {
    const fetchPolygonsData = async () => {
      try {
        const cachedGeoJsonData = localStorage.getItem('geoJsonData');
        if (cachedGeoJsonData) {
          console.log("Using cached geoJsonData");
          setGeoJsonData(JSON.parse(cachedGeoJsonData));
        } else {
          // If not in localStorage, fetch it
          const response = await fetch('/countries.geojson');
          const data = await response.json();
          setGeoJsonData(data);
          localStorage.setItem('geoJsonData', JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error fetching polygons:", error);
      }
    };

    fetchPolygonsData();
  }, []);
  
  useEffect(() => {
    const fetchCountriesData = async () => {
      try {
        const response = await fetch('/countries_with_ids.json');
        const data = await response.json();
        setCountriesData(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountriesData();
  }, []);

  useEffect(() => {
    
    // Wait until the data is loaded
    if (!geoJsonData || !countriesData)  return;

    const colorScale = scaleSequentialSqrt(interpolateYlOrRd);

    const getVal = (feat) => {
      if (!countriesData) return 0;
    
      const countryCode = feat.properties.ISO_A3; // Get country ISO_A3 code
      const val = countriesData[countryCode] ? countriesData[countryCode].value : 0;

      return val/2;
    };

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
        globeRef.current = world;
    };

    document.body.appendChild(script);
  }, [geoJsonData, countriesData]); // Trigger this effect when geoJsonData is loaded

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

  return <div id="globeViz" style={{ width: '100%', height: '100%'}}></div>;
};

export default GlobeComponent;
