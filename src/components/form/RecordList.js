import React from 'react';
import Alert from "react-bootstrap/Alert";
import {RecordLine} from "./RecordLine";

/**
 * FormGens:
 *  1) are provided in this.state.props.formGenSaves
 *  OR
 *  2) are provided through this.props.requestFormGens callback
 */
export class RecordList extends React.Component {

    constructor() {
        super();
        this.state = {
            records: null
        }
    }

    componentDidMount() {
        this.requestRecordsFromProps();
    }

    requestRecordsFromProps() {
        if (this.props.requestRecords) {
            this.props.requestRecords().then(response => {
                return response.data;
            }).then(data => {
                this.setState({
                    records: data
                });
            }).catch(error => {
                console.log(error)
            });
        }
    }

    render() {
        const records = this.props?.records || this.state.records

        if (!records || (records && records.length === 0)) {
            return <Alert variant={"light"} className={"h-10"}>
                Loading forms...
            </Alert>
        }

        records.sort((a, b) => {
            return b.recordCreated - a.recordCreated;
        });

        const recordLines = records ? records.map((record, i) => {
            return <RecordLine key={i}
                               isHighlighted={this.props.highlightRecordKey === record.internalKey}
                               highlightRecordSnapshotKey={this.props.highlightRecordSnapshotKey}
                               recordURI={record.recordURI}
                               recordCreated={record.recordCreated}
                               internalKey={record.internalKey}
                               remoteSampleContextURI={record.remoteSampleContextURI}
                               numberOfRecordSnapshots={record.numberOfRecordSnapshots}
                               numberOfRecordVersions={record.numberOfRecordVersions}
                               projectName={this.props.projectName}
                               clickHandler={this.props.updateActiveContextUri}
                               displayComparedAnswersFunction={this.props.displayComparedAnswersFunction}
            />;
        }) : <Alert variant={"light"} className={"h-10"}>
            The list is empty.
        </Alert>;

        return <div>
            <h4>Records</h4>
            <span><b>({records.length})</b> All non-empty records and their viewing history. </span>
            {recordLines}
        </div>

    }
}
