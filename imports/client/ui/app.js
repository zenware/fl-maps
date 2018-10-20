import { hot } from 'react-hot-loader'
import { Meteor } from 'meteor/meteor'
import React, { Component, Fragment } from 'react'
import { Router, Route, Redirect } from 'react-router-dom'
import history from '../utils/history'
import qs from 'query-string'

// DOCUSS STYLES
import './style.scss'

// Includes
import MainMenu from './includes/MainMenu'

// Pages
import Home from './pages/Home'
import About from './pages/About'
import Authentication from './pages/Authentication'
import Map_ from './pages/Map'
import NewEventLoadable from './pages/NewEvent/loadable'
import CongratsModal from './pages/NewEvent/CongratsModal'
import Page from './pages/Page'

// Components
import ScrollToTop from './components/ScrollToTop'

class App extends Component {
  constructor () {
    super()
    this.state = {
      dcsShowRight: false,
      dcsSel: true
    }
  }

  componentDidMount () {
    setTimeout(() => {
      document.querySelector('#root').classList.toggle('show')
    }, 100) // add a fading effect on the inital loading
  }

  render () {
    let dcsClass = ''
    if (this.state.dcsShowRight) {
      dcsClass += 'dcs-show-right '
    }
    if (this.state.dcsSel) {
      dcsClass += 'dcs-sel '
    }

    return (
      // DOCUSS
      <div id="dcs-root" className={dcsClass}>
        <div id="dcs-ghost">
          <div className="dcs-ghost-splitbar" />
        </div>

        <div id="dcs-left">
          <Router history={history}>
            <Fragment>
              <MainMenu />

              <ScrollToTop>
                <Route exact path='/(home)?' component={Home} />
                <Route exact path='/about' component={About} />
                <Route path='/map' component={Map_} />
                <Route path='*' render={this.renderNewEvent} />
                <Route exact path='/thank-you' component={CongratsModal} />
                {/*
                <Route exact path='/page/:id' component={Page} />
                REPLACED BY THE FOLLOWING LINE TO PASS THE dcsSelect FUNCTION
                AS A PROP. IS THERE A BETTER WAY?
                */}
                <Route
                  exact
                  path="/page/:id"
                  render={props => (
                    <Page {...props} dcsSelect={this.dcsSelect.bind(this)} />
                  )}
                />

                <Authentication />
              </ScrollToTop>
            </Fragment>
          </Router>
        </div>
        <div id="dcs-splitbar">
          <div id="dcs-logo">
            <img src="/images/dcs-logo.png" />
          </div>
          <div style={{ flex: '1 0 0' }} />
          <div id="dcs-splitbar-btn" onClick={this.onDcsSplitbarClick}>
            <div style={{ flex: '1 0 0' }} />
            <div id="dcs-splitbar-btn-text">&gt;</div>
            <div style={{ flex: '1 0 0' }} />
          </div>
          <div style={{ flex: '1 0 0' }} />
        </div>

        <iframe
          id="dcs-right"
          width="0"
          frameBorder="0"
          style={{ minWidth: 0 }}
          src="https://discuss.focallocal.org/"
        />
      </div>
    )
  }

  onDcsSplitbarClick = () => {
    this.setState({ dcsShowRight: !this.state.dcsShowRight })
  }

  dcsSelect (select) {
    // const dcState = this.props.
    this.setState({ dcsShowRight: select, dcsSel: select })
  }


  renderNewEvent = ({ location, history }) => {
    const { new: new_, edit } = qs.parse(location.search)
    const isOpen = Boolean(new_ === '1' || (edit === '1' && window.__editData))

    if (isOpen && !Meteor.userId()) {
      sessionStorage.setItem('redirect', '/?new=1')
      return <Redirect to='/sign-in' />
    }

    return <NewEventLoadable isOpen={isOpen} location={location} history={history} />
  }
}

export default hot(module)(App)
