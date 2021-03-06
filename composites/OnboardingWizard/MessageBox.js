import React from "react";
import YoastLogo from "../basic/YoastLogo";

import interpolateComponents from "interpolate-components";

/**
 * Creates a message box in the style of the onboarding wizard.
 *
 * @param {object} props Object containing the text and link to render in the messagebox.
 *
 * @returns {ReactElement} The rendered message box.
 */
const MessageBox = ( props ) => (
	<div className="yoast-wizard-body">
		<YoastLogo height={ 93 } width={ 200 }/>
		<div className="yoast-wizard-container yoast-wizard-container--no-navigation">
			<div className="yoast-wizard">
				{ interpolateComponents( props ) }
			</div>
		</div>
	</div>
);

export default MessageBox;

