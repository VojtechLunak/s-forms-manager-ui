import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Moment from 'react-moment';

export class RecordSnapshotLine extends React.Component {

    constructor() {
        super();
        this.state = {}
    }

    render() {

        return <Card className={this.props.isHighlighted ? "bg-warning p-1" : ""}>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <Row>
                        <Col xs={9}>
                            <span>RecordVersion: <b>{this.props.recordVersionKey}</b></span>
                            <br/>
                            <span>FormTemplateVersion: {this.props?.formTemplateVersionKey || "none"} {this.props.formTemplateVersionInternalName ? "(" + this.props.formTemplateVersionInternalName + ")" : ""}</span>
                            <br/>
                            <span>Snapshot created:{' '}
                                <Moment format="DD.MM.YYYY hh:mm:ss">
                                    {this.props.recordSnapshotCreated}
                                </Moment>
                            </span>
                            <br/>
                            <span>Number of answers: <b>{this.props.numberOfAnswers}</b></span>
                            <br/>
                            <span>Internal key: {this.props.internalKey}</span>
                            <br/>

                        </Col>
                        <Col xs={3}>
                            <Button variant="outline-primary" type="submit" size="sm" className="float-right"
                                    onClick={() => this.props.clickHandler(this.props.remoteSampleContextURI)}>
                                Display
                            </Button>
                            {' '}
                            {this.props.order <= 0 ? <div/> :
                                <Button
                                    variant="outline-primary" size="sm" className="float-right"
                                    onClick={() => this.props.compareRecordSnapshotsFunction(this.props.order)}>
                                    Compare to previous snapshot
                                </Button>
                            }
                        </Col>
                    </Row>
                </ListGroup.Item>
            </ListGroup>
        </Card>
    }
}