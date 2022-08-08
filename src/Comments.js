import React from "react";
import "./App.css";

export default class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = { toggle: false, comment: "" };
  }

  componentDidUpdate(prevState) {
    if (this.state.comment !== prevState.comment) {
      console.log("CDU comment");
      console.log(this.props.messageItem.val.comments);
    }
  }

  render() {
    let comments = this.props.messageItem.val.comments.filter(
      (comment) => comment.length > 0
    );
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
        {comments.length > 1 ? (
          <div>
            <p>Comments:</p>
            <ol>
              {comments.map((comment) => {
                return <li className="listitem">{comment}</li>;
              })}
            </ol>
          </div>
        ) : null}
      </div>
    );
  }
}
