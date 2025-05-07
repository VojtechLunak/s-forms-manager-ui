import React from "react";
import {CategorizedTicketsList} from "./ticket/CategorizedTicketsList";
import {SFormsDisplay} from "./SFormsDisplay";
import {CreateTicketForm} from "./ticket/CreateTicketForm";
import Button from "react-bootstrap/Button";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretDown} from "@fortawesome/free-solid-svg-icons/faCaretDown";
import Collapse from "react-bootstrap/Collapse";

export class TicketsWithSFormsBoard extends React.Component {

    constructor() {
        super();
        this.state = {
            createTicketCollapseOpen: false,
            relatedTicketsCollapseOpen: false,
            displayFormCollapseOpen: true
        }
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot: SS) {
        if (prevProps.contextUri !== this.props.contextUri) {
            this.setState({
                relatedTicketsCollapseOpen: false,
                createTicketCollapseOpen: false,
                displayFormCollapseOpen: true,
            })
        }
    }

    render() {
        return <div>
            <h5>
                Related Tickets
                <Button
                    variant="link" size="sm"
                    onClick={() => this.setState({relatedTicketsCollapseOpen: !this.state.relatedTicketsCollapseOpen})}
                    aria-controls="related-tickets-collapse"
                    aria-expanded={this.state.relatedTicketsCollapseOpen}
                >
                    <FontAwesomeIcon color="black" icon={faCaretDown}/>
                </Button>
            </h5>
            <Collapse in={this.state.relatedTicketsCollapseOpen}>
                <div id="related-tickets-collapse">
                    <CategorizedTicketsList projectName={this.props.projectName} contextUri={this.props.contextUri}
                                            displayed={this.state.relatedTicketsCollapseOpen}/>
                </div>
            </Collapse>

            <br/>
            <h5>
                Create Ticket
                <Button
                    variant="link" size="sm"
                    onClick={() => this.setState({createTicketCollapseOpen: !this.state.createTicketCollapseOpen})}
                    aria-controls="create-ticket-collapse"
                    aria-expanded={this.state.createTicketCollapseOpen}
                >
                    <FontAwesomeIcon color="black" icon={faCaretDown}/>
                </Button>
            </h5>
            <Collapse in={this.state.createTicketCollapseOpen}>
                <div id="create-ticket-collapse">
                    <CreateTicketForm projectName={this.props.projectName}
                                      contextUri={this.props.contextUri}/>
                </div>
            </Collapse>

            <br/>
            <h5>
                Form display
                <Button
                    variant="link" size="sm"
                    onClick={() => this.setState({displayFormCollapseOpen: !this.state.displayFormCollapseOpen})}
                    aria-controls="form-display-collapse"
                    aria-expanded={this.state.displayFormCollapseOpen}
                >
                    <FontAwesomeIcon color="black" icon={faCaretDown}/>
                </Button>
            </h5>
            <Collapse in={this.state.displayFormCollapseOpen}>
                <div id="form-display-collapse">
                    <SFormsDisplay projectName={this.props.projectName} contextUri={this.props.contextUri} formTemplateVersionInternalName={this.props.formTemplateVersionInternalName}/>
                </div>
            </Collapse>
            <br/>
        </div>
    }
}

