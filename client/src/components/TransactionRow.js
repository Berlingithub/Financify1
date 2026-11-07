import React, { useState } from 'react'
import {
    Button,
    Form,
    Modal,
    Row,
    Col,
    OverlayTrigger,
    Tooltip
} from "react-bootstrap";
import moment from 'moment';

const CATEGORIES = [
  'Household', 'Electronics', 'Fashion', 'Sports and Fitness',
  'Automobile', 'Baby Care', 'Others',
];

const PAYMENT_MODES = [
  'credit card', 'debit card', 'cash', 'bitcoin', 'net banking', 'UPI', 'digital wallets', 'others',
];

export default function TransactionRow(props) {
    const id = props._id
    const [showEdit, setShowEdit] = useState(false);
    const [editName, setEditName] = useState(props.name);
    const [editAmount, setEditAmount] = useState(String(props.amount));
    const [editCategory, setEditCategory] = useState(props.category);
    const [editPaymentMode, setEditPaymentMode] = useState(props.paymentMode);
    const [editDate, setEditDate] = useState(
      props.date ? moment(props.date).format('YYYY-MM-DD') : ''
    );
    const [saving, setSaving] = useState(false);

    const openEdit = () => {
      setEditName(props.name);
      setEditAmount(String(props.amount));
      setEditCategory(props.category);
      setEditPaymentMode(props.paymentMode);
      setEditDate(props.date ? moment(props.date).format('YYYY-MM-DD') : '');
      setShowEdit(true);
    };

    const saveEdit = async (e) => {
      e.preventDefault();
      if (!props.onUpdate) return;
      setSaving(true);
      try {
        await props.onUpdate({
          transaction_id: id,
          name: editName.trim(),
          amount: Number(editAmount),
          category: editCategory,
          paymentMode: editPaymentMode,
          date: editDate ? new Date(editDate) : undefined,
        });
        setShowEdit(false);
      } finally {
        setSaving(false);
      }
    };

    return (
        <>
        <tr>
            <td>{props.sNo}</td>
            <td>{props.name}</td>
            <td>{props.amount}</td>
            <td>{props.category}</td>
            <td>{props.paymentMode}</td>
            <td>{moment(props.date).format("DD/MM/YY  HH:mm")}</td>
            <td className="td-actions">
                {props.onUpdate && (
                <OverlayTrigger
                    overlay={
                        <Tooltip id={`edit-${id}`}>
                            Edit Transaction
                        </Tooltip>
                    }
                >
                    <Button
                        className="btn-simple btn-link p-1"
                        type="button"
                        variant="info"
                        onClick={openEdit}
                    >
                        <i className="fas fa-edit"></i>
                    </Button>
                </OverlayTrigger>
                )}
                <OverlayTrigger
                    overlay={
                        <Tooltip id={`del-${id}`}>Remove Transaction</Tooltip>
                    }
                >
                    <Button
                        className="btn-simple btn-link p-1"
                        type="button"
                        variant="danger"
                        onClick={() => props.deleteTransaction(id)}
                    >
                        <i className="fas fa-times"></i>
                    </Button>
                </OverlayTrigger>
            </td>
        </tr>

        <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Transaction</Modal.Title>
          </Modal.Header>
          <Form onSubmit={saveEdit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control type="number" min="0" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control as="select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment mode</Form.Label>
                    <Form.Control as="select" value={editPaymentMode} onChange={(e) => setEditPaymentMode(e.target.value)} required>
                      {PAYMENT_MODES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEdit(false)} disabled={saving}>Cancel</Button>
              <Button variant="success" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </Modal.Footer>
          </Form>
        </Modal>
        </>
    )
}
