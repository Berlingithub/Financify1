import React, { useState, useEffect } from "react";
import SubscriptionRow from "components/SubscriptionRow";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Button,
  Card,
  Form,
  Table,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { getPayment, createPayment, deletePayment, updatePayment } from '../api/api';

const PAGE_SIZE = 20;

function Typography() {

  const notifySuccess = (message) => toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    });
  const notifyFailure = (message = "An Error Occured")=>toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    });
  
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newName, setNewName] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newRepeatDuration, setNewRepeatDuration] = useState("");
  const [newDate, setNewDate] = useState("")

  const applyListResponse = (res, append) => {
    const payload = res.data;
    let list = [];
    if (Array.isArray(payload)) {
      list = payload;
    } else if (payload?.recurringPayments) {
      list = payload.recurringPayments;
      setHasMore(Boolean(payload.hasMore));
    }
    setData((prev) => (append ? [...prev, ...list] : list));
  };

  const fetchPage = async (pageNum, append = false) => {
    const res = await getPayment(pageNum, PAGE_SIZE);
    applyListResponse(res, append);
    setPage(pageNum);
  };

  const fetchData = () => fetchPage(1, false);

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await fetchPage(page + 1, true);
    } catch (e) {
      notifyFailure(e.response?.data?.message || e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const newSubscription = async (e)=> {
    e.preventDefault()
    if (!newName.trim() || !newAmount || !newRepeatDuration || !newDate) {
      notifyFailure('Please fill all subscription fields');
      return;
    }
    const amount = Number(newAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      notifyFailure('Amount must be a positive number');
      return;
    }
    const paymentData = {
      name: newName.trim(),
      amount,
      repeatDuration: newRepeatDuration,
      date: newDate,
    };
    try {
      await createPayment(paymentData);
      notifySuccess("Added new subscription");
      setNewName('');
      setNewAmount('');
      setNewRepeatDuration('');
      setNewDate('');
      await fetchData();
    } catch (err) {
      notifyFailure(err.response?.data?.message);
    }
  }

  const deleteSubscription = async(id)=>{
    await deletePayment({rpayment_id:id}).then(()=>{
      notifySuccess("Succesfully deleted");
      fetchData()
    }).catch(e=>notifyFailure(e.response?.data?.message))
  }


  useEffect(() => {
    fetchData().catch((e) => notifyFailure(e.response?.data?.message));
  }, [])
  return (
    <>
    <ToastContainer />
      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">List of your Subscriptions</Card.Title>
              </Card.Header>
              <Card.Body className="table-full-width table-responsive px-0">
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">Serial No.</th>
                      <th className="border-0">Name</th>
                      <th className="border-0">Amount</th>
                      <th className="border-0">Repeat Duration</th>
                      <th className="border-0">Date</th>
                      <th className="border-0">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">No subscriptions yet</td>
                      </tr>
                    ) : data.map((subscription, index) => (
                        <SubscriptionRow
                          key={subscription._id || index}
                          sNo={index + 1}
                          name={subscription.name}
                          amount={subscription.amount}
                          repeatDuration={subscription.repeatDuration}
                          date={subscription.date}
                          deleteSubscription={deleteSubscription}
                          _id={subscription._id}
                        />
                    ))}

                  </tbody>
                </Table>
                {hasMore && (
                  <div className="text-center py-3">
                    <Button variant="outline-primary" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? 'Loading…' : 'Load more subscriptions'}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md="12">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Add Subscripton</Card.Title>
                <p className="card-category">
                  Simply fill out the form below to keep a track of your subscriptions
                </p>
              </Card.Header>
              <Form onSubmit={newSubscription}>
                <Row>
                  <Col className="pl-4" md="6">
                    <Form.Group>
                      <label>Name of subscription</label>
                      <Form.Control
                        placeholder="Name of the subscription"
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="5">
                    <Form.Group style={{marginLeft:"1rem"}}>
                      <label>Date</label>
                      <Form.Control
                        placeholder="Date"
                        type="date"
                        value={newDate}
                        onChange={e => setNewDate(e.target.value)}
                        required
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col className="pl-4" md="6">
                    <Form.Group>
                      <label>Amount</label>
                      <Form.Control
                        placeholder="Amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={newAmount}
                        onChange={e => setNewAmount(e.target.value)}
                        required
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="5">
                    <Form.Group style={{marginLeft:"1rem"}}>
                      <label>Repeat Duration</label>
                      <Form.Control as="select"
                        value={newRepeatDuration}
                        onChange={(e) => setNewRepeatDuration(e.target.value)}
                        required
                      >
                        <option value="">Choose...</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Annually">Annually</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-grid gap-2 pl-2">
                  <Button className="btn-fill pull-right" variant="success" type="submit">
                    Add Subscription
                  </Button>
                </div>
                <br />
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Typography;
