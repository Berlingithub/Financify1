import React, { useState } from 'react'

import {
  Button,
  Card,
  Form,
  ProgressBar,
} from "react-bootstrap";
var moment = require('moment');

export default function Goals(props) {
  const target = Number(props.targetAmount) || 0;
  const current = Number(props.currentAmount) || 0;
  const percentage = target > 0
    ? Math.min(100, Math.round((current / target) * 100))
    : 0;
  const id = props.goals_id;
  const endDate = props.endDate ? moment(props.endDate) : null;
  const daysLeft = endDate?.isValid()
    ? endDate.diff(moment(), 'days') + 1
    : null;
  const [amountToAdd, setAmountToAdd] = useState('');
  const barColor = props.completed ? "success" : "primary";


  return (
    <>
      <Card >
        <Card.Header>
          <Card.Title as="h3" >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>{props.goal}
               {!props.completed && daysLeft != null && (
                 <Button className="mx-2 btn btn-sm btn-fill">{Math.max(0, daysLeft)} Days Left</Button>
               )}
              </div>
              <div>
                {!props.completed && (
                <Button className="btn btn-fill mx-1 btn-primary btn-sm"
                  onClick={() => props.markCompleted(id)}
                >Mark as completed</Button>
                )}
              </div>
            </div>
          </Card.Title>
        </Card.Header>

        <Card.Body>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px" }}>
            <div>
              <span style={{ color: "red" }}> Currently Saved: {props.currentAmount} </span>
            </div>
            <div>
              <span style={{ color: "green" }}> Goal Amount: {props.targetAmount}</span>
            </div>
          </div>
          <div className="progressBar my-1" style={{ fontSize: "15px" }}>
            <ProgressBar animated variant={barColor} now={percentage} label={`${percentage}% completed`} />
          </div>
          <div className="mt-2">
            <Form className="form-inline float-right">
              <Form.Control
                placeholder="Add Amount"
                type="number"
                min="0"
                step="0.01"
                value={amountToAdd}
                onChange={(e) => setAmountToAdd(e.target.value)}
              ></Form.Control>
              <Button className="btn btn-fill mx-1"
                onClick={() => {
                  const amt = parseFloat(amountToAdd);
                  if (Number.isNaN(amt) || amt <= 0) return;
                  props.updateAmount(id, amt);
                  setAmountToAdd('');
                }}
              >Add Money</Button>
              <Button className="btn btn-fill mx-1 btn-danger" onClick={() => props.deleteGoal(id)}>Delete Goal</Button>
            </Form>
            {endDate?.isValid() && (
              <span>Deadline: {endDate.format("DD/MM/YYYY")} </span>
            )}
            <br />
            <span>Date set: {moment(props.startDate).format("DD/MM/YYYY")} </span>
          </div>
        </Card.Body>
      </Card>
    </>
  )
}
