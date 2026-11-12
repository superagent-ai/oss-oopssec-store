# Test Dependency Validation with a custom Renovate account

The **Manual Renovate validation test** workflow runs self-hosted Renovate on
GitHub Actions using a regular GitHub account. It only targets this repository's
root Next.js dependency, proposing `15.2.2` to `15.2.3` for
[CVE-2025-29927](https://github.com/advisories/GHSA-f82v-jwr5-mffw).
It runs only on manual dispatch from `main`, defaults to a dry run, and never
merges the resulting PR automatically.

This repository is a fork. The configuration explicitly enables processing it;
Renovate creates update branches and PRs inside `superagent-ai/oss-oopssec-store`,
not in its upstream repository.

## Configure the account and secrets

Create or use a dedicated GitHub user account with write access to
`superagent-ai/oss-oopssec-store`. The token's owner becomes the PR author; a Git
display name alone does not change the GitHub account.

Add these under **Settings > Secrets and variables > Actions > Repository secrets**:

| Secret                                | Value                                                                                                                                              |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RENOVATE_TOKEN`                      | A personal access token owned by the custom account, with access to this repository.                                                               |
| `RENOVATE_GIT_PRIVATE_KEY`            | The complete private SSH signing key, including its header, footer, and actual newlines. An unencrypted armored GPG private key is also supported. |
| `RENOVATE_GIT_PRIVATE_KEY_PASSPHRASE` | Only needed if the SSH signing key has a passphrase. Omit it for an unencrypted key. GPG passphrases are not supported by Renovate.                |

For a fine-grained token, select this repository and grant **Contents**, **Pull
requests**, **Issues**, and **Commit statuses** read/write, plus **Dependabot
alerts** read. If required for the organization, grant **Members** read and have
the organization approve the token. The workflow does not update workflow files.
A classic token with `public_repo` can be used for this public fixture if your
organization permits it. Do not use the built-in `GITHUB_TOKEN`: that would test
the GitHub Actions identity instead of your custom account.

### Register an SSH signing key

1. Generate a dedicated key locally:

   ```bash
   ssh-keygen -t ed25519 -f ./renovate-signing -C "Renovate commit signing"
   ```

2. While logged into the custom account, go to **GitHub Settings > SSH and GPG
   keys > New SSH key**. Select **Signing Key** and upload
   `renovate-signing.pub`. The public key must belong to the same account as
   `RENOVATE_TOKEN`.
3. Store the contents of `renovate-signing` as `RENOVATE_GIT_PRIVATE_KEY`. If you
   chose a passphrase, store it as `RENOVATE_GIT_PRIVATE_KEY_PASSPHRASE`.

The workflow derives the Git author and committer from the token's login and
numeric account ID using that account's GitHub noreply email. It checks the
entered login against the token owner before Renovate runs. Confirm that commits
in the resulting PR show **Verified** and that both author and committer link to
the custom account.

## Run the test

1. Merge the workflow setup PR into `main` so GitHub exposes the manual workflow.
2. Point the Superagent GitHub App webhook at a deployment containing support for
   custom bot accounts, or at the local app through its configured public tunnel.
3. Ensure GitHub's dependency graph is enabled for this fork under the repository's
   **Settings > Advanced Security > Dependency graph** (the setting may appear
   under **Code security**). Superagent needs GitHub's dependency comparison data,
   or readable Dependabot alerts as a fallback, to identify the known advisory.
   A `404` from the dependency-graph API can also indicate missing permissions;
   verify that the Superagent GitHub App can read this repository's dependency
   information and Dependabot alerts. Without advisory data, creating the PR alone
   does not establish that Dependency Validation can investigate it.
4. In Superagent's settings for this repository, open **Dependency scans**, enable
   **Verify vulnerable dependency updates**, and add the exact account login to
   **Additional bot accounts**. Allow the `main` target branch and configure the
   repository environment and application setup instructions.
5. In GitHub, open **Actions > Manual Renovate validation test > Run workflow**.
   Select `main`, enter the account's GitHub login, and leave **dry_run** checked.
   Review the logs for the proposed Next.js update.
6. Run it again with **dry_run** unchecked to open the signed update PR from
   `renovate/manual-validation/`. The branch is created in this repository.
7. Confirm that **Superagent · Dependency Validation** starts and links to the
   application investigation. Inspect evidence for the vulnerable base and the
   proposed fix; an incomplete investigation is not a verified fix.

The workflow only opens the update PR. Leave it open for testing: merging it
changes a CTF fixture, so tests that require the middleware bypass can fail on
the updated branch. Version `15.2.3` is a focused historical fix for this test,
not a recommendation for a current production Next.js version.

## Check routing and authorization

| Scenario                                                               | Expected result                                                                                       |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Custom account absent from settings                                    | Regular configured PR checks; no Dependency Validation investigation.                                 |
| Account added, signed security update from a same-repository branch    | Dependency Validation investigation, subject to available GitHub advisory data and application setup. |
| Account removed before sandbox provisioning                            | Execution withheld when authorization is rechecked.                                                   |
| Unsigned commit or commit from a different account in the update range | Execution withheld; no repository variables are loaded into a sandbox for that update.                |
| PR from another repository                                             | No Dependency Validation investigation.                                                               |

After changing settings, use GitHub's check rerun control on the PR to exercise
routing again. The dry run does not create commits and therefore cannot verify
commit signing or the complete Superagent webhook path.

If no update is proposed, check whether the same Renovate PR was previously
closed, or whether `main` already has Next.js `15.2.3` or later. Keep the
`15.2.2` baseline available while using this fixture.

## References

- [Renovate GitHub authentication](https://docs.renovatebot.com/modules/platform/github/)
- [Renovate commit signing](https://docs.renovatebot.com/self-hosted-configuration/#gitprivatekey)
- [GitHub SSH signing keys](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-signing-key-to-your-github-account)
