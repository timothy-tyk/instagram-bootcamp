import { useState } from "react";
import Likes from "./Likes";
import Comments from "./Comments";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@mui/material";

export default function Post(props) {
  const { id } = useParams();
  const [message, setMessage] = useState(props.msg);
  const [index, setIndex] = useState(id);
  const [user, setUser] = useState(props.user);
  const navigate = useNavigate();

  return (
    <div>
      Post: {message.val.message} | <i>{message.val.date}</i> | By:{" "}
      {message.val.user}
      <Likes
        index={index}
        message={message}
        likes={message.val.likes}
        handleClick={() => {
          console.log(message.val);
          let updatedData = {
            key: message.key,
            val: {
              date: message.val.date,
              user: message.val.user,
              imageurl: message.val.imageurl,
              likes: message.val.likes + 1,
              message: message.val.message,
              comments: message.val.comments,
            },
          };
          props.handleLike(updatedData);
          setMessage(updatedData);
        }}
      />
      <br />
      <img className="images" src={message.val.imageurl} alt="" />
      <br />
      <Comments
        user={props.user}
        index={id}
        messageItem={message}
        handleClick={(comment) => {
          let updatedData = {
            key: message.key,
            val: {
              date: message.val.date,
              user: message.val.user,
              imageurl: message.val.imageurl,
              likes: message.val.likes,
              message: message.val.message,
              comments: [
                ...message.val.comments,
                { text: comment, user: props.user },
              ],
            },
          };
          props.handleComment(updatedData);
          setMessage(updatedData);
        }}
      />
      <br />
      <Button
        onClick={() => {
          navigate("/feed");
        }}
      >
        Back To Feed
      </Button>
      <p>Post {index} </p>
    </div>
  );
}
