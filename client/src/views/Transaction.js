import React, { useState, useEffect, useCallback } from "react";
import TransactionRow from "../components/TransactionRow.js";
import { getTransaction, createTransaction, updateTransaction, deleteTransaction } from '../api/api';
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

const PAGE_SIZE = 50;

function TableList() {

  const notifySuccess = (message) => toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    });
  const notifyFailure = (message = "An Error Occurred") => toast.error(message, {
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
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newPaymentMode, setNewPaymentMode] = useState("");

  const transactionData = {
    name: newName, category: newCategory, amount: newAmount, date: newDate, paymentMode: newPaymentMode
  }

  const applyListResponse = useCallback((res, append) => {
    const payload = res.data;
    let list = [];
    if (Array.isArray(payload)) {
      list = payload;
    } else if (payload?.transactions) {
      list = payload.transactions;
      setHasMore(Boolean(payload.hasMore));
      setTotalCount(payload.totalTransactions ?? list.length);
    }
    setData((prev) => (append ? [...prev, ...list] : list));
  }, []);

  const fetchPage = async (pageNum, append = false) => {
    const res = await getTransaction(pageNum, PAGE_SIZE);
    applyListResponse(res, append);
    setPage(pageNum);
  };

  const refreshList = async () => {
    await fetchPage(1, false);
  };

  useEffect(() => {
    refreshList().catch((e) => notifyFailure(e.response?.data?.message || e.message));
  }, []);

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

  const newTransaction = (e) => {
    e.preventDefault()
    if (!newName || !newAmount || !newCategory || !newPaymentMode) {
      notifyFailure("Please fill all required fields")
      return
    }
    createTransaction(transactionData).then(async () => {
      await refreshList()
      notifySuccess("Successfully Added")
      setNewName("")
      setNewAmount("")
      setNewCategory("")
      setNewPaymentMode("")
      setNewDate("")
    }).catch((e) => notifyFailure(e.response?.data?.message || e.message))
  }

  const updateTrans = async (payload) => {
    try {
      await updateTransaction(payload);
      await refreshList();
      notifySuccess("Successfully Updated");
    } catch (e) {
      notifyFailure(e.response?.data?.message || e.message);
      throw e;
    }
  }

  const deleteTrans = async (id) => {
    const body = { transaction_id: id }
    deleteTransaction(body).then(async () => {
      await refreshList()
      notifySuccess("Successfully Deleted")
    }).catch((e) => notifyFailure(e.response?.data?.message || e.message))
  }


  return (
    <>
      <ToastContainer />

      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Manage all your transactions</Card.Title>
                <p className="card-category">
                  Keep a check of all your spendings.
                  {totalCount > 0 && (
                    <span className="ms-2 text-muted">({data.length} of {totalCount} shown)</span>
                  )}
                </p>
              </Card.Header>
              <Card.Body className="table-full-width table-responsive px-0">
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">Serial No.</th>
                      <th className="border-0">Name</th>
                      <th className="border-0">Amount</th>
                      <th className="border-0">Category</th>
                      <th className="border-0">Mode of Payment</th>
                      <th className="border-0">Date</th>
                      <th className="border-0">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data && data.length > 0 ? data.map((transaction, index) => {
                      return (
                        <TransactionRow
                          key={transaction._id || index}
                          sNo={index+1}
                          name={transaction.name}
                          amount={transaction.amount}
                          category={transaction.category}
                          date={transaction.date}
                          paymentMode={transaction.paymentMode}
                          deleteTransaction={deleteTrans}
                          onUpdate={updateTrans}
                          _id={transaction._id}
                        />
                      )
                    }) : (
                      <tr>
                        <td colSpan="7" className="text-center">No transactions found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {hasMore && (
                  <div className="text-center py-3">
                    <Button variant="outline-primary" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? 'Loading…' : 'Load more transactions'}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>


          <Col md="12">
            <h3>Add New Transaction</h3>
            <Form>
              <Form.Group>
                <Form.Label>Name</Form.Label>
                <Row>
                  <Col>
                    <Form.Control placeholder="Name of the Transaction"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    ></Form.Control>
                  </Col>
                </Row>
              </Form.Group>
              <Row>
                <Col md="6">
                  <Form.Group controlId="formGridNum">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter the Amount"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      placeholder="Date"
                      type="date"
                      onChange={e => setNewDate(e.target.valueAsDate)}
                    ></Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <Form.Group controlId="formGridCat">
                    <Form.Label>Category</Form.Label>
                    <Form.Control as="select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      required
                    >
                      <option value="">Choose...</option>
                      <option value="Household">Household</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Sports and Fitness">Sports and Fitness</option>
                      <option value="Automobile">Automobile</option>
                      <option value="Baby Care">Baby Care</option>
                      <option value="Others">Others</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group>
                    <Form.Label>Mode of Payment</Form.Label>
                    <Form.Control as="select"
                      value={newPaymentMode}
                      onChange={(e) => setNewPaymentMode(e.target.value)}
                      required
                    >
                      <option value="">Choose...</option>
                      <option value="credit card">Credit Card</option>
                      <option value="debit card">Debit Card</option>
                      <option value="cash">Cash</option>
                      <option value="bitcoin">Bitcoin</option>
                      <option value="UPI">UPI</option>
                      <option value="net banking">Net Banking</option>
                      <option value="digital wallets">Digital Wallets</option>
                      <option value="others">Others</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
              <Button  className="btn-fill pull-right" variant="success" type="button" onClick={newTransaction}>
                Submit
              </Button>
              <br />
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default TableList;
