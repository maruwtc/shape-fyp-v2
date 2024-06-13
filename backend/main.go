package main

import (
	"shape-fpy/functions"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

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
		intIP, err := functions.GetIntIP()
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
		extIP, err := functions.GetExtIP()
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
		javaPath := functions.FindJava()
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
	router.GET("/testconnection", func(c *gin.Context) {
		targetip := c.Query("targetip")
		if targetip == "" {
			c.JSON(400, gin.H{
				"error": "Target IP is required",
			})
			return
		}
		status, err := functions.TestTargetConnection(targetip)
		if err != nil {
			c.JSON(500, gin.H{
				"error": err.Error(),
			})
			return
		} else {
			c.JSON(200, gin.H{
				"message": status,
			})
		}
	})
	router.GET("/startncat", func(c *gin.Context) {
		intIP, _ := functions.GetIntIP()
		host := c.DefaultQuery("host", intIP.String())
		port := c.DefaultQuery("port", "1304")
		filename := c.DefaultQuery("filename", "")
		portInt, err := strconv.Atoi(port)
		if err != nil {
			c.JSON(400, gin.H{
				"error": "Invalid port",
			})
			return
		}
		go functions.StartNcat(host, portInt, filename)
		status := functions.GetNcatStatus()
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/stopncat", func(c *gin.Context) {
		port := c.DefaultQuery("port", "1304")
		// status := functions.StopNcat(port)
		// c.JSON(200, gin.H{
		// 	"message": status,
		// })
		status := functions.StopNcat(port)
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/checkncat", func(c *gin.Context) {
		status := functions.CheckNcat()
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/startjndi", func(c *gin.Context) {
		status, err := functions.StartJNDIServer()
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
		status := functions.StopJNDIServer()
		c.JSON(200, gin.H{
			"message": status,
		})
	})
	router.GET("/checkjndi", func(c *gin.Context) {
		status := functions.CheckJNDIServer()
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
		out, err := functions.InputCMD(command)
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
		} else {
			out, err := functions.SendPayload(payload, targetip)
			if err != nil {
				c.JSON(500, gin.H{
					"error": err.Error(),
				})
				return
			} else {
				c.JSON(200, gin.H{
					"message": out,
				})
			}
		}
	})
	router.Run(":8000")
}
