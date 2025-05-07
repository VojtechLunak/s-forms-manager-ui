import React from 'react';

import 's-forms/css/s-forms.min.css'
import 'react-datepicker/dist/react-datepicker.css';
import {ContextOverview} from "./components/context/ContextOverview";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {WelcomePage} from "./components/navigation/WelcomePage";
import HeaderNavigationBar from "./components/navigation/HeaderNavigationBar";
import {connect} from "react-redux";
import {ProjectsOverview} from "./components/projects/ProjectsOverview";
import AddProjectForm from "./components/projects/AddProjectForm";
import {RecordsOverview} from "./components/form/RecordsOverview";
import {SearchOverview} from "./components/search/SearchOverview";
import {TicketsOverview} from "./components/ticket/TicketsOverview";
import {BASENAME} from "./api";

class App extends React.Component {

    constructor(props) {
        super(props);
        this.refForm = React.createRef();
    }

    render() {
        return (
            <div>
                <Router basename={BASENAME}>
                    <HeaderNavigationBar store={this.props.store}/>

                    <Switch>
                        <Route exact path="/">
                            <WelcomePage/>
                        </Route>
                        <Route exact path="/browse/forms/:projectName?"
                               component={RecordsOverview}>
                        </Route>
                        <Route exact path="/browse/forms/:projectName/version/:versionKey?"
                               component={RecordsOverview}>
                        </Route>
                        <Route exact path="/browse/forms/:projectName/record/:recordSnapshotKey?"
                               component={RecordsOverview}>
                        </Route>
                        <Route exact path="/browse/contexts/:projectName"
                               component={ContextOverview}>
                        </Route>
                        <Route path="/projects/add"> {/* has to be in front of /projects */}
                            <AddProjectForm/>
                        </Route>
                        <Route path="/projects">
                            <ProjectsOverview/>
                        </Route>
                        <Route exact path="/search/forms/:projectName"
                               component={SearchOverview}>
                        </Route>
                        <Route exact path="/browse/tickets/:projectName"
                               component={TicketsOverview}>
                        </Route>
                    </Switch>
                </Router>
            </div>
        );
    }
}

export default connect()(App);
