import React from "react";
import {
  onChildAdded,
  onChildChanged,
  push,
  ref,
  set,
  update,
} from "firebase/database";
import { database, storage, auth } from "./firebase";
import Registration from "./Registration";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getDownloadURL,
  ref as storageReference,
  uploadBytes,
} from "firebase/storage";
import Comments from "./Comments";
import Likes from "./Likes";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Container } from "@mui/system";
import NewPost from "./NewPost";
import { Link, useNavigate } from "react-router-dom";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const MESSAGE_FOLDER_NAME = "messages";
const IMAGES_FOLDER_NAME = "images";

export default class NewsFeed extends React.Component {
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
      useremail: this.props.useremail,
      user: {},
    };
  }

  componentDidMount() {
    const messagesRef = ref(database, MESSAGE_FOLDER_NAME);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(user);
        this.setState({
          user: user,
          useremail: user.email,
        });
        const uid = user.uid;
      } else {
        const navigate = useNavigate();
        console.log("goodbye");
      }
    });

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

  // updateLikes = (item, i) => {
  //   const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
  //   const updates = {};
  //   let newData = {
  //     date: item.val.date,
  //     user: item.val.user,
  //     imageurl: item.val.imageurl,
  //     likes: item.val.likes + 1,
  //     message: item.val.message,
  //     comments: item.val.comments,
  //   };
  //   updates[item.key] = newData;
  //   update(messageListRef, updates).then(() => {
  //     console.log("data updated!");
  //   });
  //   let newArray = this.state.messages;
  //   newArray[i].val = newData;
  //   this.setState({ messages: newArray });
  // };

  handleUpdates = (i, newData) => {
    let newArray = this.state.messages;
    newArray[i].val = newData;
    this.setState({ messages: newArray });
  };

  // addComment = (item, i, comment) => {
  //   if (comment !== "") {
  //     const messageListRef = ref(database, MESSAGE_FOLDER_NAME);
  //     const updates = {};
  //     let newData = {
  //       date: item.val.date,
  //       user: item.val.user,
  //       imageurl: item.val.imageurl,
  //       likes: item.val.likes,
  //       message: item.val.message,
  //       comments: [
  //         ...item.val.comments,
  //         { text: comment, user: this.state.useremail },
  //       ],
  //     };
  //     updates[item.key] = newData;
  //     update(messageListRef, updates).then(() => {
  //       console.log("comment added!");
  //     });
  //     let newArray = this.state.messages;
  //     newArray[i].val = newData;
  //     this.setState({ messages: newArray });
  //   }
  // };

  componentDidUpdate(prevProps, prevState) {
    if (this.state.messages !== prevState.messages) {
      console.log("CDU: updated ");
    }
    if (this.props.updatesData !== prevProps.updatesData) {
      this.handleUpdates(this.props.updatesIndex, this.props.updatesData);
    }
  }
  render() {
    // Convert messages in state to message JSX elements to render
    let messageListItems = this.state.messages.map((message, index) => (
      <li key={message.key} className="feed">
        Post:
        <Link to={`/feed/posts/${index}`}>
          <Button onClick={() => this.props.currentMessage(message, index)}>
            Go To Post
          </Button>
        </Link>
        {message.val.message} | <i>{message.val.date}</i> | By:
        {message.val.user}
        <Likes
          index={index}
          message={message}
          likes={message.val.likes}
          handleClick={this.handleUpdates}
        />
        <br />
        <img className="images" src={message.val.imageurl} alt="" />
        <br />
        <Comments
          messageItem={message}
          handleClick={(comment) => this.addComment(message, index, comment)}
        />
        <br />
      </li>
    ));

    //MUI theme
    const theme = createTheme({
      palette: {
        mode: "dark",
      },
      typography: {
        color: "white",
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              height: "56px",
              color: "white",
              border: " solid 0.5px white",
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              minWidth: "25vw",
              backgroundColor: "transparent",
              border: "0.5px solid white",
              margin: "25 0",
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              display: "flex",
            },
          },
        },
        MuiContainer: {
          styleOverrides: {
            root: {
              width: "90vw",
            },
          },
        },
        MuiToolbar: {
          styleOverrides: {
            root: {
              display: "flex",
            },
          },
        },
      },
    });

    return (
      <div className="App">
        <header className="App-header">
          <ThemeProvider theme={theme}>
            <Container>
              <AppBar position="static">
                <Toolbar>
                  <Typography style={{ flex: 1, textAlign: "left" }}>
                    RocketGram!
                  </Typography>
                  <Typography>{this.state.useremail} </Typography>
                  <Button
                    className="logoutbutton"
                    type="submit"
                    variant="outlined"
                    onClick={() => this.props.handleLogout()}
                  >
                    Logout
                  </Button>
                </Toolbar>
              </AppBar>
              <NewPost
                handleSendMessage={(e, user) => this.writeData("", user)}
                handleUploadImage={this.uploadImage}
                user={this.state.useremail}
              />
              <ol>{messageListItems}</ol>
            </Container>
          </ThemeProvider>
        </header>
      </div>
    );
  }
}
