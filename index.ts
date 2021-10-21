import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

async function isValidEvent(octokit: InstanceType<typeof GitHub>) {
    const parentLabel = core.getInput('parent-label', { required: false, trimWhitespace: true });

    if (github.context.payload.action === 'opened') {
        const events = await octokit.rest.issues.listEventsForTimeline({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            issue_number: github.context.payload.issue!.number,
        });

        const parentIssues = events.data.filter((item) => (item.event === 'cross-referenced' && item.source));

        if (parentIssues.length > 0) {
            if (parentLabel) {
                const matchedLabels = parentIssues.filter((item) => item.source!.issue!.labels
                    .filter((label) => label.name.toLowerCase() === parentLabel.toLowerCase()).length > 0);

                return matchedLabels.length > 0;
            } else {
                return true;
            }
        }
    } else {
        core.warning(`Unexpected action ${github.context.payload.action}`);
    }

    return false;
}

async function labelTask(octokit: InstanceType<typeof GitHub>): Promise<void> {
    const issueNumber = github.context.payload.issue!.number;
    const labels = core.getInput('task-label', { required: true, trimWhitespace: true }).split(",");

    await octokit.rest.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: issueNumber,
        labels: labels
    });

    core.info(`Added labels ${labels.join(",")} to ${issueNumber}`);
}

async function run(): Promise<void> {
    const token = `${process.env.PAT_TOKEN}`;
    const octokit = github.getOctokit(token, {
        previews: ['mockingbird-preview'],
    });
    const isValid = await isValidEvent(octokit);

    if (isValid) {
        await labelTask(octokit);
    }
}

run();