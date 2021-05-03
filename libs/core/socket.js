const config = use('config/http');
const socketIO = require('socket.io')

class Socket {

  static connect(server){
    this.io = socketIO(server)
    this.io.on("connection", socket => {
      for(let name in this.events){
        socket.on(name, this.events[name](socket))
      }
      socket.on('disconnect', () => {
      })
    })
  }
  static on(name, callback){
    this.events[name] = callback
  }
  static emit(id,name, data){
    if(Socket.list[id]){
      Socket.list[id].emit(name, JSON.stringify(data))
    }
    else{
      console.log(`socket: not found #${id}`)
    }
  }
}
Socket.events = {}
Socket.list = {}
module.exports = Socket;
