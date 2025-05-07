import React from 'react';
import Pagination from "react-bootstrap/Pagination";
import Alert from "react-bootstrap/Alert";

export const ITEMS_PER_PAGE = 30;

export class Paginator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activePage: Math.round(this.props.offset / ITEMS_PER_PAGE) + 1,
            numberOfPages: Math.ceil(this.props.totalItems / ITEMS_PER_PAGE),
        }
    }

    handleSelectPage(selectedPage) {
        if (selectedPage > 0 && selectedPage <= this.state.numberOfPages) {
            this.setState({activePage: selectedPage, loading: true})

            this.props.requestItemsHandler((selectedPage - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE)
        }
    }

    render() {
        if (!this.props.totalItems) {
            return <div>Paginator not initialized correctly.</div>
        }
        let loadingMessage;
        if (this.props.loading) {
            loadingMessage = <Alert style={{margin: '0.0'}} variant={"light"} className={"h-10"}>
                Reloading...
            </Alert>
        }

        let leftEllipses;
        if (this.state.activePage > 5) {
            leftEllipses = <Pagination.Ellipsis/>;
        }
        let rightEllipses;
        if (this.state.activePage < this.state.numberOfPages - 5) {
            rightEllipses = <Pagination.Ellipsis/>;
        }

        let items = [];
        let firstDisplayedPage = this.state.activePage > 5 ? this.state.activePage - 4 : 1;
        let lastDisplayedPage;
        if (this.state.activePage < this.state.numberOfPages - 4) {
            lastDisplayedPage = firstDisplayedPage + 9;
        } else {
            lastDisplayedPage = this.state.numberOfPages;
        }

        for (let pageNumber = firstDisplayedPage; pageNumber <= lastDisplayedPage; pageNumber++) {
            items.push(
                <Pagination.Item key={pageNumber} active={pageNumber === this.state.activePage}
                                 onClick={() => this.handleSelectPage(pageNumber)}>
                    {pageNumber}
                </Pagination.Item>,
            );
        }

        return <div>

            <Pagination>
                <Pagination.First onClick={() => this.handleSelectPage(1)}/>
                <Pagination.Prev onClick={() => this.handleSelectPage(this.state.activePage - 1)}/>
                {leftEllipses}
                {items}
                {rightEllipses}
                <Pagination.Next onClick={() => this.handleSelectPage(this.state.activePage + 1)}/>
                <Pagination.Last onClick={() => this.handleSelectPage(this.state.numberOfPages)}/>
                {loadingMessage}
            </Pagination>
        </div>;
    }
}