require 'webrick'
dir = File.expand_path(File.dirname(__FILE__))
server = WEBrick::HTTPServer.new(Port: 8000, DocumentRoot: dir)
trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }
server.start
