"use client";
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function Home() {
  const globeRef = useRef(null);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;

      fetch('./custom.geojson')
        .then(response => response.json())
        .then(geoJsonData => {
          globeRef.current
            .polygonsData(geoJsonData.features)
            .polygonCapColor(() => 'rgba(200, 0, 0, 0.6)')
            .polygonSideColor(() => 'rgba(255, 255, 255, 0.15)')
            .polygonStrokeColor(() => '#111')
            .polygonLabel(({ properties: d }) => `
              <b>${d.ADMIN} (${d.ISO_A3})</b><br />
              Population: ${d.POP_EST.toLocaleString()}
            `)
            .onPolygonHover(hoverD => globeRef.current
              .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
              .polygonCapColor(d => d === hoverD ? 'rgba(200, 0, 0, 0.8)' : 'rgba(200, 0, 0, 0.6)')
            );
        });
    }
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <html><body>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          polygonsData={[]}
        />
        </body></html>
      </div>

  );
}
