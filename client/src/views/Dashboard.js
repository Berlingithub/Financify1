import React, { useState, useEffect } from "react";
import ChartistGraph from "react-chartist";
import TransactionRow from "components/TransactionRow";
import { getOverview, deleteTransaction } from '../api/api';
import OverviewGoalsRow from "components/OverviewGoalsRow";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
var moment = require('moment');

// react-bootstrap components
import {
  Card,
  Table,
  Container,
  Row,
  Col,
} from "react-bootstrap";


function Dashboard() {

  const notifySuccess = (message) => toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
  const notifyFailure = () => toast.error("An Error Occured", {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  const [data, setData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const IncomeTime = moment(data.monthlyIncomeDate).format('DD') 
  const TimeNow = moment().format('DD')
  let diff = TimeNow-IncomeTime;
  if(diff<0){
    // diff = 30-(Math.abs((IncomeTime-TimeNow)))
    diff = moment().daysInMonth()- Math.abs(diff);
  }

  const getData = async () => {
    try {
      const res = await getOverview();
      setData(res.data);
      setLastUpdated(new Date());
    } catch (e) {
      notifyFailure();
    }
  };

  const categoryBreakdown = data.categoryBreakdown || { labels: [], series: [], totals: {} };
  const chartLabels = categoryBreakdown.labels?.length
    ? categoryBreakdown.labels.map((label, i) => `${label} (${categoryBreakdown.series[i]}%)`)
    : ['No data'];
  const chartSeries = categoryBreakdown.series?.length ? categoryBreakdown.series : [1];
  const legendColors = ['text-info', 'text-danger', 'text-warning', 'text-success', 'text-primary', 'text-secondary'];

  const deleteTrans = async (id) => {
    const data = { transaction_id: id }
    deleteTransaction(data).then(async res => {
      await getData()
      notifySuccess("Successfully Deleted")
    }).catch(e => notifyFailure())
  }


  useEffect(() => {
    getData();

    const interval = setInterval(() => {
      getData();
    }, 60000);

    return () => clearInterval(interval);
  }, [])

  // Helper function to format "time ago"
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <>
      <ToastContainer />

      <Container fluid>
        <Row>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-chart text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Total Amount Spent </p>
                      <Card.Title as="h4">₹ {data.totalAmountSpent ?? 0}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i> 
                  This Month
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-light-3 text-success"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Monthly Income</p>
                      <Card.Title as="h4">₹ {data.monthlyIncome}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i>
                  This Month
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-vector text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">No. of Transactions</p>
                      <Card.Title as="h4">{data.transactionsCount ?? 0}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  {/* <i class="far fa-money-bill-alt mr-1"></i> */}
                  <i className="far fa-money-bill-alt mr-1"></i> 
                  This Month
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-favourite-28 text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Recurring Payments</p>
                      <Card.Title as="h4">{data.recurringCount}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                                  <div className="stats">
                    <i className="far fa-money-bill-alt mr-1"></i>
                    This Month
                  </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Recent Transactions</Card.Title>
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
                    {data.recentTransactions?.length ? data.recentTransactions.map((transaction, index) => {
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
                          _id={transaction._id}
                        />
                      )
                    })

                    : (
                      <tr>
                        <td colSpan="7" className="text-center">No transactions this month</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          <Col md="4">

            <Card>
              <Card.Header>
                <Card.Title as="h4">Categories</Card.Title>
                <p className="card-category">Spending by category this month</p>
              </Card.Header>
              <Card.Body>
                <div
                  className="ct-chart ct-perfect-fourth"
                  id="chartPreferences"
                >
                  <ChartistGraph
                    data={{
                      labels: chartLabels,
                      series: chartSeries,
                    }}
                    type="Pie"
                  />
                </div>
                <div className="legend">
                  {categoryBreakdown.labels?.length ? categoryBreakdown.labels.map((label, i) => (
                    <span key={label}>
                      <i className={`fas fa-circle ${legendColors[i % legendColors.length]}`}></i>
                      {' '}{label}{' '}
                    </span>
                  )) : (
                    <span>No spending data yet</span>
                  )}
                </div>
                <hr></hr>
              </Card.Body>
            </Card>

          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Time Until Next Cycle</Card.Title>
                <p className="card-category">All products including Taxes</p>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-clock">
                      <i className="nc-icon nc-chart text-clock"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <Card.Title as="h4">{diff} Day(s) Left </Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md="6">
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Goals</Card.Title>
                <p className="card-category">Tickmark for completed ones</p>
              </Card.Header>
              <Card.Body>
                <div className="table-full-width">
                  <Table>
                    <tbody>
                      {data.goals?.map((goal, index) => {
                        return <OverviewGoalsRow
                          key={index}
                          goal={goal.goal}
                        />
                      })}

                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="now-ui-icons loader_refresh spin"></i>
                  Updated {getTimeAgo(lastUpdated)}
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
