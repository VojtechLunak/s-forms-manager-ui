import React from 'react';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import API from "../../api";
import {Alert, Modal} from "react-bootstrap";

export class TicketLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showConfirmModal: false,
            isProcessing: false,
            alertMessage: null,
            alertVariant: null
        }
    }

    extractShortId(url) {
        const match = url.match(/\/(\d+)-/);
        return match ? match[1] : null;
    }

    handleResolveAndOpenRecord = () => {
        this.setState({isProcessing: true});
        const shortId = this.extractShortId(this.props.url);

        API.get(`/rest/ticket/resolve?ticketId=${shortId}&formGenUri=${this.props.contextUri}&projectName=${this.props.projectName}`
        ).then(response => {
            if (response.status === 200) {
                this.setState({ isProcessing: false, alertMessage: "Issue resolved and Record set to 'open' state. You may now refresh the ticket information.", alertVariant: "success", showConfirmModal: false });
            } else {
                this.setState({ isProcessing: false, alertMessage: "An error occured when trying to resolve issue and open record.", alertVariant: "danger", showConfirmModal: false });
            }
        }).catch(error => {
            this.setState({ isProcessing: false, alertMessage: "An error occured when trying to resolve issue and open record.", alertVariant: "danger", showConfirmModal: false });
        });
    }

    handleResolveIssue = () => {
        this.setState({showConfirmModal: true});
    }

    handleCancelModal = () => {
        this.setState({showConfirmModal: false});
    };

    handleAlertClose = () => {
        this.setState({alertMessage: null, alertVariant: null});
    }

    render() {
        const stateColors = {
            "OPEN": "success",
            "CLOSED": "danger",
            "IN TEST": "warning",
            "TODO": "primary",
            "DEPLOYED": "info",
            "IN PROGRESS": "info"
        };

        const ticketState = this.props.ticketState || "unknown";
        const badgeVariant = stateColors[ticketState] || "secondary";

        return <Card>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <div>
                        <Row>
                            <Col>
                                <div>
                                    <span><b>{this.props.name}</b> (<a href={this.props.url}
                                                                             target="_blank">link</a>) <Badge variant={badgeVariant} className="mt-2">
                                        {ticketState.replace("_", " ").toUpperCase()}
                                    </Badge></span>
                                    <br/>

                                    {this.state.alertMessage && (
                                        <Row className="mt-3">
                                            <Col>
                                                <Alert variant={this.state.alertVariant} onClose={this.handleAlertClose} dismissible>
                                                    {this.state.alertMessage}
                                                </Alert>
                                            </Col>
                                        </Row>
                                    )}
                                    <span style={{whiteSpace: "pre-line"}}>{this.props.description}</span>
                                    <br/>
                                    <br/>
                                    <span>Form version identifier: <b>{this.props.projectRelations?.relatedForm || "-"}</b></span>
                                    <br/>
                                    <span>Form identifier: <b>{this.props.projectRelations?.relatedFormVersion || "-"}</b></span>
                                    <br/>
                                    <span>Question origin path: {this.props.projectRelations?.relatedQuestionOriginPath || "-"}</span>
                                    <br/>
                                    <span>Question label: <b>{this.props.projectRelations?.relatedQuestionLabel || "-"}</b></span>
                                    <br/>
                                    <br/>
                                    { this.props.contextUri &&
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => this.handleResolveIssue()}
                                    >
                                        Resolve ticket and set record to "open" status
                                    </Button>
                                    }

                                    {/* Modal */}
                                    <Modal show={this.state.showConfirmModal} onHide={this.handleCancelModal} size={'lg'} centered>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Confirm Action</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            Are you sure you want to resolve ticket and set record to <b>open</b> status in project <b>{this.props.projectName}</b>?
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={this.handleCancelModal}>
                                                Cancel
                                            </Button>
                                            <Button variant="danger" onClick={this.handleResolveAndOpenRecord} disabled={this.state.isProcessing}>
                                                {this.state.isProcessing ? "Processing..." : "Confirm"}
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>

                                </div>
                            </Col>
                        </Row>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </Card>
    }
}
