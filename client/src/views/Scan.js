import React,{useState} from 'react';
import Tesseract from 'tesseract.js';
import Modal from "components/modelScan";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Badge,
    Button,
    Card,
    Form,
    Navbar,
    Nav,
    Table,
    Container,
    Row,
    Col,
    OverlayTrigger,
    Tooltip
} from "react-bootstrap";
import { Spinner } from 'react-bootstrap';

function Scan() {
    const [modalShow, setModalShow] = useState(false);
    const [imagePath, setImagePath] = useState("");
    const [text, setText] = useState("");
    const [confidence,setConfidence]=useState("");
    const [loading,setLoading]=useState(false);
    const [five,setFive]=useState([]);
    const [modalNumber,setmodalNumber]=useState(0);
    const [recommendedAmount, setRecommendedAmount] = useState(null);

const notifySuccess = (message) => toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      });
const notifyFailure = ()=>toast.error("An Error Occured", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      });

const handleChange = (event) => {
        setImagePath(URL.createObjectURL(event.target.files[0]));
    }
const closeModel = ()=>{
      setModalShow(false)
    }

const handleClick = () => {
        // Validate that an image is selected
        if (!imagePath) {
            notifyFailure("Please upload a receipt image first");
            return;
        }

        setLoading(true);
        notifySuccess("Job started, it may take few minutes");
        
        Tesseract.recognize(
          imagePath, 'eng',
          { 
            logger: m => console.log(m) 
          }
        )
        .catch(err => {
          console.error('OCR Error:', err);
          setLoading(false);
          notifyFailure("Failed to process image. Please try again.");
        })
        .then(result => {
          setLoading(false);
          
          // Validate result exists
          if (!result || !result.data) {
            notifyFailure("No text detected in image");
            return;
          }
          
          const confidence = result.data.confidence;
          const text = result.data.text;
          notifySuccess("Job completed");
          setText(text);
          const analyzedData = analyzeResult(result.data);
          setFive(analyzedData);
          setConfidence(confidence);
          
          // Set the first (most likely) amount as recommended
          if (analyzedData && analyzedData.length > 0) {
            setRecommendedAmount(analyzedData[0]);
          }
        });
      }
    
      const analyzeResult = (data) => {
        console.log('=== TESSERACT ANALYSIS START ===');
        console.log('Full Tesseract data:', JSON.stringify(data, null, 2));
        
        // Validate data exists
        if (!data) {
            console.warn('No data available from Tesseract');
            return [];
        }
        
        const text = data.text || '';
        console.log('Extracted text:', text);
        
        // Try multiple possible structures for Tesseract output
        const words = data.words || (data.line_data && data.line_data.words) || [];
        
        if (!Array.isArray(words) || words.length === 0) {
            console.warn('No words array found, using TEXT-BASED fallback extraction');
            
            // Fallback: Extract numbers directly from the text with context analysis
            const allNumbersFromText = [];
            
            // First: Look for BILL AMOUNT pattern (HIGHEST PRIORITY)
            const billAmountMatch = text.match(/(?:bill\s+amount|total\s+amount|grand\s+total|net\s+amount|balance)\s*[:\-\.]?\s*(?:rs\.?|inr|\$|€|£|₹)?\s*(\d+)/i);
            if (billAmountMatch && billAmountMatch[1]) {
                const amount = parseInt(billAmountMatch[1]);
                console.log('✅ FOUND BILL/TOTAL AMOUNT:', amount);
                allNumbersFromText.push(amount);
            }
            
            // Second: Extract all other numbers for context
            const numberMatches = text.match(/\b\d+\b/g);
            if (numberMatches) {
                const numbers = numberMatches.map(n => parseInt(n)).filter(n => !isNaN(n));
                console.log('All numbers found in text:', numbers);
                
                // Filter aggressively
                const filtered = numbers.filter(num => {
                    // Keep detected amount if found
                    if (allNumbersFromText.length > 0 && num === allNumbersFromText[0]) {
                        return true;
                    }
                    
                    // Remove large numbers (5+ digits - bill/invoice numbers)
                    if (num >= 10000) {
                        console.log('❌ Filtering large number (bill#):', num);
                        return false;
                    }
                    
                    // Remove single digits
                    if (num < 10) {
                        console.log('❌ Filtering single digit:', num);
                        return false;
                    }
                    
                    // Check specific patterns
                    const textLower = text.toLowerCase();
                    
                    // Bill number check
                    if ((textLower.includes('bill #') || textLower.includes('bill#')) && 
                        text.includes(num.toString())) {
                        const billNumMatch = text.match(/bill\s*#?\s*(\d+)/i);
                        if (billNumMatch && parseInt(billNumMatch[1]) === num) {
                            console.log('❌ Filtering bill number:', num);
                            return false;
                        }
                    }
                    
                    // Table number check
                    if (textLower.includes('table') && text.includes(num.toString())) {
                        const tableMatch = text.match(/table\s*#?\s*(\d+)/i);
                        if (tableMatch && parseInt(tableMatch[1]) === num) {
                            console.log('❌ Filtering table number:', num);
                            return false;
                        }
                    }
                    
                    // Waiter/wait staff check
                    if (textLower.includes('wait') && text.includes(num.toString())) {
                        const waitMatch = text.match(/wait(?:er|ress)?\s*#?\s*(\d+)/i);
                        if (waitMatch && parseInt(waitMatch[1]) === num) {
                            console.log('❌ Filtering waiter number:', num);
                            return false;
                        }
                    }
                    
                    // Date/time check (simple heuristic)
                    if (num <= 31 && (text.includes('/') || text.includes('-'))) {
                        console.log('❌ Filtering possible date component:', num);
                        return false;
                    }
                    
                    return true;
                });
                
                // Combine: detected amount first, then other candidates
                const uniqueFiltered = [...new Set(filtered)];
                const sorted = uniqueFiltered.sort((a, b) => b - a);
                
                // Put detected amount FIRST
                const finalCandidates = allNumbersFromText.length > 0 
                    ? [allNumbersFromText[0], ...sorted.filter(n => n !== allNumbersFromText[0])]
                    : sorted;
                
                console.log('Final candidates (fallback):', finalCandidates);
                return finalCandidates.slice(0, 3);
            }
            
            return [];
        }

        // If we have words array (original logic)
        console.log('Using WORDS-BASED analysis');
        
        // Extract all numbers with their context
        const allNumbers = [];
        const wordsArray = words.map(word => {
            const num = parseInt(word.text);
            if (!Object.is(NaN, num)) {
                allNumbers.push({
                    value: num,
                    text: word.text,
                    bbox: word.bbox
                });
            }
            return num;
        });
        
        const numbers = allNumbers.filter(item => !Object.is(NaN, item.value));
        
        // Find amounts using patterns (highest priority)
        let detectedAmounts = [];
        
        // First priority: Look for "BILL AMOUNT" or similar patterns
        const billAmountMatch = text.match(/(?:bill\s+amount|total|grand\s+total|net\s+amount|balance)\s*[:\-\.]?\s*(?:rs\.?|inr|\$|€|£|₹)?\s*(\d+)/i);
        if (billAmountMatch && billAmountMatch[1]) {
            const amount = parseInt(billAmountMatch[1]);
            if (!isNaN(amount) && amount > 0) {
                detectedAmounts.push(amount);
                console.log('✅ Found bill/total amount:', amount);
            }
        }
        
        // Second priority: Currency symbol patterns
        if (detectedAmounts.length === 0) {
            const currencyMatch = text.match(/(?:rs\.?|inr|\$|€|£|₹)\s*(\d+(?:\.\d{2})?)/i);
            if (currencyMatch && currencyMatch[1]) {
                const amount = parseInt(currencyMatch[1]);
                if (!isNaN(amount) && amount > 0) {
                    detectedAmounts.push(amount);
                    console.log('Found currency amount:', amount);
                }
            }
        }
        
        // Third priority: Other amount patterns
        if (detectedAmounts.length === 0) {
            const amountPatterns = [
                /(\d+(?:\.\d{2})?)\s*(?:only)/i,
                /(?:cash|card|paid)\s*[:\-]?\s*(\d+)/i,
            ];
            for (const pattern of amountPatterns) {
                const matches = text.match(pattern);
                if (matches && matches[1]) {
                    const amount = parseInt(matches[1]);
                    if (!isNaN(amount) && amount > 0) {
                        detectedAmounts.push(amount);
                        console.log('Found amount via pattern:', amount);
                    }
                }
            }
        }
        
        // Filter out numbers that match exclusion patterns
        const filteredNumbers = numbers.filter(item => {
            const numStr = item.value.toString();
            
            // Skip very large numbers (likely bill/invoice numbers) - anything 5+ digits
            if (item.value >= 10000) {
                console.log('❌ Filtering large number:', item.value);
                return false;
            }
            
            // If we found detected amounts, only keep those
            if (detectedAmounts.length > 0) {
                return detectedAmounts.includes(item.value);
            }
            
            // Skip single digits (usually table numbers, wait staff, etc.)
            if (item.value < 10) {
                console.log('❌ Filtering small number:', item.value);
                return false;
            }
            
            // Check against exclusion patterns in text
            const textLower = text.toLowerCase();
            
            // Check if near bill/invoice keywords
            if (textLower.includes('bill #') || textLower.includes('bill#')) {
                const billMatch = text.match(/bill\s*#?\s*(\d+)/i);
                if (billMatch && billMatch[1] === numStr) {
                    console.log('❌ Filtering bill number:', item.value);
                    return false;
                }
            }
            
            // Check if near table keyword
            if (textLower.includes('table')) {
                const tableMatch = text.match(/table\s*#?\s*(\d+)/i);
                if (tableMatch && tableMatch[1] === numStr) {
                    console.log('❌ Filtering table number:', item.value);
                    return false;
                }
            }
            
            // Check if near wait/waiter keyword
            if (textLower.includes('wait')) {
                const waitMatch = text.match(/wait(?:er|ress)?\s*#?\s*(\d+)/i);
                if (waitMatch && waitMatch[1] === numStr) {
                    console.log('❌ Filtering waiter number:', item.value);
                    return false;
                }
            }
            
            return true;
        });
        
        // Combine detected amounts with filtered numbers
        const candidates = [...new Set([...detectedAmounts, ...filteredNumbers.map(n => n.value)])];
        
        // Sort by likelihood: detected amounts first, then by value (descending)
        candidates.sort((a, b) => {
            // Prioritize amounts found via patterns
            const aIsDetected = detectedAmounts.includes(a);
            const bIsDetected = detectedAmounts.includes(b);
            
            if (aIsDetected && !bIsDetected) return -1;
            if (!aIsDetected && bIsDetected) return 1;
            
            // Then sort by value (prefer larger amounts as they're more likely to be totals)
            return b - a;
        });
        
        console.log('Final candidate amounts (words-based):', candidates);
        console.log('=== TESSERACT ANALYSIS END ===');
        
        // Return top 3 candidates
        return candidates.slice(0, 3);
      }
    return (
        <>
        <ToastContainer />

        <Card className="text-center" border="dark" style={{ width: 'auto' }}>
        <Card.Header as="h3">Scan Your Receipts</Card.Header>
        <hr></hr>
        <Row>
          <Col md="6">
            <Card.Body>
              <Form.Group controlId="formFileLg" className="mb-3">
                <Form.Label>Click to upload</Form.Label>
                <Form.Control type="file" size="lg" onChange={handleChange} />
              </Form.Group>
            </Card.Body>
          </Col>
          {five && five.length > 0 && five.map((one, index) => {
            const isRecommended = (one === recommendedAmount);
            return (
              <Col style={{marginLeft: '1rem'}} key={index}>
              <Button 
                className="btn-fill pull-right" 
                variant={isRecommended ? "success" : "info"}
                onClick={() =>{
                  setmodalNumber(one)
                  setModalShow(true)
                }}>
                {one} {isRecommended && "✓"}
              </Button>
              <Modal 
                closeModel={closeModel} 
                amount={modalNumber} 
                isRecommended={isRecommended}
                show={modalShow} 
                onHide={() => setModalShow(false)}
              />
            </Col>
            )
            }
          )
          }
          {five && five.length > 0 && (
            <Col md="12" className="mt-2">
              <small className="text-muted">
                💡 Green button = AI's top pick for bill amount. Click any button to create a transaction.
              </small>
            </Col>
          )}

        </Row>
        <Row>
          <Col md="6">
            <Card.Body>
            <Button className="btn-fill pull-right" variant="success" type="submit" onClick={handleClick}>Convert To Text</Button>
            <div>
              <br></br>
              {imagePath && <img src={imagePath} className="my-2" style={{width:400}} alt="Receipt preview" />}
            </div>
            </Card.Body>
          </Col>
          <Col classname="pl-5" md="6" >
              {loading ? <Spinner /> : <div>
                { confidence && <h5>Conversion accuracy = {confidence}%</h5>}
                <p>{text}</p>
              </div>}
          </Col>
        </Row>
        </Card>
        </>
    )
}

export default Scan;
