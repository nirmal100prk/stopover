package aviasales

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
)

func GenerateSignature(token, marker, host, locale, tripClass, userIP string, passengers PassengerInfo, segments []Segment) string {
	parts := []string{
		host,
		locale,
		marker,
		fmt.Sprintf("%d", passengers.Adults),
		fmt.Sprintf("%d", passengers.Children),
		fmt.Sprintf("%d", passengers.Infants),
	}

	for _, seg := range segments {
		parts = append(parts, seg.Date, seg.Destination, seg.Origin)
	}

	parts = append(parts, tripClass, userIP)

	// Final string: token + colon + all joined values
	signingStr := token + ":" + joinWithColon(parts)
	fmt.Println(signingStr)
	hash := md5.Sum([]byte(signingStr))
	return hex.EncodeToString(hash[:])
}

func joinWithColon(parts []string) string {
	result := parts[0]
	for _, p := range parts[1:] {
		result += ":" + p
	}
	return result
}
