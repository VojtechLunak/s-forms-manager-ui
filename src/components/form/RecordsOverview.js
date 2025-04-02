import React from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import API from "../../api";
import Button from "react-bootstrap/Button";
import {FormTemplateVersionList} from "../formtemplate/FormTemplateVersionList";
import {RecordList} from "./RecordList";
import VersionsHistogramChart from "../graphs/VersionsHistogramChart";
import {ProjectStatistics} from "./ProjectStatistics";
import {FormTemplateVersionCompareBoard} from "../formtemplate/FormTemplateVersionCompareBoard";
import {AnswersCompareBoard} from "./AnswersCompareBoard";
import {TicketsWithSFormsBoard} from "../TicketsWithSFormsBoard";

const LEFT_DISPLAY_VERSIONS_LIST = "DISPLAY_VERSIONS_LIST";
const LEFT_DISPLAY_RECORDS_LIST = "DISPLAY_RECORDS_LIST";
const RIGHT_DISPLAY_VERSION_GRAPH = "DISPLAY_VERSION_GRAPH"
const RIGHT_DISPLAY_S_FORMS = "RIGHT_DISPLAY_S_FORMS"
const RIGHT_COMPARE_VERSIONS = "RIGHT_COMPARE_VERSIONS"
const RIGHT_COMPARE_ANSWERS = "RIGHT_COMPARE_ANSWERS"

export class RecordsOverview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            contexts: [],
            recordSnapshotContextUri1: null,
            recordSnapshotContextUri2: null,
            leftComponent: null,
            rightComponent: null,
            activeContext: null,
            highlightRecordKey: null,
            highlightRecordSnapshotKey: this.props.match.params.recordSnapshotKey
        }
        this.updateActiveContextUri = this.updateActiveContextUri.bind(this)
        this.requestRecords = this.requestRecords.bind(this)
        this.displayComparedAnswers = this.displayComparedAnswers.bind(this)
    }

    componentDidMount() {
        if (this.props.match.params?.versionKey) {
            this.setState({leftComponent: LEFT_DISPLAY_VERSIONS_LIST});
            API.get("/rest/formTemplate/version/find", {
                params: {
                    "projectName": this.props.match.params.projectName,
                    "formTemplateVersionKey": this.props.match.params.versionKey,
                }
            }).then(response => {
                this.updateActiveContextUri(response.data.sampleRemoteContextUri)
            })
        } else if (this.props.match.params?.recordSnapshotKey) {
            this.setState({leftComponent: LEFT_DISPLAY_RECORDS_LIST});
            API.get("/rest/record/find", {
                params: {
                    "projectName": this.props.match.params.projectName,
                    "recordSnapshotKey": this.props.match.params.recordSnapshotKey,
                }
            }).then(response => {
                this.updateActiveContextUri(response.data.remoteSampleContextURI)
                this.setState({
                    highlightRecordKey: response.data.internalKey,
                    highlightRecordSnapshotKey: this.props.match.params.recordSnapshotKey
                });
            })
        } else {
            this.setState({rightComponent: RIGHT_DISPLAY_VERSION_GRAPH});
        }
    }

    updateActiveContextUri(contextUri) {
        this.setState({activeContext: contextUri, rightComponent: RIGHT_DISPLAY_S_FORMS,})
        if (this.state.contextUri !== this.state.activeContext) {
            this.setState({highlightRecordKey: null, highlightRecordSnapshotKey: null})
        }
    }

    displayCompareVersions() {
        this.setState({rightComponent: RIGHT_COMPARE_VERSIONS})
    }

    displayComparedAnswers(comparedSnapshotUri1, comparedSnapshotUri2) {
        this.setState({
            recordSnapshotContextUri1: comparedSnapshotUri1,
            recordSnapshotContextUri2: comparedSnapshotUri2,
            rightComponent: RIGHT_COMPARE_ANSWERS
        })
    }

    requestRecords() {
        return API.get("/rest/record", {
            params: {
                "projectName": this.props.match.params.projectName
            }
        });
    }

    render() {
        let leftComponent;
        switch (this.state.leftComponent) {
            case LEFT_DISPLAY_VERSIONS_LIST:
                leftComponent = <FormTemplateVersionList projectName={this.props.match.params.projectName}
                                                         updateActiveContextUri={this.displayCompareVersions}
                                                         highlightVersionKey={this.props.match.params.versionKey}/>
                break;
            case LEFT_DISPLAY_RECORDS_LIST:
                leftComponent = <RecordList projectName={this.props.match.params.projectName}
                                            updateActiveContextUri={this.updateActiveContextUri}
                                            requestRecords={this.requestRecords}
                                            displayComparedAnswersFunction={this.displayComparedAnswers}
                                            displayCount={true}
                                            highlightRecordKey={this.state.highlightRecordKey}
                                            highlightRecordSnapshotKey={this.state.highlightRecordSnapshotKey}/>
                break;
            default:
                leftComponent = <div/>
                break;
        }
        let rightComponent;
        switch (this.state.rightComponent) {
            case RIGHT_DISPLAY_S_FORMS:
                rightComponent = <TicketsWithSFormsBoard contextUri={this.state.activeContext}
                                                         projectName={this.props.match.params.projectName}/>
                break;
            case RIGHT_COMPARE_VERSIONS:
                rightComponent =
                    <FormTemplateVersionCompareBoard key={this.state.activeContext}
                                                     contextUri={this.state.activeContext}
                                                     projectName={this.props.match.params.projectName}/>
                break;
            case RIGHT_COMPARE_ANSWERS:
                rightComponent =
                    <AnswersCompareBoard comparedSnapshotUri1={this.state.recordSnapshotContextUri1}
                                         comparedSnapshotUri2={this.state.recordSnapshotContextUri2}
                                         projectName={this.props.match.params.projectName}/>
                break;
            case RIGHT_DISPLAY_VERSION_GRAPH:
                rightComponent = <VersionsHistogramChart projectName={this.props.match.params.projectName}/>
                break;
            default:
                rightComponent = <div/>;
                break;
        }

        return (
            <Container fluid>
                <Container>
                    <br/>
                    <h4>
                        Processed Forms: {this.props.match.params.projectName}
                    </h4>
                    <ProjectStatistics projectName={this.props.match.params.projectName}/>
                    <hr/>
                    <Button variant="outline-primary" type="submit"
                            onClick={() => this.setState({leftComponent: LEFT_DISPLAY_RECORDS_LIST})}>
                        Show user records
                    </Button>
                    {' '}
                    <Button variant="outline-primary" type="submit"
                            onClick={() => this.setState({
                                leftComponent: LEFT_DISPLAY_VERSIONS_LIST,
                                rightComponent: RIGHT_DISPLAY_VERSION_GRAPH
                            })}>
                        Show form versions
                    </Button>
                    {' '}
                    <Button variant="outline-primary" type="submit"
                            onClick={() => this.setState({rightComponent: RIGHT_DISPLAY_VERSION_GRAPH})}>
                        Show versions graph
                    </Button>
                    {' '}
                    {/*<Button variant="outline-primary" type="submit"*/}
                    {/*        onClick={() => this.setState({rightComponent: RIGHT_COMPARE_VERSIONS})}>*/}
                    {/*    Compare versions*/}
                    {/*</Button>*/}
                    <br/><br/>
                </Container>
                <Row>
                    <Col xs={6}>
                        <div>
                            {leftComponent}
                        </div>
                    </Col>
                    <Col xs={6}>
                        {rightComponent}
                    </Col>
                </Row>
            </Container>)
    }
}
