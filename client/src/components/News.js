import React, { useEffect, useState } from 'react';
import { getOverview } from '../api/api';

import img1 from '../assets/images/gadgets.jpeg';
import img2 from '../assets/images/cloth.jpg';
import img3 from '../assets/images/amazon.png';
import img4 from '../assets/images/flipkart.jpeg';

import './../assets/css/demo.css';

import { Button } from 'react-bootstrap';

const CATEGORY_DEALS = {
  Electronics: {
    image: img1,
    logo: img3,
    title: '50% savings on electronics',
    text: 'You spend heavily on electronics this month — watch for sale events and price drops.',
    footer: 'Tip based on your spending',
  },
  Fashion: {
    image: img2,
    logo: img4,
    title: '60% savings on clothing and footwear',
    text: 'Fashion is a top category for you — seasonal sales can cut costs significantly.',
    footer: 'Tip based on your spending',
  },
  Household: {
    image: img1,
    logo: img3,
    title: 'Household essentials on offer',
    text: 'Household is among your top spend categories — bulk buys and store loyalty deals help.',
    footer: 'Tip based on your spending',
  },
};

function DealCard({ image, logo, title, text, footer }) {
  return (
    <div className="card">
      <div className="card-horizontal">
        <div className="img-square-wrapper">
          <img className="responsive" src={image} alt="" height="295" />
        </div>
        <div className="card-body">
          <img className="responsive1" src={logo} height="125" alt="" />
          <hr />
          <h4 className="card-title">{title}</h4>
          <hr />
          <p className="card-text">{text}</p>
          <Button className="btn-fill pull-right" variant="success" type="button">
            Save Money
          </Button>
        </div>
      </div>
      <div className="card-footer">
        <small className="text-muted">{footer}</small>
      </div>
    </div>
  );
}

export default function News() {
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview()
      .then((res) => {
        const labels = res.data?.categoryBreakdown?.labels || [];
        setTopCategories(labels.slice(0, 2));
      })
      .catch(() => setTopCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-muted px-2">Loading personalized tips…</p>;
  }

  const deals = topCategories
    .map((cat) => CATEGORY_DEALS[cat])
    .filter(Boolean);

  const cards =
    deals.length > 0
      ? deals
      : [
          {
            ...CATEGORY_DEALS.Electronics,
            text: 'Add transactions to see deals matched to your spending categories.',
            footer: 'Default suggestion',
          },
        ];

  return (
    <>
      {cards.map((deal) => (
        <DealCard key={deal.title} {...deal} />
      ))}
    </>
  );
}
