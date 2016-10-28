import React, { Component, PropTypes } from 'react';
import { graphql, withApollo } from 'react-apollo';
import { withRouter } from 'react-router';

const attributes = 'id, name, email';

export const onEnter = (nextState, replace, callback) => {
  const allow = () => callback();
  const deny = (err) => {
    replace({ pathname: '/' });
    callback(err);
  };
  if (typeof localStorage !== 'undefined' && !localStorage.getItem('token')) {
    deny();
  } else {
    allow();
  }
};

@withRouter
@withApollo
@graphql(gql`
  query verify {
    user: verifyCookie {
      ${attributes}
    }
  }
`, {
  // forceFetch: true,
})
export const userProvider = WrappedComponent => class userProvider extends Component {
  static childContextTypes = {
    user: React.PropTypes.object,
    forgot: React.PropTypes.func,
    reset: React.PropTypes.func,
    checkToken: React.PropTypes.func,
    logout: React.PropTypes.func,
    login: React.PropTypes.func,
    register: React.PropTypes.func,
    userIsLoading: React.PropTypes.bool,
  };
  componentWillUnmount() {
    this.unmounting = true;
  }
  logout = () => {
    const { client } = this.props;
    return client.mutate({
      mutation: gql`
        mutation logout {
          logoutCookie
        }
      `
    }).then(({ data }) => {
    });
  }
  forgot = email => {
    const { client } = this.props;
    return client.mutate({
      mutation: gql`
        mutation forgot {
          forgot(email:"${email}")
        }
      `
    }).then(({ data }) => {
      return data.forgot;
    });
  }
  reset = (token, password) => {
    if (typeof localStorage === 'undefined') return;
    const { client } = this.props;
    return client.mutate({
      mutation: gql`
        mutation reset {
          reset(token:"${token}", password:"${password}")
        }
      `
    }).then(({ data }) => {
      return data.reset;
    }).catch(err => {
    });
  }
  login = (email, password) => {
    if (typeof localStorage === 'undefined') return;
    const { client } = this.props;
    return client.mutate({
      mutation: gql`
        mutation login {
          user: loginCookie(email:"${email}", password:"${password}") {
            ${attributes}
          }
        }
      `
    }).then(({ data }) => {
      const { user } = data;
      this.props.refetch({ });
      return user;
    }).catch(err => {
      this.props.refetch({ });
    });
  }
  register = (user, password) => {
    const { client } = this.props;
    return client.mutate({
      mutation: gql`
        mutation register($user: userInput) {
          register(input: $user, password: "${password}")
        }
      `, variables: { user },
    }).then(({ data }) => {
      return data.register;
    });
  }
  checkToken = key => {
    const { client } = this.props;
    return client.mutate({
      query: gql`
        query checkToken {
          checkToken(token:"${key}")
        }
      `,
    }).then(({ data }) => {
      return data.checkToken;
    });
  }
  getChildContext = () => ({
    user: this.props.data.user,
    logout: this.logout,
    reset: this.reset,
    forgot: this.forgot,
    login: this.login,
    register: this.register,
    checkToken: this.checkToken,
    userIsLoading: this.props.data.loading,
  })
  render() {
    return <WrappedComponent {...this.getChildContext()} {...this.props} />;
  }
};

export const withUser = WrappedComponent => class withUser extends Component {
  static contextTypes = {
    user: React.PropTypes.object,
    forgot: React.PropTypes.func,
    reset: React.PropTypes.func,
    logout: React.PropTypes.func,
    login: React.PropTypes.func,
    register: React.PropTypes.func,
    checkToken: React.PropTypes.func,
    userIsLoading: React.PropTypes.bool,
  };
  render() {
    return (
      <WrappedComponent
        {...this.context}
        {...this.props}
      />
    );
  }
};
