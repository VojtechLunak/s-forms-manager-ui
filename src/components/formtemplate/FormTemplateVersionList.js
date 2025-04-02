import React from 'react';
import API from "../../api";
import Alert from "react-bootstrap/Alert";
import {FormTemplateVersionLine} from "./FormTemplateVersionLine";

export class FormTemplateVersionList extends React.Component {

    constructor() {
        super();
        this.state = {
            versions: []
        }
        this.requestVersions = this.requestVersions.bind(this)
    }

    componentDidMount() {
        this.requestVersions()
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

    render() {
        let versions = this.state.versions

        if (!versions || (versions && versions.length === 0)) {
            return <Alert variant={"light"} className={"h-10"}>
                Loading versions...
            </Alert>
        }

        // Group versions by formTemplateKey
        const groupedVersions = versions.reduce((groupedVersions, version) => {
            const key = version.formTemplateKey;
            if (!groupedVersions[key]) {
                groupedVersions[key] = [];
            }
            groupedVersions[key].push(version);
            return groupedVersions;
        }, {});

        // Render grouped versions
        const versionGroups = Object.keys(groupedVersions).map((formTemplateKey, i) => {
            const versionLines = groupedVersions[formTemplateKey].map((version, j) => (
                <FormTemplateVersionLine key={j}
                                         isHighlighted={version.internalKey === this.props.highlightVersionKey}
                                         internalName={version.internalName}
                                         internalUri={version.internalUri}
                                         sampleRemoteContextUri={version.sampleRemoteContextUri}
                                         numberOfQuestionTemplateSnapshots={version.numberOfQuestionTemplateSnapshots}
                                         projectName={this.props.projectName}
                                         internalKey={version.internalKey}
                                         numberOfRecordSnapshots={version.numberOfRecordSnapshots}
                                         clickHandler={this.props.updateActiveContextUri}/>
            ));
            return (
                <div key={i} className={"mb-3"}>
                    <h5>Form Template Key: {formTemplateKey}</h5>
                    {versionLines}
                </div>
            );
        });

        return <div>
            <h4>Form template versions</h4>
            {versionGroups}
        </div>
    }
}