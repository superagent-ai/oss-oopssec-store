require_relative 'backup_agent'

agent = BackupAgent.new
loop do
  agent.nightly
  sleep 86_400
end
