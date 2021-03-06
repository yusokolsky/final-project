import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import MainPage from "./MainPage.jsx";
import Services from "./Services.jsx";
import Service from "./Service.jsx";
import AboutUs from "./AboutUs.jsx";
import Admin from "./Admin.jsx";
import Profile from "./Profile.jsx";
import NoMatch from "./NoMatch.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import {Loading} from "./components/Loading.jsx";
import AppointmentsRender from "./components/AppointmentsRender.jsx"
import Authorization from "./components/Authorization.jsx"

import $ from "jquery";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: false,
      userData: {},
      Loading: true,
    };
    this.handleLoginLogout = this.handleLoginLogout.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);

    this.setData = this.setData.bind(this);
  }
  componentDidMount() {
    $.when(
      $.ajax({
        url: "/api/runtime/",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
      })
    ).then(
        function (data) {
          if (data._id != null) {
            this.setState({
              auth: true,
              userData: data,
              Loading: false,
            });
          } else {
            this.setState({
              Loading: false,
            });
        }
      }.bind(this)
    );
  }

  handleLoginLogout() {
    if (this.state.auth) {
      this.setState(
        {
          auth: false,
          userData: {},
        },
        () => {
          $.ajax({
            url: "/api/logout/",
            type: "POST",
            contentType: "application/json",
            dataType: "json",
          });
        }
      );
    } else {
      this.setState({
        auth: true,
      });
    }
  }

  setData(data) {
    this.setState({
      userData: data,
    });
  }

  render() {
    return (
      <Router>
        <Header
          isAuth={this.state.auth}
          handleLoginLogout={this.handleLoginLogout}
        />
        {!this.state.Loading &&
          <Switch>
            <Route exact path="/">
              <MainPage />
            </Route>
            <Route
              path="/services/:id"
              render={(props) => (
                  <Service
                      {...props}
                      isAuth={this.state.auth}
                      userData={this.state.userData}
                      handleLoginLogout={this.handleLoginLogout}
                      setData={this.setData}
                  />
              )}
            />
            <Route path="/services">
              <Services/>
            </Route>
            <Route path="/about">
              <AboutUs/>
            </Route>
            <Route exact path="/authorization" render={() =>
                this.state.auth ? (
                    <Redirect
                        to={{
                          pathname: "/profile",
                        }}
                    />
                ) : (
                    <Authorization isAuth={this.state.auth}
                                   handleLoginLogout={this.handleLoginLogout}
                                   setData={this.setData}
                                   userData={this.state.userData}/>
                )}
            />
            <Route exact path="/profile" render={() =>
                this.state.auth ? (
                    <Profile
                        setData={this.setData}
                        userData={this.state.userData}
                    />
                ) : (
                    <Redirect
                        to={{
                          pathname: "/authorization",
                        }}
                    />
                )}
            />
            <Route exact path="/user-appointments" render={() =>
                this.state.auth ? (
                    <AppointmentsRender userData={this.state.userData}/>
                ) : (
                    <Redirect
                        to={{
                          pathname: "/profile",
                        }}
                    />
                )}
            />
            <Route path="/admin">
              <Admin/>
            </Route>

            <Route path="*" component={NoMatch}/>
          </Switch>
        }
        {this.state.Loading && <Loading />}
        <Footer />
      </Router>
    );
  }
}

ReactDOM.render(
    <App/>,

    document.getElementById("main")
);
