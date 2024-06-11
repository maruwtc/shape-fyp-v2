package functions

import (
	"encoding/base64"
	"fmt"
	"os/exec"
	"strings"
)

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
