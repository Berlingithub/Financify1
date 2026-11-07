import React, { useState, useEffect } from "react";
import { getGoal, setGoal, deleteGoal, addAmount, completeGoal } from '../api/api';
import Goals from "../components/Goals";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

var moment = require('moment');
// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Form,
  ProgressBar,
  Container,
  Row,
  Col,
} from "react-bootstrap";

function Maps() {

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

  const [allGoals, setAllGoals] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newtargetAmount, setNewtargetAmount] = useState("");
  const [newcurrentAmount, setNewcurrentAmount] = useState("");
  const [newendDate, setNewendDate] = useState("");
  const [newcompleted, setNewcompleted] = useState("");

  const GOAL_PAGE_SIZE = 20;

  const applyGoalsResponse = (res, append) => {
    const payload = res.data;
    let list = [];
    if (Array.isArray(payload)) {
      list = payload;
    } else if (payload?.goals) {
      list = payload.goals;
      setHasMore(Boolean(payload.hasMore));
    }
    setAllGoals((prev) => (append ? [...prev, ...list] : list));
  };

  const fetchGoalsPage = async (pageNum, append = false) => {
    const res = await getGoal(pageNum, GOAL_PAGE_SIZE);
    applyGoalsResponse(res, append);
    setPage(pageNum);
  };

  const fetchGoals = () => fetchGoalsPage(1, false);

  const loadMoreGoals = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      await fetchGoalsPage(page + 1, true);
    } catch (e) {
      notifyFailure(e.response?.data?.message || e.message);
    } finally {
      setLoadingMore(false);
    }
  };
  const createNewGoal = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    if (!newGoal || !newtargetAmount) {
      notifyFailure("Please enter a goal name and target amount")
      return
    }
    
    const targetAmt = parseFloat(newtargetAmount)
    const currentAmt = newcurrentAmount === '' ? 0 : parseFloat(newcurrentAmount)
    
    if (isNaN(targetAmt) || targetAmt <= 0) {
      notifyFailure("Target amount must be a positive number")
      return
    }
    
    if (isNaN(currentAmt) || currentAmt < 0) {
      notifyFailure("Current amount must be a non-negative number")
      return
    }
    
    if (currentAmt > targetAmt) {
      notifyFailure("Current amount cannot be greater than target amount")
      return
    }
    
    const goalData = { 
      goal: newGoal.trim(), 
      targetAmount: targetAmt, 
      currentAmount: currentAmt, 
      endDate: newendDate, 
      completed: false 
    }
    
    console.log('Creating goal:', goalData)
    
    await setGoal(goalData)
      .then(() => {
        notifySuccess("Successfully Added New Goal")
        // Clear form
        setNewGoal("")
        setNewtargetAmount("")
        setNewcurrentAmount("")
        setNewendDate("")
        fetchGoals()
      })
      .catch(e => {
        console.error('Error creating goal:', e)
        notifyFailure(e.response?.data?.message || "Failed to create goal. Please check your input.")
      })
  }
  const deleteOneGoal = async (goals_id)=>{
    console.log("trying to delete")
    await deleteGoal({goals_id}).then(()=>{
      notifySuccess("Successfully Deleted")
      fetchGoals()
    }).catch(e=>notifyFailure())
  }
  const updateCurrentAmount = async(id,amount)=>{
    if (Number.isNaN(amount) || amount <= 0) {
      notifyFailure('Enter a positive amount to add');
      return;
    }
    await addAmount({ goals_id:id,amountToBeAdded:amount }).then(()=>{
      notifySuccess("Successfully Updated")
      fetchGoals()
    }).catch(e=>notifyFailure(e.response?.data?.message))
  }
  const markCompleted=async(id)=>{
    await completeGoal({goals_id:id}).then(res=>{
      console.log(res.data)
      fetchGoals()
      notifySuccess("Marked Completed")
    }).catch(e=>notifyFailure())
  }

  useEffect(() => {
    fetchGoals()
  }, [])
  /* { goal: newGoal, targetAmount: newtargetAmount, currentAmount: newcurrentAmount, endDate: newendDate, completed: false } */

  return (
    <>
      <ToastContainer />
      <Container fluid>
        <Row>
          <Col md="12">
          {allGoals.map(goal=>{
            return (
              <Goals
              key={goal._id}
              goal={goal.goal}
              targetAmount={goal.targetAmount}
              currentAmount={goal.currentAmount}
              endDate={goal.endDate}
              completed={goal.completed}
              startDate={goal.startDate}
              goals_id={goal._id}
              updateAmount={updateCurrentAmount}
              deleteGoal={deleteOneGoal}
              markCompleted={markCompleted}
              />
            )
          })
          }
          {hasMore && (
            <div className="text-center py-3">
              <Button variant="outline-primary" onClick={loadMoreGoals} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more goals'}
              </Button>
            </div>
          )}

          </Col>
          <Col md="12">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Add New Goal</Card.Title>
                <p className="card-category">
                  This will help you to manage your finance goals.
                </p>
              </Card.Header>
              <Form>
                <Row>
                  <Col className="pl-4" md="6">
                    <Form.Group>
                      <label>Goal Description</label>
                      <Form.Control
                        placeholder="Goal aim"
                        type="text"
                        value={newGoal}
                        required
                        onChange={(e)=>setNewGoal(e.target.value)}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="5">
                    <Form.Group style={{marginLeft:"1rem"}}>
                      <label>Deadline</label>
                      <Form.Control
                        placeholder="Date"
                        type="date"
                        onChange={(e)=>setNewendDate(e.target.valueAsDate)}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col className="pl-4" md="6">
                    <Form.Group>
                      <label>Currently Saved</label>
                      <Form.Control
                        placeholder="Goal amount"
                        type="number"
                        value={newcurrentAmount}
                        onChange={(e)=>setNewcurrentAmount(e.target.value)}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="5">
                    <Form.Group style={{marginLeft:"1rem"}}>
                      <label>Target Amount</label>
                      <Form.Control
                        placeholder="Goal amount"
                        type="number"
                        value={newtargetAmount}
                        onChange={(e)=>setNewtargetAmount(e.target.value)}
                      ></Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-grid gap-2 pl-2">
                  <Button className="btn-fill pull-right" variant="success" onClick={createNewGoal}>
                    Add Goal
                  </Button>
                </div>
                <br></br>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Maps;
