import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

async function validateParentHasLabel(octokit: InstanceType<typeof GitHub>) {
    const parentLabel = core.getInput('parent-label', { required: true, trimWhitespace: true });

    if (github.context.payload.action === 'opened') {
        const events = await octokit.rest.issues.listEventsForTimeline({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.payload.issue!.number,
        });

        const parentIssues = events.data
            .filter((item) => (item.event === 'cross-referenced' && item.source))
            .filter((item) => item.source!.issue!.labels
                .filter((label) => label.name.toLowerCase() === parentLabel.toLowerCase()).length > 0);

        return parentIssues && parentIssues.length > 0;
    }

    return false;
}

async function labelTask(octokit: InstanceType<typeof GitHub>): Promise<void> {
    const issueNumber = github.context.payload.issue!.number;
    const label = core.getInput('task-label', { required: true, trimWhitespace: true });
    const result = await octokit.rest.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: issueNumber,
        labels: [ label ]
    });
}

async function run(): Promise<void> {
    const token = `${process.env.PAT_TOKEN}`;
    const octokit = github.getOctokit(token, {
        previews: ['mockingbird-preview'],
    });
    const isValidParent = await validateParentHasLabel(octokit);

    if (isValidParent) {
        await labelTask(octokit);
    }
}

run();