jest.unmock( '../TextualProgressIndicator' );

import React from 'react';
import TestUtils from "react-addons-test-utils";
import TextualProgressIndicator from '../TextualProgressIndicator';

describe( 'a processIndicator component', () => {
	let renderer = TestUtils.createRenderer();

	let inputProps = {
		currentStepNumber: 1,
		totalSteps: 1
	};

	it( 'shows a paragraph with the progress', () => {
		let processIndicator = new TextualProgressIndicator( inputProps );
		let children = processIndicator.props.children;

		expect( processIndicator.type ).toEqual( 'p' );

		expect( children[ 0 ] ).toEqual( 'Step ' );
		expect( children[ 1 ] ).toEqual( inputProps.currentStepNumber );
		expect( children[ 2 ] ).toEqual( ' of ' );
		expect( children[ 3 ] ).toEqual( inputProps.totalSteps );
	} );

	it( 'shows unknown progress with currentStepNumber 0', () => {
		let processIndicator = new TextualProgressIndicator(
			{
				currentStepNumber: 0,
				totalSteps: 1
			}
		);

		expect( processIndicator.type ).toEqual( 'p' );
		expect( processIndicator.props.children ).toEqual( 'Unknown step progress' );
	} );

	it( 'shows unknown progress with total steps lower than the current step', () => {
		let currentStepNumber = 2;

		let processIndicator = new TextualProgressIndicator(
			{
				currentStepNumber,
				totalSteps: 1
			}
		);

		let children = processIndicator.props.children;

		expect( children[ 0 ] ).toEqual( 'Step ' );
		expect( children[ 1 ] ).toEqual( currentStepNumber );
	} );

	it( 'throws error with one or more missing parameters', () => {
		console.error = jest.genMockFn();
		renderer.render( <TextualProgressIndicator /> );
		renderer.getRenderOutput();

		expect( console.error ).toBeCalled();

		let errors = console.error.mock.calls;
		expect( errors[ 0 ][ 0 ] )
			.toContain( "Warning: Failed prop type: Required prop `currentStepNumber` was not specified in `TextualProgressIndicator`." );
		expect( errors[ 1 ][ 0 ] )
			.toContain( "Warning: Failed prop type: Required prop `totalSteps` was not specified in `TextualProgressIndicator`." );
	} );

	it( 'throws error with invalid prop types', () => {
		console.error = jest.genMockFn();
		renderer.render( <TextualProgressIndicator currentStepNumber={"test"} totalSteps={[]}/> );
		renderer.getRenderOutput();

		expect( console.error ).toBeCalled();

		let errors = console.error.mock.calls;
		expect( errors[ 0 ][ 0 ] )
			.toContain( "Warning: Failed prop type: Invalid prop `currentStepNumber` of type `string` supplied to `TextualProgressIndicator`" );
		expect( errors[ 1 ][ 0 ] )
			.toContain( "Warning: Failed prop type: Invalid prop `totalSteps` of type `array` supplied to `TextualProgressIndicator`" );
	} );
} );
