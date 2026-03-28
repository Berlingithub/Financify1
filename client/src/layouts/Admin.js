import React, { useState, useEffect, useRef } from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";

import Sidebar from "../components/Sidebar/Sidebar";
import AdminNavbar from '../components/Navbars/AdminNavbar';
// import Footer from "components/Footer/Footer";
// import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";

// import routes from "routes.js";
import routes from '../routes';

// import sidebarImage from "assets/img/sidebar-3.jpg";
import sidebarImage from '../assets/img/sidebar-3.jpg';

function Admin() {
  const [image, setImage] = useState(sidebarImage);
  const [color, setColor] = useState("black");
  const [hasImage, setHasImage] = useState(true);
  const location = useLocation();
  const mainPanel = useRef(null);
  
  console.log('Admin component - Current location:', location.pathname);

  const getRoutes = (routes) => {
    console.log('Generating routes from:', routes);
    const generatedRoutes = routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        // Use the exact path as defined in routes.js
        const routePath = prop.path;
        console.log('Creating route:', routePath, 'for component:', prop.component.name);
        const Component = prop.component;
        console.log('Rendering component:', Component.name, 'for path:', routePath);
        return (
          <Route
            path={routePath}
            element={<Component />}
            key={key}
          />
        );
      } else {
        return null;
      }
    }).filter(Boolean); // Remove null values
    console.log('Generated routes:', generatedRoutes);
    return generatedRoutes;
  };
  
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanel.current) {
      mainPanel.current.scrollTop = 0;
    }
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      const element = document.getElementById("bodyClick");
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  }, [location]);
  
  return (
    <>
      <div className="wrapper">
        <Sidebar color={color} image={hasImage ? image : ""} routes={routes} />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar />
          <div className="content">
            <Routes> 
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              {getRoutes(routes)}
              <Route path="*" element={<Navigate to="dashboard" replace />} />    
            </Routes>
          </div>
          {/* <Footer /> */}
        </div>
      </div>
      {/* <FixedPlugin
        hasImage={hasImage}
        setHasImage={() => setHasImage(!hasImage)}
        color={color}
        setColor={(color) => setColor(color)}
        image={image}
        setImage={(image) => setImage(image)}
      /> */}
    </>
  );
}

export default Admin;
