import React,{useState,useEffect} from "react";
import { getIncome, createIncome, getProfile, updateProfile } from '../api/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const [income,setIncome]=useState({ amount: 0, salaryDate: null });
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [originalEmail,setOriginalEmail]=useState('');
  const [currentPassword,setCurrentPassword]=useState('');
  const [incomeAmount,setIncomeAmount]=useState('');
  const [incomeDate,setIncomeDate]=useState('');

  const notifySuccess = (msg) => toast.success(msg);
  const notifyFailure = (msg) => toast.error(msg || 'Something went wrong');

  const fetchIncome=async()=>{
    try {
      const res = await getIncome();
      setIncome(res.data || { amount: 0 });
      if (res.data?.amount != null) setIncomeAmount(String(res.data.amount));
      if (res.data?.salaryDate) {
        setIncomeDate(moment(res.data.salaryDate).format('YYYY-MM-DD'));
      }
    } catch (e) {
      notifyFailure(e.response?.data?.message);
    }
  }
  const fetchUserProfile=async()=>{
    try {
      const res = await getProfile();
      setName(res.data.name || '');
      setEmail(res.data.email || '');
      setOriginalEmail(res.data.email || '');
    } catch (e) {
      notifyFailure(e.response?.data?.message);
    }
  }
  const emailChanging =
    email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();

  const updateUserProfile=async()=>{
    if (emailChanging && !currentPassword) {
      notifyFailure('Enter your current password to change email');
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
      };
      if (emailChanging) payload.currentPassword = currentPassword;
      const res = await updateProfile(payload);
      setName(res.data.name);
      setEmail(res.data.email);
      setOriginalEmail(res.data.email);
      setCurrentPassword('');
      notifySuccess('Profile updated');
    } catch (e) {
      notifyFailure(e.response?.data?.message);
    }
  }
  
  const postIncome=async()=>{
    const amount = incomeAmount === '' ? income.amount : Number(incomeAmount);
    const salaryDate = incomeDate || income.salaryDate;
    if (Number.isNaN(amount) || amount < 0) {
      notifyFailure('Enter a valid income amount');
      return;
    }
    if (!salaryDate) {
      notifyFailure('Select your salary date');
      return;
    }
    try {
      await createIncome({ amount, salaryDate });
      await fetchIncome();
      notifySuccess('Income updated');
    } catch (e) {
      notifyFailure(e.response?.data?.message);
    }
  }
  useEffect(()=>{
    fetchIncome()
    fetchUserProfile()
  },[])

  return (
    <>
      <ToastContainer />
      <Container fluid>
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Edit Profile</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={(e) => { e.preventDefault(); updateUserProfile(); }}>
                  <Row>
                    <Col className="pl-3" md="12">
                      <Form.Group>
                        <label htmlFor="profileEmail">
                          Email address
                        </label>
                        <Form.Control
                          id="profileEmail"
                          value={email}
                          placeholder="Email"
                          type="email"
                          onChange={(e)=>setEmail(e.target.value)}
                          required
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pl-3" md="12">
                      <Form.Group>
                        <label htmlFor="profileName">Name</label>
                        <Form.Control
                          id="profileName"
                          value={name}
                          placeholder="Name"
                          onChange={(e)=>setName(e.target.value)}
                          type="text"
                          required
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  {emailChanging && (
                    <Row>
                      <Col className="pl-3" md="12">
                        <Form.Group>
                          <label htmlFor="profilePassword">Current password</label>
                          <Form.Control
                            id="profilePassword"
                            type="password"
                            value={currentPassword}
                            placeholder="Required to change email"
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            autoComplete="current-password"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                  <Button
                    className="btn-fill pull-right"
                    variant="info"
                    type="submit"
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
                  <h5 className="title" style={{ marginTop: "10px", color: "#333", fontWeight: "600" }}>
                    {name || "User Name"}
                  </h5>
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
                <Form onSubmit={(e) => { e.preventDefault(); postIncome(); }}>
                  <Row>
                    <Col className="pr-1" md="6">
                      <Form.Group>
                        <label>TOTAL INCOME</label>
                        <Form.Control
                          value={incomeAmount}
                          onChange={(e)=>setIncomeAmount(e.target.value)}
                          placeholder="income"
                          type="number"
                          min="0"
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                    <Col className="px-1" md="6">
                      <Form.Group>
                        <label>Date at which you get your salary</label>
                        <Form.Control
                          placeholder="Date"
                          type="date"
                          value={incomeDate}
                          onChange={(e)=>setIncomeDate(e.target.value)}
                          required
                        ></Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    className="btn-fill pull-right"
                    variant="info"
                    type="submit"
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
