module ArchiveBehavior
  def archive(volume, dest)
    cmd = "tar -czf #{dest} /data/#{volume}"
    sh(cmd)
  end
end
