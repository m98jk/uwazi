import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';
import { RowList } from 'app/Layout/Lists';
import Doc from 'app/Library/components/Doc';
import ResultsSidePanel from './ResultsSidePanel';


const countSentencesAboveThreshold = (item, threshold) =>
  item.getIn(['semanticSearch', 'results']).toJS()
  .findIndex(({ score }) => score < threshold); // use findIndex cause array is sorted by score

const filterItems = (items, { threshold, minRelevantSentences }) => items.filter((item) => {
  const aboveThreshold = countSentencesAboveThreshold(item, threshold);
  return item.getIn(['semanticSearch', 'averageScore']) >= threshold && aboveThreshold >= minRelevantSentences;
});

export class SemanticSearchResults extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.items.length !== this.props.items.length ||
    nextProps.isEmpty !== this.props.isEmpty ||
    nextProps.searchTerm !== this.props.searchTerm;
  }

  render() {
    const { items, isEmpty, searchTerm } = this.props;

    return (
      <div className="row panels-layout">
        { isEmpty &&
          <React.Fragment>
            <p>Search not found</p>
            <Helmet title="Semantic search not found" />
          </React.Fragment>
        }
        { !isEmpty &&
          <React.Fragment>
            <Helmet title={`${searchTerm} - Semantic search results`} />
            <main className="semantic-search-results-viewer document-viewer with-panel">
              <div>
                { searchTerm }
              </div>
              <RowList>
                {items.map((doc, index) => (
                  <Doc
                    doc={doc}
                    key={index}
                    onClick={this.clickOnDocument}
                  />
                ))}
              </RowList>
            </main>
            <ResultsSidePanel />
          </React.Fragment>
        }
      </div>
    );
  }
}


SemanticSearchResults.propTypes = {
  items: PropTypes.array.isRequired,
  isEmpty: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string.isRequired
};

export const mapStateToProps = (state) => {
  const search = state.semanticSearch.search;
  const searchTerm = search.get('searchTerm');
  const results = search.get('results');
  const filters = state.semanticSearch.resultsFilters;
  const items = results ? filterItems(results, filters) : [];
  const isEmpty = Object.keys(search).length === 0;
  return {
    searchTerm,
    items,
    isEmpty
  };
};

export default connect(mapStateToProps)(SemanticSearchResults);
