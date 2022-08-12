import React, { useState } from "react";
import "./App.css";
import { Typography } from "@mui/material";
import { ref, update } from "firebase/database";
import { database } from "./firebase";

export default function Comments(props) {
  const [comment, setComment] = useState("");
  const [newData, setNewData] = useState({});

  const MESSAGE_FOLDER_NAME = "messages";
  const IMAGES_FOLDER_NAME = "images";

  const addComment = (comment) => {
    if (comment !== "") {
      let item = props.messageItem;
      const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
      const updates = {};
      let newData = {
        date: item.val.date,
        user: item.val.user,
        imageurl: item.val.imageurl,
        likes: item.val.likes,
        message: item.val.message,
        comments: [...item.val.comments, { text: comment, user: props.user }],
      };
      updates[item.key] = newData;
      update(messageListRef, updates).then(() => {
        console.log("comment added!");
      });
      let newArray = this.state.messages;
      newArray[props.index].val = newData;
      this.setState({ messages: newArray });
    }
  };

  let comments = props.messageItem.val.comments.filter(
    (comment) => comment.text.length > 0
  );
  return (
    <div>
      <input
        type="text"
        value={comment}
        placeholder="Comments"
        onChange={(e) => setComment(e.target.value)}
      />
      <input
        type="submit"
        value="Comment"
        onClick={() => {
          props.handleClick(comment);
          addComment(comment);
          setComment("");
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
