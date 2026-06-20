import React, { useState, useRef } from 'react';
import Modal from 'components/modelScan';
import { parseReceipt } from '../api/api';
import { parseReceiptWithOcr } from '../utils/receiptOcrFallback';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
  Spinner,
  Badge,
  ListGroup,
} from 'react-bootstrap';

function Scan() {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [parsedReceipt, setParsedReceipt] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);

  const notifySuccess = (message) => toast.success(message);
  const notifyFailure = (message = 'Something went wrong. Please try again.') =>
    toast.error(message);
  const notifyInfo = (message) => toast.info(message);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setParsedReceipt(null);
    setSelectedAmount(null);
  };

  const closeModal = () => setModalShow(false);

  const openConfirmModal = (amount) => {
    setSelectedAmount(amount);
    setModalShow(true);
  };

  const applyParsedResult = (data, successMessage) => {
    setParsedReceipt(data);
    setSelectedAmount(data.amount);
    notifySuccess(successMessage);
  };

  const runOcrFallback = async (file) => {
    setLoadingMessage('Running OCR fallback locally...');
    notifyInfo('AI unavailable — scanning with OCR fallback instead');

    const ocrResult = await parseReceiptWithOcr(file, (pct) => {
      setLoadingMessage(`OCR in progress... ${pct}%`);
    });

    applyParsedResult(
      ocrResult,
      'Receipt scanned with OCR — please verify amount and details'
    );
  };

  const handleScan = async () => {
    if (!selectedFile) {
      notifyFailure('Please upload a receipt image first');
      return;
    }

    setLoading(true);
    setLoadingMessage('Sending receipt to vision AI...');
    setParsedReceipt(null);

    try {
      const res = await parseReceipt(selectedFile);
      applyParsedResult(res.data, 'Receipt analyzed with AI — review the details below');
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.message ||
        err.message ||
        'AI receipt scan failed. Check your connection and try again.';

      const shouldFallback =
        data?.fallbackRecommended ||
        err.response?.status === 402 ||
        err.response?.status === 503;

      if (shouldFallback && selectedFile) {
        try {
          await runOcrFallback(selectedFile);
          return;
        } catch (ocrErr) {
          notifyFailure(ocrErr.message || 'OCR fallback also failed');
          return;
        }
      }

      notifyFailure(message);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleScanSuccess = () => {
    setParsedReceipt(null);
    setSelectedFile(null);
    setImagePreview('');
    setSelectedAmount(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const amountOptions = parsedReceipt
    ? [parsedReceipt.amount, ...(parsedReceipt.alternativeAmounts || [])].filter(
        (v, i, arr) => arr.indexOf(v) === i
      )
    : [];

  const confidenceVariant =
    parsedReceipt?.confidence === 'high'
      ? 'success'
      : parsedReceipt?.confidence === 'low'
      ? 'danger'
      : 'warning';

  const isAiSource = parsedReceipt?.source === 'openai-vision';
  const resultTitle = isAiSource ? 'AI Extraction Results' : 'OCR Extraction Results';

  return (
    <>
      <ToastContainer />
      <Container fluid>
        <Card className="text-center" border="dark">
          <Card.Header as="h3">AI Receipt Scanner</Card.Header>
          <Card.Body>
            <p className="text-muted mb-4">
              Upload a receipt photo and our AI will extract the merchant, amount, date, and
              category automatically. If AI is unavailable, OCR fallback runs in your browser.
            </p>

            <Row className="align-items-start">
              <Col md={6}>
                <Form.Group controlId="formFileReceipt" className="mb-3 text-start">
                  <Form.Label>Upload receipt (JPEG, PNG, WebP — max 5 MB)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleChange}
                    ref={fileInputRef}
                  />
                </Form.Group>

                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="my-2 img-fluid rounded border"
                    style={{ maxHeight: 360 }}
                    alt="Receipt preview"
                  />
                )}

                <Button
                  className="btn-fill mt-2"
                  variant="success"
                  onClick={handleScan}
                  disabled={!selectedFile || loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Scanning...
                    </>
                  ) : (
                    'Scan with AI'
                  )}
                </Button>
              </Col>

              <Col md={6} className="text-start">
                {loading && (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">
                      {loadingMessage || 'Processing receipt...'}
                      <br />
                      <small>This may take 5–30 seconds</small>
                    </p>
                  </div>
                )}

                {!loading && parsedReceipt && (
                  <Card border={isAiSource ? 'success' : 'warning'}>
                    <Card.Header className={isAiSource ? 'bg-success text-white' : 'bg-warning'}>
                      {resultTitle}
                      <Badge bg={confidenceVariant} className="ms-2 text-uppercase">
                        {parsedReceipt.confidence} confidence
                      </Badge>
                      {!isAiSource && (
                        <Badge bg="dark" className="ms-2">
                          OCR fallback
                        </Badge>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush" className="mb-3">
                        <ListGroup.Item>
                          <strong>Merchant:</strong> {parsedReceipt.merchant}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Amount:</strong> ₹{parsedReceipt.amount}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Date:</strong>{' '}
                          {parsedReceipt.date || 'Not detected — you can set it manually'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>Category:</strong> {parsedReceipt.category}
                        </ListGroup.Item>
                        {parsedReceipt.paymentMode && (
                          <ListGroup.Item>
                            <strong>Payment:</strong> {parsedReceipt.paymentMode}
                          </ListGroup.Item>
                        )}
                      </ListGroup>

                      {amountOptions.length > 1 && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-2">
                            Multiple amounts detected — pick the correct total:
                          </small>
                          {amountOptions.map((amt) => (
                            <Button
                              key={amt}
                              size="sm"
                              variant={
                                amt === (selectedAmount ?? parsedReceipt.amount)
                                  ? 'success'
                                  : 'outline-secondary'
                              }
                              className="me-2 mb-2"
                              onClick={() => setSelectedAmount(amt)}
                            >
                              ₹{amt}{' '}
                              {amt === parsedReceipt.amount && isAiSource && '✓'}
                            </Button>
                          ))}
                        </div>
                      )}

                      <Button
                        variant="success"
                        className="btn-fill"
                        onClick={() => openConfirmModal(selectedAmount ?? parsedReceipt.amount)}
                      >
                        Confirm &amp; Add Transaction
                      </Button>
                    </Card.Body>
                  </Card>
                )}

                {!loading && !parsedReceipt && (
                  <div className="text-muted py-4">
                    <i className="fas fa-robot fa-2x mb-3 d-block" />
                    Upload a clear, well-lit receipt and click <strong>Scan with AI</strong>.
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

      <Modal
        show={modalShow}
        onHide={closeModal}
        closeModel={closeModal}
        amount={selectedAmount}
        initialName={parsedReceipt?.merchant}
        initialCategory={parsedReceipt?.category}
        initialDate={parsedReceipt?.date || ''}
        initialPaymentMode={parsedReceipt?.paymentMode || ''}
        confidence={parsedReceipt?.confidence}
        lineItems={parsedReceipt?.lineItems}
        aiParsed={Boolean(parsedReceipt)}
        onSuccess={handleScanSuccess}
      />
    </>
  );
}

export default Scan;
