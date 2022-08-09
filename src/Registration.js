import {
  Container,
  createTheme,
  TextField,
  ThemeProvider,
  Typography,
  Button,
} from "@mui/material";
import React from "react";

export default class Registration extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: "", password: "" };
  }

  render() {
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
      },
    });
    return (
      <ThemeProvider theme={theme}>
        <Typography variant="h5">Signup / Login</Typography>
        <Container maxWidth="xl">
          <form>
            <Container>
              <TextField
                label="Email: "
                variant="outlined"
                type="email"
                name="email"
                value={this.state.email}
                onChange={(e) => {
                  this.setState({ email: e.target.value });
                }}
              />
            </Container>
            <br />
            <Container className="input-row">
              <TextField
                label="Password: "
                variant="outlined"
                type="password"
                name="password"
                value={this.state.password}
                onChange={(e) => {
                  this.setState({ password: e.target.value });
                }}
              />
            </Container>
            <br />
            <Button
              type="submit"
              variant="outlined"
              onClick={(e) =>
                this.props.handleSignup(
                  e,
                  this.state.email,
                  this.state.password
                )
              }
            >
              Signup
            </Button>
            <Button
              type="submit"
              variant="outlined"
              onClick={(e) =>
                this.props.handleLogin(e, this.state.email, this.state.password)
              }
              value="Login"
            >
              Login
            </Button>
          </form>
        </Container>
      </ThemeProvider>
    );
  }
}
