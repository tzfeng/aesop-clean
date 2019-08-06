/* tslint:disable */
import * as React from 'react';
import '../button.css';
// import * as PropTypes from 'prop-types';

export class DateButton extends React.Component<{}, {}> {

  render () {
    return (
      <button
        className="main-button">
        Set insight expiry date.
      </button>
    )
  }
}