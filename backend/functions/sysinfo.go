package functions

import (
	"net"
	"os/exec"
	"runtime"

	externalip "github.com/glendc/go-external-ip"
	. "github.com/klauspost/cpuid/v2"
	"github.com/pbnjay/memory"
)

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

func TestTargetConnection(targetip string) (string, error) {
	target := targetip + ":8080"
	conn, err := net.Dial("tcp", target)
	if err != nil {
		return "", err
	}
	conn.Close()
	return "Target is reachable", nil
}

func GetOSInfo() (string, any, string) {
	cpu := CPU.BrandName
	memory := memory.TotalMemory() / 1024 / 1024 / 1024
	os := runtime.GOOS
	return cpu, memory, os
}
