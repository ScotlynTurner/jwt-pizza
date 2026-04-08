# Incident: 2026-04-07 01-58-22

## Summary

Between the time of 13:58 and 14:15 on April 7, 2025, all users encountered failures when creating an order. The event was triggered by a factory failure at 13:58.

The event was detected by manual evaluation. The team started working on the event by 14:01. This SEV-2 incident affected 100% of users.

## Detection

This incident was detected when the manual evaluator tested and failed to order a pizza. The team acted right away.

Metrics and logging will be improved by Scotlyn Turner so that failures can be found without manual evaluation.

## Impact

For 17 minutes between 13:58 and 14:15 on April 7, 2025, all our users experienced failures when ordering a pizza.

## Timeline

All times are UTC.

- _13:58_ - Users begin to experience failures when ordering pizza
- _14:01_ - Manual evaluation reveals incident
- _14:02_ - Developer team starts investigating failures
- _14:07_ - Developer attempts adding extra protections to 'create order' endpoint code
- _14:08_ - Deploying changes fail
- _14:11_ - Developer checks browser console logs and finds link to end chaos testing
- _14:13_ - Manual testing reveals that the incident is resolved
- _17:20_ - Developer team rolls back previous changes

## Response

After manually testing ordering a pizza at 14:01 UTC, Scotlyn Turner (developer and manual tester) immediately responded by investigating failures.

## Root cause

The cause of the incident was a pizza factory failure. More specifics are not known at this time, as anything else was not caught in the logs or was already protected against.

## Resolution

Following the link in the console logs to end the chaos testing.

## Prevention

This root has not caused any other issues.

## Action items

1. Automating better metrics and logging: Scotlyn Turner
