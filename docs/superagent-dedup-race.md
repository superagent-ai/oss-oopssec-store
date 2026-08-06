# Superagent duplicate scan race fixture

This follow-up commit changes the PR head while the first suspicious workflow
scan is running. The first scan should be superseded and only this head should
publish Superagent findings.
