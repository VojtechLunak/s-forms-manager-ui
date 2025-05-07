import React from 'react';
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import ReactDiffViewer from 'react-diff-viewer'
import API from "../../api";
import Alert from "react-bootstrap/Alert";
import {Constants} from "s-forms";
import _constructFormQuestions from "../../utils/utils";

export class FormTemplateVersionCompareBoard extends React.Component {

    constructor() {
        super();
        this.state = {
            version1: "",
            version2: "",
            rawJsonForm1: "",
            textForm1: "",
            rawJsonForm2: "",
            textForm2: "",
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

    asArray(possibleArray) {
        if (!possibleArray) return [];
        return Array.isArray(possibleArray) ? possibleArray : [possibleArray];
    }


    async dfsTraverseQuestionTree(questions, onEnterQuestion, onLeaveQuestion = () => {
    }) {
        if (!questions) {
            return;
        }
        questions = await _constructFormQuestions(questions, {locale: "en"});
        questions = questions[0];
        console.log(questions);

        const recursiveTraverse = (question) => {
            onEnterQuestion(question);
            this.asArray(question[Constants.HAS_SUBQUESTION]).forEach((subq) => {
                recursiveTraverse(subq);
            });
            onLeaveQuestion(question);
        };

        questions.forEach((q) => recursiveTraverse(q));
    }

    async getFormSpecification(questions) {
        let level = -1;
        const indentation = "    ";
        const propertyIndentation = "..";
        let output = "";
        let questionNumber = 0;

        function onEnterQuestion(q) {
            level += 1;
            const ind = indentation.repeat(level);

            questionNumber += 1;
            const label = q[Constants.RDFS_LABEL] || "Unnamed question";
            output += `${ind}(${questionNumber}) ${label}\n`;

            if (q[Constants.HELP_DESCRIPTION])
                output += `${ind}${propertyIndentation}description: ${q[Constants.HELP_DESCRIPTION]}\n`;

            if (q[Constants.REQUIRES_ANSWER] && !q[Constants.USED_ONLY_FOR_COMPLETENESS])
                output += `${ind}${propertyIndentation}required: ${q[Constants.REQUIRES_ANSWER]}\n`;

            if (q[Constants.USED_ONLY_FOR_COMPLETENESS])
                output += `${ind}${propertyIndentation}required only for completeness: ${q[Constants.USED_ONLY_FOR_COMPLETENESS]}\n`;

            if (q[Constants.PATTERN])
                output += `${ind}${propertyIndentation}pattern: ${q[Constants.PATTERN]}\n`;

            if (q[Constants.INPUT_MASK])
                output += `${ind}${propertyIndentation}mask: ${q[Constants.INPUT_MASK]}\n`;

            if (q[Constants.HAS_VALIDATION_MESSAGE])
                output += `${ind}${propertyIndentation}validation-message: ${q[Constants.HAS_VALIDATION_MESSAGE]}\n`;

            if (q[Constants.XSD.MIN_INCLUSIVE])
                output += `${ind}${propertyIndentation}min: ${q[Constants.XSD.MIN_INCLUSIVE]}\n`;

            if (q[Constants.XSD.MAX_INCLUSIVE])
                output += `${ind}${propertyIndentation}max: ${q[Constants.XSD.MAX_INCLUSIVE]}\n`;

            if (q[Constants.LAYOUT_CLASS]) {
                if (Array.isArray(q[Constants.LAYOUT_CLASS])) {
                    q[Constants.LAYOUT_CLASS].sort();
                }
                output += `${ind}${propertyIndentation}layout class: ${q[Constants.LAYOUT_CLASS]}\n`;
            }

            output += "\n";
        }

        function onLeaveQuestion() {
            level -= 1;
        }

        await this.dfsTraverseQuestionTree(questions, onEnterQuestion, onLeaveQuestion).then(
            () => { this.setState({loading: false});}
        );

        return output;
    }

    requestFormGenJson(version1, version2) {
        const version1Number = this.state.versions.filter(version => version.sampleRemoteContextUri === version1)[0].internalName;
        const version2Number = this.state.versions.filter(version => version.sampleRemoteContextUri === version2)[0].internalName;

        API.post("/rest/sforms/s-forms-json-ld/version", null, {
            params: {
                "projectName": this.props.projectName,
                "contextUri": version1,
                "version": version1Number
            }
        }).then(response => {
            return response.data;
        }).then(data => {
            const jsonLdGraph = data;
            if (Array.isArray(jsonLdGraph)) {
                return jsonLdGraph[0];
            } else {
                return jsonLdGraph;
            }
        }).then(data => {
            this.setState({rawJsonForm1: data})
            return data;
        }).then((data) => {
            this.getFormSpecification(data).then((output) => {
                this.setState({textForm1: output});
            });
        }).catch(e => {
            this.fallbackVersionCall1(version1);
        });
        API.post("/rest/sforms/s-forms-json-ld/version", null, {
            params: {
                "projectName": this.props.projectName,
                "contextUri": version2,
                "version": version2Number
            }
        }).then(response => {
            return response.data;
        }).then(data => {
            const jsonLdGraph = data;
            if (Array.isArray(jsonLdGraph)) {
                return jsonLdGraph[0];
            } else {
                return jsonLdGraph;
            }
        }).then(data => {
            this.setState({rawJsonForm2: data});
            return data;
        }).then((data) => {
            this.getFormSpecification(data).then((output) => {
                this.setState({textForm2: output});
                this.setState({loading: false});
            });
        }).catch(e => {
            this.fallbackVersionCall2(version2);
        });
    }

    fallbackVersionCall1(version) {
        API.post("/rest/sforms/s-forms-json-ld", null, {
            params: {
                "projectName": this.props.projectName,
                "contextUri": version
            }
        }).then(response => {
            return response.data;
        }).then(data => {
            const jsonLdGraph = data;
            if (Array.isArray(jsonLdGraph)) {
                return jsonLdGraph[0];
            } else {
                return jsonLdGraph;
            }
        }).then(data => {
            this.setState({rawJsonForm1: data})
            return data;
        }).then((data) => {
            this.getFormSpecification(data).then((output) => {
                this.setState({textForm1: output});
            });
        });
    }

    fallbackVersionCall2(version) {
        API.post("/rest/sforms/s-forms-json-ld", null, {
            params: {
                "projectName": this.props.projectName,
                "contextUri": version
            }
        }).then(response => {
            return response.data;
        }).then(data => {
            const jsonLdGraph = data;
            if (Array.isArray(jsonLdGraph)) {
                return jsonLdGraph[0];
            } else {
                return jsonLdGraph;
            }
        }).then(data => {
            this.setState({rawJsonForm2: data})
            return data;
        }).then((data) => {
            this.getFormSpecification(data).then((output) => {
                this.setState({textForm2: output});
            });
        });
    }

     render() {
        let versions = this.state.versions;


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
                        {this.state.loading && this.state.rawJsonForm1 && this.state.rawJsonForm2 && this.state.textForm1 && this.state.textForm2 ? (
                            <div>Loading...</div>
                        ) : (
                            <ReactDiffViewer
                                oldValue={this.state.textForm1}
                                newValue={this.state.textForm2}
                                splitView={true}
                            />
                        )}
                    </Row>
                </div>
            );
        }
    }
}
