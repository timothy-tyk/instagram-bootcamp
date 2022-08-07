import React from "react";

export default class Likes extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <p>{this.props.likes} Likes</p>
        <input
          type="submit"
          value="Like"
          onClick={() => this.props.handleClick()}
        />
      </div>
    );
  }
}
