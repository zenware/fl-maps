import React, { Component, Fragment } from 'react'
import { Meteor } from 'meteor/meteor'
import { Redirect } from 'react-router'
import { Route, Switch, withRouter } from 'react-router-dom'
import { withTracker } from 'meteor/react-meteor-data'
import { AccountsReactComponent, AccountsReact } from 'meteor/meteoreact:accounts'
import qs from 'query-string'
import PageLoader from '/imports/client/ui/components/PageLoader'
import RedirectMessage from './RedirectMessage'
import './styles.scss'

class Authentication extends Component {
  constructor (props) {
    super()

    this.state = {
      loading: false,
      redirect: false
    }

    const {
      pathname,
      search
    } = props.location

    if (pathname === '/sso_auth') {
      // User is trying to login from discourse
      const data = qs.parse(search)
      sessionStorage.setItem('_sso', JSON.stringify(data))

      this.state = {
        isSSO: true,
        loading: !!Meteor.userId()
      }
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    // The following line indicates that a user came from discourse, have been successfully logged in
    // and should be redirected back to discourse
    if (nextProps.user && !prevState.user && prevState.isSSO) {
      validateDiscourseSSO()

      return {
        user: true,
        loading: true
      }
    }

    return {
      user: !!nextProps.user
    }
  }

  render () {
    const { arState, signOut } = this
    const {
      isSSO,
      loading
    } = this.state

    const redirect = mapRedirects(sessionStorage.getItem('redirect'))

    return (
      <Fragment>
        <RedirectMessage redirect={redirect} isSSO={isSSO} />

        {loading ? <PageLoader />
          : <Switch>
            <Route exact path='/sign-in' component={arState} />
            <Route exact path='/sign-up' component={arState} />
            <Route exact path='/sign-out' component={signOut} />
            <Route exact path='/forgot-password' component={arState} />
            <Route exact path='/change-password' component={arState} />
            <Route exact path='/reset-password/:token' component={arState} />
            <Route exact path='/sso_auth' component={arState} />
          </Switch>
        }
      </Fragment>
    )
  }

  arState = ({ match, history, location }) => {
    const { isSSO } = this.state
    const { path, params } = match
    const isLoggedIn = !!this.props.user

    if (path === '/sso_auth') {
      return <Redirect to='/sign-in' />
    }

    if (isLoggedIn && path !== '/change-password') {
      // Redirect to home if already logged in.
      // Logged in users can enter only the change-password route
      // If isSSO is true, user has logged in and is now waiting to be redirected back to the forum
      // check if a redirection route have been set
      const redirect = mapRedirects(sessionStorage.getItem('redirect'))

      if (redirect) {
        sessionStorage.removeItem('redirect')
      }

      let to = redirect || '/'
      return isSSO ? <PageLoader /> : <Redirect to={to} />
    }

    const title = mapTitles[path]
    window.__setDocumentTitle(title)

    return (
      <div id='authentication'>
        <h2>{title}</h2>
        <div>
          <AccountsReactComponent
            history={history}
            route={path}
            token={params.token} // for the reset-password route
          />
        </div>
      </div>
    )
  }

  signOut = () => {
    AccountsReact.logout()
    return <Redirect to='/' />
  }
}

function validateDiscourseSSO () {
  const sso_data = sessionStorage.getItem('_sso')

  if (sso_data) {
    Meteor.call('General.validateSSO', JSON.parse(sso_data), (err, res) => {
      if (!err) {
        window.location = 'https://discuss.focallocal.org/session/sso_login?' + res
      } else {
        alert('error occured')
      }

      if (Meteor.isDevelopment) {
        console.log(err)
        console.log('error occured while using discourse sso')
      }
    })
  }
}

const mapTitles = {
  '/sign-in': 'Sign in',
  '/sign-up': 'Sign up',
  '/forgot-password': 'Forgot password',
  '/change-password': 'Change password'
}

const mapRedirectsObj = {
  '/?new=1': '/?new=1'
}

const mapRedirects = (url) => {
  if (!url) {
    return
  }

  if (url.startsWith('/page/')) { // dynamic url...
    return url
  } else {
    return mapRedirectsObj[url]
  }
}

export default withRouter(withTracker(() => {
  return {
    user: Meteor.user()
  }
})(Authentication))

// For testing
export {
  Authentication,
  validateDiscourseSSO
}
