import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Moment from 'react-moment';
import Collapse from "react-bootstrap/Collapse";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown} from "@fortawesome/free-solid-svg-icons/faCaretDown";
import {RecordSnapshotList} from "./RecordSnapshotList";

export class RecordLine extends React.Component {

    constructor() {
        super();
        this.state = {
            detailCollapseOpen: false,
            historyCollapseOpen: false
        }
    }

    componentDidMount() {
        this.setState({ historyCollapseOpen: this.props.isHighlighted });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isHighlighted !== this.props.isHighlighted) {
            this.setState({ historyCollapseOpen: this.props.isHighlighted });
        }
    }

    render() {
        let historyDiv;
        if (this.state.historyCollapseOpen) {
            historyDiv = <RecordSnapshotList recordURI={this.props.recordURI}
                                             projectName={this.props.projectName}
                                             clickHandler={this.props.clickHandler}
                                             highlightRecordSnapshotKey={this.props.highlightRecordSnapshotKey}
                                             displayComparedAnswersFunction={this.props.displayComparedAnswersFunction}
            />;
        }

        return <div>
            <Card className={this.props.isHighlighted ? "bg-warning" : ""}>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <Row>
                            <Col xs={9}>
                                <p>
                                </p>
                                <span>Internal record key: {this.props.internalKey}</span>
                                <br/>
                                <span>Number of versions: <b>{this.props.numberOfRecordVersions}</b></span>
                                <br/>
                                <span>Number of snapshots: <b>{this.props.numberOfRecordSnapshots}</b></span>
                                <br/>
                                <span>Created:{' '}
                                    <b>
                                <Moment format="DD.MM.YYYY h:mm:ss">
                                    {this.props.recordCreated}
                                </Moment>
                                </b>
                            </span>
                            </Col>
                            <Col xs={3}>
                                <Button variant="outline-primary" type="submit" size="sm" className="float-right"
                                        onClick={() => this.props.clickHandler(this.props.remoteSampleContextURI)}>
                                    Display
                                </Button>
                                <Button
                                    variant="link" size="sm" className="float-right"
                                    onClick={() => this.setState({historyCollapseOpen: !this.state.historyCollapseOpen})}
                                    aria-controls="example-collapse-text"
                                    aria-expanded={this.state.historyCollapseOpen}
                                >
                                    Show history <FontAwesomeIcon color="black" icon={faCaretDown}/>
                                </Button>
                                <Button
                                    variant="link" size="sm" className="float-right"
                                    onClick={() => this.setState({detailCollapseOpen: !this.state.detailCollapseOpen})}
                                    aria-controls="example-collapse-text"
                                    aria-expanded={this.state.detailCollapseOpen}
                                >
                                    Show detail <FontAwesomeIcon color="black" icon={faCaretDown}/>
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div>
                                    <Collapse in={this.state.detailCollapseOpen}>
                                        <div id="example-collapse-text">
                                            <hr/>
                                            <span>Sample remote context URI: {this.props.remoteSampleContextURI}</span>
                                            <br/>
                                            <span>Internal URI: {this.props.recordURI}</span>
                                            <br/>
                                        </div>
                                    </Collapse>
                                    <Collapse in={this.state.historyCollapseOpen}>
                                        <div id="example-collapse-text">
                                            <hr/>
                                            {historyDiv}
                                        </div>
                                    </Collapse>
                                </div>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </div>
    }
}