# Issue Task List Action
This action automatically labels an issue that is opened from the "Convert to issue" feature of [issue task lists](https://docs.github.com/en/issues/tracking-your-work-with-issues/about-task-lists).  

## Supported events
- opened issue

## Inputs
Input Name | Required | Details 
:-|:-|:-
`parent-label` | | The parent label to match before applying the label to the opened issue, if not provided will apply the label to all converted issues
`task-label` | :heavy_check_mark: | The label to apply to the opened issue

## Environment Variables

To correctly use this action, we currently require a Personal Access Token with
`repo` permissions. This token can be added to the repository secrets and
used in the action with:

```yaml
env:
  PAT_TOKEN: ${{ secrets.PAT_TOKEN }}
```

## Example Usage
```yaml
name: Labels epic tasks with the feature label

on:
  issues:
    types: [opened]

jobs:
  label-task:
    runs-on: ubuntu-latest
    name: Label task for epics
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          repository: obvioussean/tasks-action
      - name: Labels the feature
        id: label_feature
        uses: ./ # Uses an action in the root directory
        with:
          parent-label: 'epic'
          task-label: 'feature'
        env:
          PAT_TOKEN: ${{ secrets.PAT_TOKEN }}
```