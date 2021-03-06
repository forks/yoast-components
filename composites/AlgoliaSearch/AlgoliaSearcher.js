import React from "react";
import initAlgoliaSearch from "algoliasearch";
import isUndefined from "lodash/isUndefined";
import a11ySpeak from "a11y-speak";

import Loading from "./Loading";
import ArticleContent from "./ArticleContent";
import SearchResult from "./SearchResult";
import SearchBar from "./SearchBar";

class AlgoliaSearcher extends React.Component {

	/**
	 * AlgoliaSearcher constructor.
	 *
	 * @constructor
	 * @param {object} props Properties of the AlgoliaSearcher component.
	 *
	 * @returns {void}
	 */
	constructor( props ) {
		super();

		this.state = {
			searchString: "",
			usedQueries: {},
			results: [],
			errorMessage: "",
			showDetail: false,
			searching: false,
		};

		this.props = props;

		this.initAlgoliaClient();
		this.searchButtonClicked = this.searchButtonClicked.bind( this );
		this.hideDetail = this.hideDetail.bind( this );
	}

	/**
	 * Initializes the algolia client and index variables.
	 *
	 * @returns {void}
	 */
	initAlgoliaClient() {
		this.client = initAlgoliaSearch( this.props.algoliaApplicationId, this.props.algoliaApiKey );
		this.index = this.client.initIndex( this.props.algoliaIndexName );
	}

	/**
	 * Handles the form submit event. Stores the search string and performs a search.
	 *
	 * @param {object} clickEvent The React SyntheticEvent.
	 *
	 * @returns {void}
	 */
	searchButtonClicked( clickEvent ) {
		let searchString = clickEvent.target.getElementsByTagName( "input" )[ 0 ].value;

		if ( searchString === "" ) {
			return;
		}

		let usedQueries = this.state.usedQueries;

		if ( isUndefined( usedQueries[ searchString ] ) ) {
			usedQueries[ searchString ] = {};
		}

		// Updating the state will re-render the whole component.
		this.setState( {
			searchString,
			usedQueries,
			searching: true,
		}, this.updateSearchResults );
	}

	/**
	 * Processes the passed search error.
	 *
	 * @param {object} error The search error to process.
	 *
	 * @returns {void}
	 */
	processSearchError( error ) {
		// Updating the state will re-render the whole component.
		this.setState( {
			errorMessage: error.message,
			searching: false,
		} );
	}

	/**
	 * Processes the search results.
	 *
	 * @param {object} results The results to process.
	 *
	 * @returns {void}
	 */
	processResults( results ) {
		// Updating the state will re-render the whole component.
		this.setState( {
			results: results,
			errorMessage: "",
			searching: false,
		} );
	}

	/**
	 * Performs a search with the searchstring saved in the state and sets the
	 * results property of the state to the results found.
	 *
	 * @returns {void}
	 */
	updateSearchResults() {
		this.setState( { searching: true } );

		this.performSearch( this.state.searchString ).then( this.processResults.bind( this ) ).catch( this.processSearchError.bind( this ) );
	}

	/**
	 * Performs a search with a given search string on the algolia index which
	 * information was passed in the AlgoliaSearcher's props.
	 *
	 * @param {string} searchString The words or sentence to get the results for.
	 *
	 * @returns {Promise} The promise that is performing the search.
	 */
	performSearch( searchString ) {
		return new Promise( ( resolve, reject ) => {
			this.index.search( searchString, ( err, data ) => {
				if ( err ) {
					reject( err );
					return;
				}

				resolve( data.hits );
			} );
		} );
	}

	/**
	 * Sets all values required to display the detail view of a search result.
	 *
	 * @param {number} resultIndex The index of the article you want to
	 *                                  show in the state.results array.
	 * @returns {void}
	 */
	showDetail( resultIndex ) {
		let usedQueries = this.state.usedQueries;
		let post = this.state.results[ resultIndex ];

		usedQueries[ this.state.searchString ][ post.objectID ] = {
			title: post.post_title,
			link: post.permalink,
		};

		this.setState( {
			showDetail: resultIndex,
			usedQueries: usedQueries,
		} );
	}

	/**
	 * Hides the details page and return to the results page.
	 *
	 * @returns {void}
	 */
	hideDetail() {
		this.setState( { showDetail: false } );
	}

	/**
	 * Renders a no results found text.
	 *
	 * @returns {ReactElement} The no results found text.
	 */
	renderNoResultsFound() {
		let searchResultContent = <p>{ this.props.noResultsText }</p>;
		a11ySpeak( this.props.noResultsText );

		return searchResultContent;
	}

	/**
	 * Maps the results to SearchResult components.
	 *
	 * @param {object} results The results returned by Algolia.
	 *
	 * @returns {Array} Array containing the mapped search results.
	 */
	resultsToSearchItem( results ) {
		return results.map( ( result, index ) => {
			return <SearchResult
				key={ result.objectID }
				post={ result }
				showDetail={ this.showDetail.bind( this, index ) }
			/>;
		} );
	}

	/**
	 * Renders the search results list.
	 *
	 * @returns {ReactElement|null} A div with either the search results, or a div with a message that no results were found.
	 */
	renderSearchResults() {
		let searchResultContent = null;
		let resultsCount = this.state.results.length;

		// We'll check to see whether no results are returned.
		if ( resultsCount <= 0 && this.state.searchString !== "" ) {
			return this.renderNoResultsFound();
		}

		if ( resultsCount === 0 ) {
			return searchResultContent;
		}

		let results = this.resultsToSearchItem( this.state.results );

		searchResultContent = <ul role="list" className="wpseo-kb-search-results">{ results }</ul>;
		a11ySpeak( this.props.foundResultsText.replace( "%d", resultsCount ) );

		return searchResultContent;
	}

	/**
	 * Renders the navigation buttons and the article content.
	 *
	 * @returns {ReactElement} A div with navigation buttons and the article content.
	 */
	renderDetail() {
		let detailIndex = this.state.showDetail;
		let post = this.state.results[ detailIndex ];

		return (
			<div className="wpseo-kb-search-detail">
				<div className="wpseo-kb-search-navigation">
					<button className="button dashicon-button wpseo-kb-search-back-button"
					        aria-label={ this.props.backLabel }
					        onClick={ this.hideDetail }>
						{ this.props.back }
					</button>

					<a href={ post.permalink }
					   className="button dashicon-button wpseo-kb-search-ext-link "
					   aria-label={ this.props.openLabel }
					   target="_blank">
						{ this.props.open }
					</a>
				</div>

				<ArticleContent post={post} iframeTitle={this.props.iframeTitle}/>
			</div>
		);
	}

	/**
	 * Log any occuring error and render a search error warning.
	 *
	 * @param {string} errorMessage The message to display.
	 * @returns {ReactElement} A p tag with a warning that the search was not completed.
	 */
	renderError( errorMessage ) {
		console.error( errorMessage );
		a11ySpeak( this.props.errorMessage );

		return ( <p>{ this.props.errorMessage }</p> );
	}

	/**
	 * Creates the Search Bar component with additional components such as a loading indicator, errors etc.
	 *
	 * @returns {ReactElement} A div containing the search bar and potential other components.
	 */
	createSearchBar() {
		let errorMessage = "";
		let loadingIndicator = "";
		let resultsHeading = "";
		let results = "";

		let searchBar = <SearchBar
			headingText={ this.props.headingText }
			submitAction={ this.searchButtonClicked.bind( this ) }
			searchString={ this.state.searchString }
			searchButtonText={ this.props.searchButtonText }
		/>;

		// Show an error message.
		if ( this.state.errorMessage ) {
			errorMessage = this.renderError( this.state.errorMessage );
		}

		// Show a loading indicator.
		if ( this.state.searching ) {
			loadingIndicator = <Loading loadingPlaceholder={ this.props.loadingPlaceholder } />;
		}

		// Show the list of search results if the postId for the detail view isn't set.
		if ( this.state.showDetail === false ) {
			resultsHeading = this.determineResultsHeading();
			results = this.renderSearchResults();
		}

		// Else show the article content/detail view.
		if ( this.state.showDetail !== false ) {
			searchBar = "";
			results = this.renderDetail();
		}

		return <div>
			{ searchBar }
			{ errorMessage }
			{ loadingIndicator }
			{ resultsHeading }
			{ results }
		</div>;
	}

	/**
	 * Render the React component.
	 *
	 * Called upon each state change. Determines and renders the view to render.
	 *
	 * @returns {ReactElement} The content of the component.
	 */
	render() {
		return <div className="wpseo-kb-search-container">{ this.createSearchBar() }</div>;
	}

	/**
	 * Determines whether a search result heading should be created or not.
	 *
	 * @returns {ReactElement|string} Returns a header if there are search results. Otherwise returns an empty string.
	 */
	determineResultsHeading() {
		if ( this.state.results.length === 0 ) {
			return "";
		}

		return <h2 className="screen-reader-text">{this.props.searchResultsHeading}</h2>;
	}
}

AlgoliaSearcher.propTypes = {
	foundResultsText: React.PropTypes.string,
	noResultsText: React.PropTypes.string,
	headingText: React.PropTypes.string,
	searchButtonText: React.PropTypes.string,
	searchResultsHeading: React.PropTypes.string,
	iframeTitle: React.PropTypes.string,
	algoliaApplicationId: React.PropTypes.string.isRequired,
	algoliaApiKey: React.PropTypes.string.isRequired,
	algoliaIndexName: React.PropTypes.string.isRequired,
	errorMessage: React.PropTypes.string.isRequired,
	loadingPlaceholder: React.PropTypes.string.isRequired,
	open: React.PropTypes.string.isRequired,
	openLabel: React.PropTypes.string.isRequired,
	back: React.PropTypes.string.isRequired,
	backLabel: React.PropTypes.string.isRequired,
};

AlgoliaSearcher.defaultProps = {
	foundResultsText: "Number of search results: %d",
	noResultsText: "No results found.",
	headingText: "Search the Yoast knowledge base",
	searchButtonText: "Search",
	searchResultsHeading: "Search results",
	iframeTitle: "Knowledge base article",
	algoliaApplicationId: "RC8G2UCWJK",
	algoliaApiKey: "459903434a7963f83e7d4cd9bfe89c0d",
	algoliaIndexName: "knowledge_base_all",
	errorMessage: "Something went wrong. Please try again later.",
	loadingPlaceholder: "Loading...",
	back: "Back",
	backLabel: "Back to search results",
	open: "Open",
	openLabel: "Open the knowledge base article in a new window or read it in the iframe below",
};

export default AlgoliaSearcher;
