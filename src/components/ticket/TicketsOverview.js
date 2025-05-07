import React from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import API from "../../api";
import {UncategorizedTicketsList} from "./UncategorizedTicketsList";
import {Button, Modal, Alert} from "react-bootstrap";

export class TicketsOverview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tickets: null,
            showConfirmModal: false,
            isProcessing: false,
            alertMessage: null,
            alertVariant: null,
        }
    }

    componentDidMount() {
        this.requestTickets();
    }

    requestTickets() {
        API.post("/rest/ticket/project", null, {
            params: {
                "projectName": this.props.match.params.projectName,
            }
        }).then(response => {
            this.setState({tickets: response.data});
        });
    }

    handleOpenAllRecords = () => {
        this.setState({showConfirmModal: true});
    };

    handleConfirmOpenAll = () => {
        this.setState({isProcessing: true});
        API.get("/rest/ticket/resolveAll", {
            params: {
                "projectName": this.props.match.params.projectName,
            }
        }).then(response => {
            this.setState({
                showConfirmModal: false,
                isProcessing: false,
                alertMessage: "✅ All records were set to OPEN successfully.",
                alertVariant: "success"
            });
        }).catch(error => {
            this.setState({
                showConfirmModal: false,
                isProcessing: false,
                alertMessage: "⚠️ Failed to set records to OPEN.",
                alertVariant: "danger"
            });
        });
    };

    handleCancelModal = () => {
        this.setState({showConfirmModal: false});
    };

    handleAlertClose = () => {
        this.setState({alertMessage: null, alertVariant: null});
    }

    render() {
        return (
            <Container fluid>
                <Container>
                    <br/>
                    <Row className="align-items-center">
                        <Col>
                            <h4>Tickets: {this.props.match.params.projectName}</h4>
                        </Col>
                        <Col xs="auto">
                            <Button variant="warning" onClick={this.handleOpenAllRecords}>
                                Open All Records
                            </Button>
                        </Col>
                    </Row>

                    {this.state.alertMessage && (
                        <Row className="mt-3">
                            <Col>
                                <Alert variant={this.state.alertVariant} onClose={this.handleAlertClose} dismissible>
                                    {this.state.alertMessage}
                                </Alert>
                            </Col>
                        </Row>
                    )}

                    <Row className="mt-3">
                        <Col>
                            <div>
                                <UncategorizedTicketsList projectName={this.props.match.params.projectName}/>
                            </div>
                        </Col>
                    </Row>
                </Container>

                {/* Modal */}
                <Modal show={this.state.showConfirmModal} onHide={this.handleCancelModal} size={'lg'}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Action</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to set all records in project <b>{this.props.match.params.projectName}</b> to <b>open</b>?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleCancelModal}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={this.handleConfirmOpenAll} disabled={this.state.isProcessing}>
                            {this.state.isProcessing ? "Processing..." : "Confirm"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        )
    }
}
