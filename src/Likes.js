import React, { useEffect, useState } from "react";
import { ref, update } from "firebase/database";
import { database } from "./firebase";

const MESSAGE_FOLDER_NAME = "messages";

export default function Likes(props) {
  const [newData, setNewData] = useState({});

  const updateLikes = (item, i) => {
    const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
    const updates = {};
    let updatedData = {
      date: item.val.date,
      user: item.val.user,
      imageurl: item.val.imageurl,
      likes: item.val.likes + 1,
      message: item.val.message,
      comments: item.val.comments,
    };
    setNewData({ newData: updatedData });
    updates[item.key] = updatedData;
    update(messageListRef, updates).then(() => {
      console.log("data updated!");
    });
  };

  return (
    <div>
      <p>{props.likes} Likes</p>
      <input
        type="submit"
        value="Like"
        onClick={() => {
          updateLikes(props.message, props.index);
          let updatedData = {
            date: props.message.val.date,
            user: props.message.val.user,
            imageurl: props.message.val.imageurl,
            likes: props.message.val.likes + 1,
            message: props.message.val.message,
            comments: props.message.val.comments,
          };
          props.handleClick(props.index, updatedData);
        }}
      />
    </div>
  );
}
