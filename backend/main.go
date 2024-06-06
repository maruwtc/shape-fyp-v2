package main

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"sync"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	externalip "github.com/glendc/go-external-ip"
)

func main() {
	router := gin.Default()
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, World!",
		})
	})
	router.GET("/findip", func(c *gin.Context) {
		intIP, err := GetIntIP()
		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		} else {
			c.JSON(200, gin.H{
				"ip": intIP.String(),
			})
		}
	})
	router.GET("/findextip", func(c *gin.Context) {
		extIP, err := GetExtIP()
		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		} else {
			c.JSON(200, gin.H{
				"ip": extIP,
			})
		}
	})
	router.GET("/findjava", func(c *gin.Context) {
		javaPath := FindJava()
		if javaPath == "" {
			c.JSON(500, gin.H{
				"error": "Java not found",
			})
			return
		} else {
			c.JSON(200, gin.H{
				"java": javaPath,
			})
		}
	})
	router.GET("/startncat", func(c *gin.Context) {
		host := c.DefaultQuery("host", "localhost")
		port := c.DefaultQuery("port", "8080")

		intPort, err := strconv.Atoi(port)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid port number"})
			return
		}
		StartNcat(host, intPort)
		c.JSON(http.StatusOK, gin.H{"status": "Server started"})
	})
	router.GET("/stopncat", func(c *gin.Context) {
		StopNcat()
		c.JSON(http.StatusOK, gin.H{"status": "Server stopped"})
	})
	router.Use(cors.Default())
	router.Run(":8080")
}

// -------------------------- Start of Payload Sender -------------------------- //
func SendPayload() {
}

// -------------------------- End of Payload Sender -------------------------- //

// -------------------------- Start of IP Finder -------------------------- //
func GetIntIP() (net.IP, error) {
	var (
		ret    net.IP
		err    error
		ifaces []net.Interface
		addrs  []net.Addr
	)
	if ifaces, err = net.Interfaces(); err == nil {
		for _, i := range ifaces {
			if addrs, err = i.Addrs(); err == nil {
				for _, a := range addrs {
					if ipnet, ok := a.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
						if ipv4 := ipnet.IP.To4(); ipv4 != nil && ipv4.IsGlobalUnicast() {
							ret = ipv4
							return ret, nil
						}
					}
				}
			}
		}
	}
	fmt.Println("Error:", err)
	return nil, err
}

func GetExtIP() (string, error) {
	consensus := externalip.DefaultConsensus(nil, nil)
	ip, err := consensus.ExternalIP()
	if err != nil {
		return "", err
	}
	return ip.String(), nil
}

// -------------------------- End of IP Finder -------------------------- //

// -------------------------- Start of Java Finder -------------------------- //
func FindJava() string {
	javapath, err := exec.LookPath("java")
	if err != nil {
		return ""
	} else {
		return javapath
	}
}

// -------------------------- End of Java Finder -------------------------- //

// -------------------------- Start of Ncat Server -------------------------- //
var (
	serverRunning bool
	serverCtx     context.Context
	serverCancel  context.CancelFunc
	serverWg      sync.WaitGroup
)

func startNcatServer(host string, port int, ctx context.Context) {
	defer serverWg.Done()
	address := fmt.Sprintf("%s:%d", host, port)
	listener, err := net.Listen("tcp", address)
	if err != nil {
		panic(err)
	}
	defer listener.Close()
	for {
		select {
		case <-ctx.Done():
			fmt.Println("Shutting down the server...")
			return
		default:
			conn, err := listener.Accept()
			if err != nil {
				fmt.Println("Error:", err)
				continue
			}
			go func(conn net.Conn) {
				defer conn.Close()
				_, err := io.Copy(os.Stdout, conn)
				if err != nil {
					fmt.Println("Error:", err)
				}
			}(conn)
		}
	}
}

func StartNcat(host string, port int) {
	if serverRunning {
		fmt.Println("Server is already running")
		return
	}
	serverCtx, serverCancel = context.WithCancel(context.Background())
	serverWg.Add(1)
	go startNcatServer(host, 1304, serverCtx)
	serverRunning = true
	fmt.Println("Successfully started ncat server.")
}

func StopNcat() {
	if !serverRunning {
		fmt.Println("Server is not running")
		return
	}
	serverCancel()
	serverWg.Wait()
	serverRunning = false
	fmt.Println("[+] Successfully stopped ncat server.")
}

// -------------------------- End of Ncat Server -------------------------- //
