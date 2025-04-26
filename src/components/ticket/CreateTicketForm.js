import React from "react";
import API from "../../api";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import ToggleButton from "react-bootstrap/ToggleButton";
import {IntelligentQuestionSelector} from "../search/IntelligentQuestionSelector";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";

export class CreateTicketForm extends React.Component {

    constructor() {
        super();
        this.state = {
            name: "",
            description: "",
            relateToRecordSnapshot: false,
            relateToFormVersion: false,
            relateToQuestion: false,
            formTemplateVersionKey: null,
            ticketUrl: null,
            contextUri: null
        }
        this.onChangeSetState = this.onChangeSetState.bind(this);
        this.onSubmitProject = this.onSubmitProject.bind(this);
        this.errorMessage = this.errorMessage.bind(this);
        this.getTicketUrl = this.getTicketUrl.bind(this);
        this.questionSelectorRef = React.createRef();
    }

    onChangeSetState(e) {
        const {name, value} = e.target;
        this.setState(prevState => ({...prevState, [name]: value}));
    }

    onSubmitProject(e) {
        e.preventDefault();
        API.post("/rest/ticket", {
            projectName: this.props.projectName,
            recordContextUri: this.props.contextUri,
            name: this.state.name,
            description: this.getDescriptionWithTicketUrl(),
            relateToRecordSnapshot: this.state.relateToRecordSnapshot,
            relateToFormVersion: this.state.relateToFormVersion,
            relateToQuestion: this.state.relateToQuestion,
            questionOriginPath: this.questionSelectorRef?.current?.state.activeQuestionOriginPath,
        }).then((response) => {
            this.ticketForm.reset();
            this.setState({
                showError: false,
                showSuccess: true,
                ticketLink: response.data,
                relateToRecordSnapshot: false,
                relateToFormVersion: false,
                relateToQuestion: false
            });
        }).catch((error) => {
                console.log(error)
                this.setState({showError: true, showSuccess: false});
            }
        );
    }

    componentDidMount() {
        this.requestRecordSnapshot();
        this.requestFormTemplateVersion();
    }

    componentDidUpdate(prevProps, prevState, ss) {
        // reset form if the context changes
        if (prevProps.contextUri !== this.props.contextUri && this.state.contextUri !== this.props.contextUri) {
            this.setState({
                name: "",
                description: "",
                relateToRecordSnapshot: false,
                relateToFormVersion: false,
                relateToQuestion: false,
                formTemplateVersionKey: null,
                ticketUrl: null,
                contextUri: this.props.contextUri,
                showSuccess: false,
                showError: false
            });
        }
    }

    requestFormTemplateVersion() {
        if (this.state.formTemplateVersionKey && this.state.formTemplateVersionKey === this.props.contextUri) {
            return;
        }

        API.get("/rest/record/snapshot/find/version", {
            params: {
                "projectName": this.props.projectName,
                "recordSnapshotContextUri": this.props.contextUri,
            }
        }).then(response => {
            this.setState({formTemplateVersionKey: response.data.internalKey});
        });
    }

    requestRecordSnapshot() {
        if (this.state.recordSnapshotKey && this.props.contextUri === this.state.recordSnapshotKey) {
            return;
        }
        API.get("/rest/record/snapshot/find", {
            params: {
                "projectName": this.props.projectName,
                "recordSnapshotContextUri": this.props.contextUri,
            }
        }).then(response => {
            this.setState({recordSnapshotKey: response.data.internalKey});
        });
    }

    getDescriptionWithTicketUrl() {
        return this.state.description + "\n\n" + this.getTicketUrl();
    }

    getTicketUrl() {
        const baseUrl = `http://${window.location.host}/browse/forms/${this.props.projectName}`;
        if (this.state.relateToRecordSnapshot) {
            return `${baseUrl}/record/${this.state.recordSnapshotKey}`;
        } else if (this.state.relateToFormVersion || this.state.relateToQuestion) {
            return `${baseUrl}/version/${this.state.formTemplateVersionKey}`;
        } else {
            return baseUrl;
        }
    }

    render() {
        const ticketUrl = this.getTicketUrl();

        return <Card>
            <ListGroup variant="flush">
                <ListGroup.Item>
                    <div>
                        <Row>
                            <Col>
                                <div>
                                    <Form onSubmit={this.onSubmitProject} ref={form => this.ticketForm = form} onChange={() => {
                                        this.requestRecordSnapshot();
                                        this.requestFormTemplateVersion();
                                    }}>
                                        <Form.Group controlId="nameControl">
                                            <Form.Label>Name</Form.Label>
                                            <Form.Control type="text"
                                                          placeholder="ticket name"
                                                          name="name"
                                                          value={this.state.name}
                                                          onChange={this.onChangeSetState}/>
                                        </Form.Group>
                                        <Form.Group controlId="descriptionControl">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control as="textarea"
                                                          placeholder="ticket description"
                                                          name="description" rows={3}
                                                          value={this.state.description}
                                                          onChange={this.onChangeSetState}/>
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>Ticket URL (added to description after submission)</Form.Label>
                                            <br/>
                                            <a target="_blank" href={ticketUrl}>{ticketUrl}</a>
                                        </Form.Group>
                                        <ToggleButton variant="light" style={{marginBottom: "0"}} type="checkbox"
                                                      checked={this.state.relateToRecordSnapshot}
                                                      value="1"
                                                      onChange={e => this.setState({relateToRecordSnapshot: e.currentTarget.checked})}>
                                            {' '} Relate to form
                                        </ToggleButton>
                                        {' '}
                                        <ToggleButton variant="light" style={{marginBottom: "0"}} type="checkbox"
                                                      checked={this.state.relateToFormVersion}
                                                      value="1"
                                                      onChange={e => this.setState({relateToFormVersion: e.currentTarget.checked})}>
                                            {' '} Relate to form version
                                        </ToggleButton>
                                        {' '}
                                        <ToggleButton variant="light" style={{marginBottom: "0"}} type="checkbox"
                                                      checked={this.state.relateToQuestion}
                                                      value="1"
                                                      onChange={e => this.setState({relateToQuestion: e.currentTarget.checked})}>
                                            {' '} Relate to question (origin path)
                                        </ToggleButton>
                                        {this.state.relateToQuestion ?
                                            <IntelligentQuestionSelector projectName={this.props.projectName}
                                                                         ref={this.questionSelectorRef}
                                                                         singleFormOnly={true}
                                                                         contextUri={this.props.contextUri}

                                            /> : <div/>}
                                        <br/>
                                        <Button variant="primary" type="submit">
                                            Submit
                                        </Button>
                                        {this.state.showError === true && this.errorMessage()}
                                        {this.state.showSuccess === true && this.successMessage()}
                                    </Form>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </Card>;
    }

    errorMessage() {
        return <div>
            <br/>
            <Alert variant="danger" onClose={() => this.setState({showError: false})} dismissible>
                <Alert.Heading>Warning!</Alert.Heading>
                <p>Creating project was not successful.</p>
            </Alert>
        </div>
    }

    successMessage() {
        return <div>
            <br/>
            <Alert variant="success" onClose={() => this.setState({showSuccess: false})} dismissible>
                <Alert.Heading>Success!</Alert.Heading>
                Creating ticket was successful. <a target={"_blank"} href={this.state.ticketLink}>ticket link</a>
            </Alert>
        </div>
    }

}
