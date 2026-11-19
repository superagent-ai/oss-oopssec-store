module ArchiveBehavior
  def archive(volume, dest)
    cmd = "tar -czf #{dest} /data/#{volume}"
    cmd << " #{policy(volume, 'tar_flags')}"
    sh(cmd)
  end
end
