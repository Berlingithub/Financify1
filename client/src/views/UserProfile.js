import React,{useState,useEffect} from "react";
import { getIncome, createIncome, getProfile, updateProfile } from '../api/api';

// react-bootstrap components
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
var moment = require('moment');

function User() {

  const [data,setData]=useState({});
  const [profileData,setProfileData]=useState({})
  const [newAmount,setNewAmount]=useState();
  const [newDate,setNewDate]=useState();
  const [newName,setNewName]=useState();
  const [newEmail,setNewEmail]=useState();

  const fetchIncome=async()=>{
    await getIncome().then((res)=>{
      setData(res.data)
    }).catch(e=>console.log(e.message))
  }
  const fetchUserProfile=async()=>{
    await getProfile().then((res)=>{
      setProfileData(res.data)
    }).catch(e=>console.log(e.message))
  }
  const updateUserProfile=async(name,email)=>{
    await updateProfile({name,email}).then((res)=>{
      setProfileData({ name: res.data.name, email: res.data.email })
    }).catch(e=>console.log(e.message))
  }
  
  const postIncome=async(amount,salaryDate)=>{
    console.log({amount,salaryDate})
    await createIncome({amount,salaryDate}).then((res)=>{
      console.log(res.data)
      fetchIncome()
    }).catch(e=>console.log(e.message))
  }
  useEffect(()=>{
    fetchIncome()
    fetchUserProfile()
  },[])

  return (
    <>
      <Container fluid>
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Edit Profile</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col className="pl-3" md="12">
                      <Form.Group>
                        <label htmlFor="exampleInputEmail1">
                          Email address
                        </label>
                        <Form.Control
                          defaultValue={profileData.email}
                          placeholder="Email"
                          type="email"
                          onChange={(e)=>setNewEmail(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pl-3" md="12">
                      <Form.Group>
                        <label>Name</label>
                        <Form.Control
                          defaultValue={profileData.name}
                          placeholder="Name"
                          onChange={(e)=>setNewName(e.target.value)}
                          type="text"
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    className="btn-fill pull-right"
                    variant="info"
                    onClick={()=>updateUserProfile(newName,newEmail)}
                  >
                    Update Profile
                  </Button>
                  <div className="clearfix"></div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md="4">
            <Card className="card-user" style={{ 
              borderRadius: '15px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div className="card-image" style={{ 
                height: '120px',
                background: `url(${require("../assets/images/profile-bg.jpg")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-user" style={{ fontSize: '24px', color: 'white' }}></i>
                </div>
              </div>
              <Card.Body>
                
                
                <div className="author"
                  style={{
                    textAlign: "center",
                    padding: "60px 20px 10px",
                    position: "relative",
                  }}
                >
                  <a
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    {/* PROFILE CIRCLE */}
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "3px solid #fff",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        top: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 2,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        alt="User Profile"
                        src={require("../assets/images/user.png").default}
                        style={{
                          width: "calc(100% - 6px)",
                          height: "calc(100% - 6px)",
                          borderRadius: "50%",
                          objectFit: "cover",
                          position: "absolute",
                          top: "3px",
                          left: "3px",
                        }}
                      />

                      {/* fallback icon */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 3,
                        }}
                      >
                        <i
                          className="fas fa-user"
                          style={{
                            fontSize: "20px",
                            color: "white",
                            marginBottom: "2px",
                          }}
                        ></i>
                        <span
                          style={{
                            fontSize: "8px",
                            color: "white",
                            fontWeight: "bold",
                            lineHeight: "1",
                          }}
                        >
                          PROFILE
                        </span>
                      </div>
                    </div>

                    {/* USER NAME */}
                    <h5
                      className="title"
                      style={{
                        marginTop: "10px",
                        color: "#333",
                        fontWeight: "600",
                        fontSize: "18px",
                        marginBottom: "8px",
                      }}
                    >
                      {profileData.name || "User Name"}
                    </h5>
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Income Details</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Row>
                    <Col className="pr-1" md="6">
                      <Form.Group>
                        <label>TOTAL INCOME</label>
                        <Form.Control
                          defaultValue={data.amount}
                          onChange={(e)=>setNewAmount(e.target.value)}
                          placeholder="income"
                          type="number"
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col className="px-1" md="6">
                      <Form.Group>
                        <label>Date at which you get your salary</label>
                        <Form.Control
                          placeholder="Date"
                          type="date"
                          onChange={(e)=>setNewDate(e.target.value)}
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    className="btn-fill pull-right"
                    variant="info"
                    onClick={()=>postIncome(newAmount,newDate)}
                  >
                    Update Income
                  </Button>
                  <div className="clearfix"></div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default User;
