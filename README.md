# Volume backup agent

The systemd service runs the Ruby daemon as root on backup hosts. The daemon
calls `nightly` automatically once per day, including after service startup;
no interactive approval occurs between reading settings and making an archive.
Volume identifiers and archive destinations are fixed by the agent deployment.

The central settings service replicates its JSON records to
`/var/lib/backup-settings/volumes.json`. The agent reads this replica through
`PolicyStore.fetch`. `deployment.json` records the effective write ACL for this
deployment. Settings writers can set arbitrary strings under their assigned
prefix; they do not receive additional host privileges from the replication
service. Files outside that replica are writable only by host administrators.

The deployment uses Ruby 3.2 and GNU tar 1.35.
