import React from 'react';
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import ReactDiffViewer from 'react-diff-viewer'
import API from "../../api";
import Alert from "react-bootstrap/Alert";

export class FormTemplateVersionCompareBoard extends React.Component {

    constructor() {
        super();
        this.state = {
            version1: "",
            version2: "",
            rawJsonForm1: "",
            rawJsonForm2: "",
            loading: false,
            versions: []
        }
        this.versionTextField1 = React.createRef();
        this.versionTextField2 = React.createRef();
    }

    componentDidMount() {
        this.requestVersions();
    }

    requestVersions() {
        API.get("/rest/formTemplate/version/all", {
            params: {
                "projectName": this.props.projectName,
            }
        }).then(response => {
            return response.data;
        }).then(data => {
            this.setState({
                versions: data,
            });
        });
    }

    requestFormGenJson(version1, version2) {
        API.post("/rest/sforms/s-forms-json-ld", null, {
            params: {
                "projectName": this.props.projectName,
                "contextUri": version1
            }
        }).then(response => {
            console.log(response.data);
            return response.data;
        }).then(data => {
            const jsonLdGraph = data;
            if (Array.isArray(jsonLdGraph)) {
                return jsonLdGraph[0];
            } else {
                return jsonLdGraph;
            }
        }).then(data => {
            this.setState({rawJsonForm1: JSON.stringify(data, null, 1)});
        });
        API.post("/rest/sforms/s-forms-json-ld", null, {
            params: {
                "projectName": this.props.projectName,
                "contextUri": version2
            }
        }).then(response => {
            console.log(response.data);
            return response.data;
        }).then(data => {
            const jsonLdGraph = data;
            if (Array.isArray(jsonLdGraph)) {
                return jsonLdGraph[0];
            } else {
                return jsonLdGraph;
            }
        }).then(data => {
            this.setState({rawJsonForm2: JSON.stringify(data, null, 1)});
        }).then(() => {
            this.setState({loading: false});
        });
    }

    render() {
        let versions = this.state.versions

        if (!versions || (versions && versions.length === 0)) {
            return <Alert variant={"light"} className={"h-10"}>
                Loading versions...
            </Alert>
        } else {
            return (
                <div>
                    <Row>
                        <Col>
                            <Form.Group controlId="formVersionFilter1">
                                <Form.Label>Select version 1</Form.Label>
                                <Form.Control as="select" ref={this.versionTextField1}>
                                    {this.state.versions.map(version => (
                                        <option key={version.internalKey} value={version.sampleRemoteContextUri}>
                                            {version.internalName ? version.internalName : version.internalKey}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="formVersionFilter2">
                                <Form.Label>Select version 2</Form.Label>
                                <Form.Control as="select" ref={this.versionTextField2}>
                                    {this.state.versions.map(version => (
                                        <option key={version.internalKey} value={version.sampleRemoteContextUri}>
                                            {version.internalName ? version.internalName : version.internalKey}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button variant="primary" onClick={() => {
                        this.setState({
                            version1: this.versionTextField1.current.value,
                            version2: this.versionTextField2.current.value,
                            loading: true
                        });
                        this.requestFormGenJson(this.versionTextField1.current.value, this.versionTextField2.current.value);
                    }}>
                        Compare!
                    </Button>
                    <Row>
                        {this.state.loading ? (
                            <div>Loading...</div>
                        ) : (
                            <ReactDiffViewer
                                oldValue={this.state.rawJsonForm1}
                                newValue={this.state.rawJsonForm2}
                                splitView={true}
                            />
                        )}
                    </Row>
                </div>
            );
        }
    }
}
