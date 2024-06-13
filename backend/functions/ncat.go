package functions

import (
	"fmt"
	"io"
	"net"
	"os/exec"
)

var listener net.Listener
var ncatStatus = make(chan string, 1)

func StartNcat(host string, port int, filename string) {
	if listener != nil {
		ncatStatus <- "Ncat server is already running"
		return
	}
	address := fmt.Sprintf("%s:%d", host, port)
	var err error
	listener, err = net.Listen("tcp", address)
	if err != nil {
		ncatStatus <- "Error starting listener: " + err.Error()
		return
	}
	defer func() {
		listener = nil
	}()

	if filename != "" {
		// cmd := exec.Command("sh", "-c", fmt.Sprintf("nc -l -p %d > %s", port, filename))
		cmd := exec.Command("nc", "-l", "-p", fmt.Sprintf("%d", port), ">", filename)
		err = cmd.Start()
		if err != nil {
			ncatStatus <- "Error starting ncat command: " + err.Error()
			return
		}
		ncatStatus <- "Ncat server started by command: " + cmd.String() + " at " + address + " and writing to " + filename
		cmd.Wait()
	} else {
		ncatStatus <- "Ncat server started at " + address
		for {
			conn, err := listener.Accept()
			if err != nil {
				ncatStatus <- "Error accepting connection: " + err.Error()
				return
			}
			go handleConnection(conn)
		}
	}
}

func handleConnection(conn net.Conn) {
	defer conn.Close()
	io.Copy(conn, conn)
}

func StopNcat() string {
	if listener != nil {
		err := listener.Close()
		if err != nil {
			return "Error closing listener: " + err.Error()
		}
		listener = nil
		return "Ncat server stopped"
	}
	return "Ncat server is not running"
}

func CheckNcat() string {
	if listener != nil {
		return "Ncat server is running at " + listener.Addr().String()
	}
	return "Ncat server is not running"
}

func GetNcatStatus() string {
	return <-ncatStatus
}
