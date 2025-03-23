import GlobeComponent from '../components/Globe';
import "../styles/global.css";

const HomePage = () => {
  return (
    <div>
      <h1 className="header"> &lt; Some Statistics &gt; 3D Map</h1>
      <GlobeComponent />
    </div>
  );
};

export default HomePage;
