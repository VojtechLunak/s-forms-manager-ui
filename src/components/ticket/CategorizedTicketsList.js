import React from 'react';
import Alert from "react-bootstrap/Alert";
import API from "../../api";
import {TicketLine} from "./TicketLine";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";

export class CategorizedTicketsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            recordTickets: null,
            formVersionTickets: null,
            questionTickets: null,
            contextUri: this.props.contextUri
        }
    }

    componentDidMount() {
        this.requestTickets();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.contextUri !== this.props.contextUri) {
            this.setState({
                recordTickets: null,
                formVersionTickets: null,
                questionTickets: null,
                contextUri: this.props.contextUri
            }, () => {
                this.requestTickets();
            });
        }
    }

    createTicketLines(tickets) {
        return (tickets && tickets.length !== 0) ? tickets.map((ticket, i) => {
            return <TicketLine key={i}
                               name={ticket.name}
                               description={ticket.description}
                               url={ticket.url}
                               projectRelations={ticket.projectRelations}
                               contextUri={this.props.contextUri}
            />;
        }) : <Alert variant={"light"} className={"h-10"}>
            The list is empty.
        </Alert>;
    }

    requestTickets() {
        if (!this.props.contextUri) {
            return;
        }
        this.setState({loading: true})
        API.post("/rest/ticket/category", null, {
            params: {
                "projectName": this.props.projectName,
                "contextUri": this.props.contextUri,
            }
        }).then(response => {
            return response.data;
        }).then(ticketsInCategories => {
            this.setState({
                loading: false,
                recordTickets: ticketsInCategories.recordTickets,
                formVersionTickets: ticketsInCategories.formVersionTickets,
                questionTickets: ticketsInCategories.questionTickets,
                contextUri: this.props.contextUri
            });
        });
    }

    render() {
        const recordTickets = this.state.recordTickets
        const formVersionTickets = this.state.formVersionTickets
        const questionTickets = this.state.questionTickets

        if (this.state.loading || !(recordTickets && formVersionTickets && questionTickets)) {
            return <Alert variant={"light"} className={"h-10"}>
                Loading tickets...
            </Alert>
        }

        const recordTicketsLines = this.createTicketLines(recordTickets);
        const formVersionTicketsLines = this.createTicketLines(formVersionTickets);
        const questionTicketsLines = this.createTicketLines(questionTickets);

        return <div>
            <Button className={"float-right"} variant="link" onClick={() => this.requestTickets()}>refresh</Button>
            <Tabs defaultActiveKey="#" transition={false} id="ticket-tabs">
                <Tab eventKey="record" title={"Record snapshot related (" + recordTickets.length + ")"}>
                    <br/>
                    {recordTicketsLines}
                </Tab>
                <Tab eventKey="formVersion" title={"Form version related (" + formVersionTickets.length + ")"}>
                    <br/>
                    {formVersionTicketsLines}
                </Tab>
                <Tab eventKey="question" title={"Question related (" + questionTickets.length + ")"}>
                    <br/>
                    {questionTicketsLines}
                </Tab>
            </Tabs>
        </div>
    }
}
