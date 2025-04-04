import React from "react";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown} from "@fortawesome/free-solid-svg-icons/faCaretDown";
import Collapse from "react-bootstrap/Collapse";
import API from "../../api";

export class FormTemplateVersionLine extends React.Component {

    constructor() {
        super();
        this.state = {
            collapseOpen: false,
            internalName: "",
            internalNameProposal: "",
            internalNameChanged: false
        }
    }

    setVersionInternalName(versionKey, internalName) {
        API.put("/rest/formTemplate/version/setInternalName", null, {
            params: {
                "projectName": this.props.projectName,
                "versionKey": versionKey,
                "internalName": internalName
            }
        }).then(response => {
            this.setState({internalName: internalName, internalNameChanged: true})
        }).catch(error => {
            console.log(error)
        });
    }

    render() {
        let internalNameDiv;
        if ((this.props.internalName && !this.state.internalNameChanged) || this.state.internalName) {
            internalNameDiv = <div>
                <span>Internal name: <b>{this.state.internalNameChanged ? this.state.internalName : this.props.internalName}</b></span>
                <br/>
            </div>;
        }

        return <Card className={this.props.isHighlighted ? "bg-warning" : ""}>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <Row>
                        <Col xs={6}>
                            {internalNameDiv}
                            <span>Internal version key: <b>{this.props.internalKey}</b></span>
                            <br/>
                            <span>Number of record snapshots: <b>{this.props.numberOfRecordSnapshots}</b></span>
                            <br/>
                        </Col>
                        <Col xs={6}>
                            <Row>
                                <Button variant="outline-primary small" type="submit" size="sm" className="float-right mr-2"
                                        onClick={() => this.props.clickHandler(this.props.sampleRemoteContextUri)}>
                                    Show sample form
                                </Button>
                                <Button variant="outline-primary small" type="submit" size="sm" className="float-right"
                                        onClick={() => window.open("https://tomasklima.vercel.app/?formUrl=" + API.defaults.baseURL  + "/rest/sforms/s-forms-json-ld/"+ this.props.projectName + "/" + this.props.sampleRemoteContextUri.split("/").pop())}>
                                    Open in SForms Editor
                                </Button>
                            </Row>
                            <Row>
                                <Button
                                    variant="link" size="sm" className="float-right"
                                    onClick={() => this.setState({collapseOpen: !this.state.collapseOpen})}
                                    aria-controls="example-collapse-text"
                                    aria-expanded={this.state.collapseOpen}
                                >
                                    Show detail <FontAwesomeIcon color="black" icon={faCaretDown}/>
                                </Button>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div>
                                <Collapse in={this.state.collapseOpen}>
                                    <div id="example-collapse-text">
                                        <hr/>
                                        <h6>Question template snapshots:</h6>
                                        <span>{this.props.numberOfQuestionTemplateSnapshots}</span>
                                        <br/>
                                        <br/>
                                        <h6>Sample remote context URI</h6>
                                        <span>{this.props.sampleRemoteContextUri}</span>
                                        <br/>
                                        <br/>
                                        <h6>Internal version URI</h6>
                                        <span>{this.props.internalUri}</span>
                                        <br/>
                                        <br/>
                                        <h6>Internal name</h6>

                                        <InputGroup className="mb-1">
                                            <FormControl
                                                placeholder="Leave out empty and hit Update to remove internal name"
                                                aria-describedby="inputGroup-sizing-sm"
                                                aria-label="Internal name"
                                                aria-describedby="basic-addon2"
                                                value={this.state.internalNameProposal}
                                                onChange={e => this.setState({internalNameProposal: e.target.value})}
                                            />
                                            <InputGroup.Append>
                                                <Button
                                                    onClick={() => this.setVersionInternalName(this.props.internalKey, this.state.internalNameProposal)}
                                                    variant="outline-secondary" size="sm">Update</Button>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </div>
                                </Collapse>
                            </div>
                        </Col>
                    </Row>
                </ListGroup.Item>
            </ListGroup>
        </Card>
    }
}