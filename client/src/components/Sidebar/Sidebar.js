import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";

import logo from "../../assets/images/favicon.png";

function Sidebar({ color, image, routes }) {
  const location = useLocation();
  
  console.log('Sidebar props:', { color, image, routes });
  console.log('Current location:', location.pathname);
  
  const activeRoute = (routeName) => {
    const currentPath = location.pathname;
    const routePath = routeName;
    console.log('Checking route:', { currentPath, routePath, routeName });
    return currentPath.includes(routePath) ? "active" : "";
  };
  
  const handleNavClick = (route) => {
    console.log('Navigating to:', route.layout + route.path);
  };
  
  return (
    <div className="sidebar" data-image={image} data-color={color}>
      <div
        className="sidebar-background"
        style={{
          backgroundImage: "url(" + image + ")",
        }}
      />
      <div className="sidebar-wrapper">
        <div className="logo d-flex align-items-center justify-content-start">
          <a className="simple-text logo-mini mx-1">
            <div className="logo-img">
              <img
                src={logo}
                alt="Financify Logo"
                width="30"
                height="30"
              />
            </div>
          </a>
          <a className="simple-text">
            FINANCIFY
          </a>
        </div>
        <Nav>
          {routes && routes.map((prop, key) => {
            console.log('Rendering route:', prop);
            if (!prop.redirect)
              return (
                <li
                  className={
                    prop.upgrade
                      ? "active active-pro"
                      : activeRoute(prop.layout + prop.path)
                  }
                  key={key}
                >
                  <NavLink
                    to={prop.layout + prop.path}
                    className="nav-link"
                    activeClassName="active"
                    onClick={() => handleNavClick(prop)}
                  >
                    <i className={prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            return null;
          })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
