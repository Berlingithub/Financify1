import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { logout } from '../../api/api';
import routes from '../../routes';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    const node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      document.documentElement.classList.toggle("nav-open");
      this.remove();
    };
    document.body.appendChild(node);
  };
  
  const logoutUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Try to call logout API, but don't wait for it
      logout().catch(err => console.log("Logout API error:", err.message));
    } catch (e) {
      console.log("Logout error:", e.message);
    } finally {
      // Always redirect to home page immediately
      navigate("/");
      setLoading(false);
    }
  };

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      // Extract the path after /admin/ for comparison
      const adminPath = location.pathname.replace('/admin/', '');
      if (adminPath === routes[i].path) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        {/* Left side: Brand & Sidebar Toggle */}
        <div className="d-flex align-items-center">
          <Button
            variant="dark"
            className="d-lg-none btn-fill rounded-circle p-2"
            onClick={mobileSidebarToggle}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
          <Navbar.Brand href="#home" onClick={(e) => e.preventDefault()} className="text-white">
            {getBrandText()}
          </Navbar.Brand>
        </div>

        {/* Right side: Account & Logout */}
        <Nav className="ml-auto d-flex align-items-center nav-right">
          <Nav.Item>
            <Nav.Link
              href="/admin/user"
              className="nav-link-custom"
              onClick={(e) => {
                e.preventDefault();
                navigate("/admin/user");
              }}
            >
              Account
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link className="logout-link" href="/" onClick={logoutUser}>
              Log out
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Container>

      {/* Add Styles for Navbar */}
      <style>
        {`
          .nav-link-custom {
            color: white !important;
            font-size: 16px;
            padding: 10px 15px;
            transition: color 0.3s ease;
            text-decoration: none;
          }
          .nav-link-custom:hover {
            color: #f39c12 !important;
          }
          .logout-link {
            color: #f07459 !important;
            font-size: 16px;
            padding: 10px 15px;
            transition: color 0.3s ease;
            text-decoration: none;
          }
          .logout-link:hover {
            color: #ff6347 !important;
          }
          .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }
          .nav-right {
            margin-left: auto;
            display: flex;
            gap: 20px;
          }
          .navbar-toggler-bar {
            background: white;
          }
        `}
      </style>
    </Navbar>
  );
}

export default Header;
