const github = require('@actions/github')
const core = require('@actions/core')
// const util = require('util')

/**
 * Creates Octokit instance and run assign and review.
 *
 * @param {string} token - GitHub token
 * @param {string} reviewers - GitHub usernames
 * @param {string} teamReviewers - GitHub teams
 */
const handle = async (token, reviewers, teamReviewers) => {
  const context = github.context
  if (!/^pull_request(_target)?$/.test(context.eventName)) {
    throw new Error('Sorry, this Action only works with pull requests.')
  }
  core.info(`Event type is supported: ${context.eventName}`)

  if (!(reviewers || teamReviewers)) {
    throw new Error('Must specify at least one of reviewers or teamReviewers.')
  }

  // filter out PR opener; can't self-review
  const filteredReviewers = reviewers
    .split(',')
    .filter(x => x !== context.actor) || undefined
  core.info('Reviewers: ' + filteredReviewers.join(','))
  core.info(`Team reviewers: ${teamReviewers}`)

  const octokit = github.getOctokit(token)
  const { owner, repo } = context.repo
  // core.info(util.inspect(octokit, false, null, true))
  try {
    await octokit.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number: context.payload.pull_request.number,
      reviewers: filteredReviewers,
      team_reviewers: teamReviewers.split(',') || undefined
    })
  } catch (err) {
    throw new Error(`Couldn't request review.\n  Error: ${err}`)
  }
}

module.exports = { handle }
