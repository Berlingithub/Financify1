import React from 'react'
import { Form, ProgressBar } from "react-bootstrap";
import { Link } from 'react-router-dom';

export default function OverviewGoalsRow(props) {
    const { goal, completed, targetAmount, currentAmount } = props;
    const target = Number(targetAmount) || 0;
    const current = Number(currentAmount) || 0;
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    return (
            <tr>
                <td>
                    <Form.Check className="mb-1 pl-0">
                        <Form.Check.Label>
                            <Form.Check.Input
                                type="checkbox"
                                checked={Boolean(completed)}
                                readOnly
                                disabled
                            />
                            <span className="form-check-sign"></span>
                        </Form.Check.Label>
                    </Form.Check>
                </td>
                <td>
                  <div>{goal}</div>
                  <ProgressBar now={pct} variant={completed ? 'success' : 'primary'} className="mt-1" style={{ height: '6px' }} />
                  <small className="text-muted">₹{current} / ₹{target} ({pct}%)</small>
                  <div className="mt-1">
                    <Link to="/admin/goals">Manage goals</Link>
                  </div>
                </td>
            </tr>
    )
}
