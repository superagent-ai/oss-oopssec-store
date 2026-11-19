require 'json'

class PolicyStore
  # A read-only local replica of the central volume settings store.
  PATH = '/var/lib/backup-settings/volumes.json'.freeze

  def self.fetch(key)
    JSON.parse(File.read(PATH)).fetch(key, '')
  end
end
