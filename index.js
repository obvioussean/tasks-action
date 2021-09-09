const core = require('@actions/core');
const github = require('@actions/github');

async function validateParentHasLabel(octokit) {
    const parentLabel = core.getInput('parent-label', { required: true, trimWhitespace: true });

    if (github.context.payload.action === 'opened') {
        const events = await octokit.issues.listEventsForTimeline({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.payload.issue.number,
        });

        const parentIssues = events.data
            .filter((item) => (item.event === 'cross-referenced' && item.source))
            .filter((item) => item.source.issue.labels
                .filter((label) => label.name.toLowerCase() === parentLabel.toLowerCase()).length > 0);

        return parentIssues && parentIssues.length > 0;
    }

    return false;
}

async function labelTask(octokit) {
    const issueNumber = github.context.payload.issue.number;
    const label = core.getInput('task-label', { required: true, trimWhitespace: true });
    const result = await octokit.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: issueNumber,
        labels: [{ name: label }]
    });
}

async function run() {
    const token = `${process.env.PAT_TOKEN}`;
    const octokit = github.getOctokit(token);
    const isValidParent = await validateParentHasLabel(octokit);
    
    if (isValidParent) {
        await labelTask(octokit);
    }
}

run();