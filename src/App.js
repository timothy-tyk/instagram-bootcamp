import React from "react";
import {
  onChildAdded,
  onChildChanged,
  push,
  ref,
  set,
  update,
} from "firebase/database";
import { database, storage } from "./firebase";
import logo from "./logo.png";
import "./App.css";
import {
  getDownloadURL,
  ref as storageReference,
  uploadBytes,
} from "firebase/storage";
import Comments from "./Comments";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const MESSAGE_FOLDER_NAME = "messages";
const IMAGES_FOLDER_NAME = "images";

class App extends React.Component {
  constructor(props) {
    super(props);
    // Initialise empty messages array in state to keep local state in sync with Firebase
    // When Firebase changes, update local state, which will update local UI
    this.state = {
      inputMessage: "",
      messages: [],
      fileInputFile: null,
      fileInputValue: "",
      comment: "",
    };
  }

  componentDidMount() {
    const messagesRef = ref(database, MESSAGE_FOLDER_NAME);
    // onChildAdded will return data for every child at the reference and every subsequent new child
    onChildAdded(messagesRef, (data) => {
      // Add the subsequent child to local component state, initialising a new array to trigger re-render
      this.setState((state) => ({
        // Store message key so we can use it as a key in our list items when rendering messages
        messages: [...state.messages, { key: data.key, val: data.val() }],
      }));
    });
    // onChildChanged(messagesRef, (data) => {
    //   this.setState((state) => ({
    //     messages: [...state.messages, { key: data.key, val: data.val() }],
    //   }));
    // });
  }

  // Note use of array fields syntax to avoid having to manually bind this method to the class
  writeData = (url) => {
    let timeStamp = new Date().toLocaleString();
    const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
    const newMessageRef = push(messageListRef);
    set(newMessageRef, {
      date: timeStamp,
      message: this.state.inputMessage,
      imageurl: url,
      likes: 0,
      comments: [""],
    });
    this.setState({ fileInputValue: "", inputMessage: "" });
  };

  uploadImage = (e) => {
    e.preventDefault();
    console.log(
      "uploading:",
      `${IMAGES_FOLDER_NAME}/${this.state.fileInputFile.name}`
    );
    const storageRef = storageReference(
      storage,
      `${IMAGES_FOLDER_NAME}/${this.state.fileInputFile.name}`
    );
    uploadBytes(storageRef, this.state.fileInputFile)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((url) => {
        return this.writeData(url);
      });
  };

  updateLikes = (item, i) => {
    const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
    const updates = {};
    let newData = {
      date: item.val.date,
      imageurl: item.val.imageurl,
      likes: item.val.likes + 1,
      message: item.val.message,
      comments: item.val.comments,
    };
    updates[item.key] = newData;
    update(messageListRef, updates).then(() => {
      console.log("data updated!");
    });
    let newArray = this.state.messages;
    newArray[i].val = newData;
    this.setState({ messages: newArray });
  };

  addComment = (item, i, comment) => {
    console.log("here");
    if (comment !== "") {
      const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
      const updates = {};
      let newData = {
        date: item.val.date,
        imageurl: item.val.imageurl,
        likes: item.val.likes,
        message: item.val.message,
        comments: [...item.val.comments, comment],
      };
      updates[item.key] = newData;
      update(messageListRef, updates).then(() => {
        console.log("comment added!");
      });
      let newArray = this.state.messages;
      newArray[i].val = newData;
      this.setState({ messages: newArray });
    }
  };

  componentDidUpdate(prevState) {
    if (this.state.messages !== prevState.messages) {
      console.log("CDU: updated ");
      // const messagesRef = ref(database, MESSAGE_FOLDER_NAME);
      // onChildChanged(messagesRef, (data) => {
      //   console.log(data);
      // });
    }
  }
  render() {
    // Convert messages in state to message JSX elements to render
    let messageListItems = this.state.messages.map((message, index) => (
      <li key={message.key} className="feed">
        {message.val.date}
        <input
          type="submit"
          onClick={() => {
            this.updateLikes(message, index);
          }}
          value="Like"
        />{" "}
        {message.val.likes}
        <br /> {message.val.message}
        <br />
        <img className="images" src={message.val.imageurl} alt="" />
        <br />
        <Comments
          handleClick={(comment) => this.addComment(message, index, comment)}
        />
        {/* <input
          type="text"
          value={this.state.comment}
          placeholder="Comments"
          onChange={(e) => {
            this.setState({ comment: e.target.value });
          }}
        />
        <input
          type="submit"
          value="Comment"
          onClick={() => this.addComment(message, index)}
        /> */}
        {message.val.comments.length > 1 ? (
          <div>
            <p>Comments:</p>
            <ul>
              {message.val.comments.map((comment) => (
                <li className="listitem">{comment}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <br />
      </li>
    ));
    return (
      <div className="App">
        <header className="App-header">
          {/* TODO: Add input field and add text input as messages in Firebase */}
          <form>
            <input
              type="text"
              onChange={(e) => this.setState({ inputMessage: e.target.value })}
              value={this.state.inputMessage}
            />

            <input
              type="submit"
              value="Send Message"
              onClick={() => this.writeData("")}
            />
            <br />
            <input
              type="file"
              value={this.state.fileInputValue}
              onChange={(e) =>
                this.setState({
                  fileInputFile: e.target.files[0],
                  fileInputValue: e.target.value,
                })
              }
            />
            <input
              type="submit"
              value="Upload"
              onClick={(e) => {
                this.uploadImage(e);
              }}
            />
          </form>

          <ol>{messageListItems}</ol>
        </header>
      </div>
    );
  }
}

export default App;
