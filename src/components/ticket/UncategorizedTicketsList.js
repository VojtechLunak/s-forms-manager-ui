import React from 'react';
import Alert from "react-bootstrap/Alert";
import API from "../../api";
import {TicketLine} from "./TicketLine";

export class UncategorizedTicketsList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tickets: null,
        }
    }

    componentDidMount() {
        this.requestTickets();
    }

    requestTickets() {
        API.post("/rest/ticket/project", null, {
            params: {
                "projectName": this.props.projectName,
            }
        }).then(response => {
            this.setState({tickets: response.data});
        });
    }

    render() {

        const tickets = this.state.tickets

        if (!tickets) {
            return <Alert variant={"light"} className={"h-10"}>
                Loading tickets...
            </Alert>
        }

        const ticketLines = tickets.length !== 0 ? tickets.map((ticket, i) => {
            return <TicketLine key={i}
                               name={ticket.name}
                               description={ticket.description}
                               url={ticket.url}
                               projectRelations={ticket.projectRelations}
                               projectName={this.props.projectName}
            />;
        }) : <Alert variant={"light"} className={"h-10"}>
            The list is empty.
        </Alert>;

        return <div>
            <span>There are <b>{tickets.length}</b> tickets. </span>
            <hr/>
            {ticketLines}
        </div>

    }
}
