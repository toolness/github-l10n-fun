var _ = require('underscore');
var React = require('react/addons');
var Router = require('react-router');
var bs = require('react-bootstrap');

var PagedEntityStream = require('../../paged-entity-stream');

var GithubErrorAlert = React.createClass({
  render: function() {
    var status = this.props.error.status;

    return (
      <div className="alert alert-danger">
        <p>{this.props.error.message}</p>
        <p>GitHub returned <a target="_blank" href={
          "http://en.wikipedia.org/wiki/HTTP_" + status
        }>HTTP {status}</a>.</p>
        {!this.props.isLoggedIn ? <p>Logging in might help.</p> : null}
      </div>
    );
  },
});

var BranchSelector = React.createClass({
  render: function() {
    if (this.props.branches.length == 0) return <div></div>;

    return (
      <bs.Input type="select" label="Branch" className="input-sm"
       value={this.props.branch} onChange={this.props.onChangeBranch}>
        {this.props.branches.map(function(branch) {
          return (
            <option key={branch} value={branch}>
              {branch}
            </option>
          );
        })}
      </bs.Input>
    );
  }
});

var Repo = React.createClass({
  mixins: [Router.State, Router.Navigation],
  getInitialState: function() {
    return {
      error: null,
      defaultBranch: '',
      branches: []
    };
  },
  setError: function(msg, e) {
    this.setState({
      error: {message: msg, status: e.status},
    });
    console.log(e);
  },
  fetchBranches: function() {
    var params = this.getParams();
    var branches = [];
    var baseURL = '/repos/' + params.owner + '/' + params.repo;
    var githubRequest = this.props.githubRequest;

    // TODO: Handle error event.
    var stream = new PagedEntityStream({
      url: baseURL + '/branches',
      request: githubRequest
    }).on('data', function(branch) {
      branches.push(branch.name);
    }).on('error', function(e) {
      this.setError('Unable to fetch branch list.', e);
    }.bind(this)).on('end', function() {
      githubRequest('GET', baseURL).end(function(err, res) {
        if (err)
          return this.setError('Unable to fetch repository metadata.', err);
        // TODO: Test all kinds of edge cases here.
        this.setState({
          branches: branches,
          defaultBranch: res.body.default_branch,
          branch: this.state.branch || res.body.default_branch
        });
      }.bind(this));
    }.bind(this));
  },
  componentDidMount: function() {
    this.fetchBranches();
  },
  handleChangeBranch: function(e) {
    this.setState({error: null});
    this.transitionTo(
      this.getPathname(),
      this.getParams(), _.extend(this.getQuery(), {
        branch: e.target.value
      })
    );
  },
  render: function() {
    var params = this.getParams();
    var query = this.getQuery();
    var branch = query.branch || this.state.defaultBranch;
    var isLoading = (this.state.defaultBranch === '');
    var content;

    if (this.state.branches.indexOf(branch) == -1)
      branch = this.state.defaultBranch;

    if (this.state.error) {
      content = (
        <GithubErrorAlert
         isLoggedIn={!!this.props.username}
         error={this.state.error} />
      );
    } else if (isLoading) {
      content = "Loading repository metadata...";
    } else {
      content = (
        <Router.RouteHandler
         branch={branch}
         handleGithubError={this.setError}
         githubRequest={this.props.githubRequest} />
      );
    }

    return (
      <div>
        <h1>{params.owner}/{params.repo}</h1>
        <BranchSelector
         branch={branch}
         branches={this.state.branches}
         onChangeBranch={this.handleChangeBranch} />
        {content}
      </div>
    );
  }
});

module.exports = Repo;
