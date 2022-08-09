import React from "react";
import "./App.css";
import { Typography } from "@mui/material";

export default class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = { comment: "" };
  }

  componentDidUpdate(prevState) {
    if (this.state.comment !== prevState.comment) {
      console.log("CDU comment");
      console.log(this.props.messageItem.val.comments);
    }
  }

  render() {
    let comments = this.props.messageItem.val.comments.filter(
      (comment) => comment.text.length > 0
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
        {comments.length > 0 ? (
          <div>
            <p>Comments:</p>
            <ul>
              {comments.map((comment) => {
                return (
                  <li className="listitem">
                    <Typography variant="overline" fontSize={10}>
                      {comment.user}:
                    </Typography>
                    <Typography
                      variant="p"
                      fontSize={18}
                      sx={{ textAlign: "center" }}
                    >
                      {comment.text}
                    </Typography>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }
}
