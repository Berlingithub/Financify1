import React, { useState, useEffect } from 'react';
import { createTransaction } from '../api/api';
import { Modal, Button, Form, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';

const CONFIDENCE_LABELS = {
  high: { text: 'High confidence', variant: 'success' },
  medium: { text: 'Medium confidence', variant: 'warning' },
  low: { text: 'Low confidence — please verify', variant: 'danger' },
};

export default function ModelScan(props) {
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newPaymentMode, setNewPaymentMode] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (props.show) {
      setNewName(props.initialName || '');
      setNewCategory(props.initialCategory || '');
      setNewDate(props.initialDate || '');
      setNewPaymentMode(props.initialPaymentMode || '');
      setAmount(props.amount != null ? String(props.amount) : '');
    }
  }, [
    props.show,
    props.initialName,
    props.initialCategory,
    props.initialDate,
    props.initialPaymentMode,
    props.amount,
  ]);

  const confidenceMeta = CONFIDENCE_LABELS[props.confidence] || CONFIDENCE_LABELS.medium;

  const newTransaction = async (e) => {
    e.preventDefault();

    if (!newName.trim() || !newCategory || !newPaymentMode || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await createTransaction({
        name: newName.trim(),
        category: newCategory,
        amount: Number(amount),
        date: newDate ? new Date(newDate) : new Date(),
        paymentMode: newPaymentMode,
      });
      toast.success('Transaction added from receipt');
      props.onSuccess?.();
      props.closeModel();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header closeButton>
        <span className="h3 b2">Confirm AI-Detected Transaction</span>
      </Modal.Header>
      <Modal.Body>
        {props.aiParsed && (
          <div className="mb-3">
            <Badge bg={confidenceMeta.variant} className="me-2">
              {confidenceMeta.text}
            </Badge>
            <small className="text-muted">Review and edit fields before saving.</small>
          </div>
        )}
        <Form onSubmit={newTransaction}>
          <Form.Group className="mb-3">
            <Form.Label>Merchant / Name</Form.Label>
            <Form.Control
              placeholder="Name of the transaction"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Amount
                  {props.aiParsed && (
                    <span style={{ marginLeft: '8px', color: 'green', fontWeight: 'bold' }}>
                      ✓ AI Detected
                    </span>
                  )}
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  as="select"
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
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Mode of Payment</Form.Label>
                <Form.Control
                  as="select"
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

          {props.lineItems?.length > 0 && (
            <div className="mb-3">
              <Form.Label>Detected line items</Form.Label>
              <ul className="small text-muted mb-0">
                {props.lineItems.map((item, i) => (
                  <li key={i}>
                    {item.description}
                    {item.amount > 0 ? ` — ₹${item.amount}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            className="btn-fill pull-right"
            variant="success"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Add Transaction'
            )}
          </Button>
          <Button
            className="btn-fill pull-right me-2"
            variant="info"
            type="button"
            onClick={props.closeModel}
            disabled={submitting}
          >
            Close
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
