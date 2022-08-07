import React from "react";

export default class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = { toggle: false, comment: "" };
  }

  componentDidUpdate(prevState) {
    if (this.state.comment !== prevState.comment) {
      console.log("CDU comment");
    }
  }

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.comment}
          placeholder="Comments"
          onChange={(e) => this.setState({ comment: e.target.value })}
        />
        <input
          type="submit"
          value="Comment"
          onClick={() => {
            this.props.handleClick(this.state.comment);
            this.setState({ comment: "" });
          }}
        />
      </div>
    );
  }
}
