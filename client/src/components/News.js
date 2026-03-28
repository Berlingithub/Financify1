import React from 'react'

import img1 from '../images/gadgets.jpeg'
import img2 from '../images/cloth.jpg'
import img3 from '../images/amazon.png'
import img4 from '../images/flipkart.jpeg'

import './../assets/css/demo.css'

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

export default function News() {
    return (
        <>
        <div className="card">
          <div className="card-horizontal">
            <div className="img-square-wrapper">
              <img className="responsive" src={img1} alt="Card image cap" height="295"></img>
            </div>
            <div className="card-body">
              <img className="responsive1" src={img3} height="125vh"></img>
              <hr></hr>
              <h4 className="card-title">50% savings on electronics</h4>
              <hr></hr>
              <p className="card-text">Since you are buying a lot of electronics, we suggest to keep an eye on sales/discounts.</p>
              <Button className="btn-fill pull-right" variant="success">Save Money</Button>
            </div>
          </div>
          <div className="card-footer">
            <small className="text-muted">Last 2 days left.</small>
          </div>
        </div>
        <div className="card">
          <div className="card-horizontal">
            <div className="img-square-wrapper">
              <img className="responsive" src={img2} alt="Card image cap" height="280"></img>
            </div>
            <div className="card-body">
              <img className="responsive1" src={img4} height="85vh"></img>
              <hr></hr>
              <h4 className="card-title">60% savings on clothing and footwear</h4>
              <hr></hr>
              <p className="card-text">We see that you are transacting alot on clothes and shoes. So here is a deal for you!</p>
              <Button className="btn-fill pull-right" variant="success">Save Money</Button>
            </div>
          </div>
          <div className="card-footer">
            <small className="text-muted">Last 5 days left.</small>
          </div>
        </div>
      </>
    )
}
