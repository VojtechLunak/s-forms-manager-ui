import React from 'react';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import API from "../../api";

export class TicketLine extends React.Component {
    extractShortId(url) {
        const match = url.match(/\/(\d+)-/);
        return match ? match[1] : null;
    }

    handleResolveAndOpenRecord() {
        const shortId = this.extractShortId(this.props.url);

        API.get(`/rest/ticket/resolve?ticketId=${shortId}&formGenUri=${this.props.contextUri}`
        ).then(response => {
            if (response.status === 200) {
                alert("Issue resolved and Record set to 'open' state.");
            } else {
                alert("Failed to resolve issue and set Record to 'open' state.");
            }
        }).catch(error => {
            console.error("Error while opening record:", error);
            alert("Unexpected error.");
        });
    }

    render() {

        return <Card>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <div>
                        <Row>
                            <Col>
                                <div>
                                    <span><b>{this.props.name}</b> (<a href={this.props.url}
                                                                             target="_blank">link</a>)</span>
                                    <br/>
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
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => this.handleResolveAndOpenRecord()}
                                    >
                                        Resolve ticket and set record to "open" status
                                    </Button>

                                </div>
                            </Col>
                        </Row>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </Card>
    }
}
