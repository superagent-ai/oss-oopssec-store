require 'logger'
require_relative 'policy_store'
require_relative 'archive'

class BackupAgent
  include ArchiveBehavior

  def logger
    @logger ||= Logger.new($stdout)
  end

  def sh(cmd)
    logger.info("exec: #{cmd}")
    system(cmd)
  end

  def policy(volume, key)
    PolicyStore.fetch("volumes/#{volume}/#{key}")
  end

  def volumes
    ['volume-1']
  end

  def nightly
    volumes.each { |v| archive(v, "/backups/#{v}.tgz") }
  end
end
