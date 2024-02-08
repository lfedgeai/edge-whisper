package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	gonanoid "github.com/matoous/go-nanoid/v2"
	"github.com/yomorun/yomo"

	"edge-whisper/pkg"
)

func main() {
	zipper := os.Getenv("ZIPPER")
	if zipper == "" {
		zipper = "localhost:9000"
	}
	cred := os.Getenv("CREDENTIAL")

	if len(os.Args) < 2 {
		fmt.Printf("Usage: %s file_path\n", os.Args[0])
		os.Exit(1)
	}
	filePath := os.Args[1]

	source := yomo.NewSource("source-whisper", zipper, yomo.WithCredential(cred))
	err := source.Connect()
	if err != nil {
		fmt.Println("error yomo connect:", err)
		os.Exit(1)
	}

	content, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Println("error read file:", err)
		os.Exit(1)
	}

	reqID, err := gonanoid.New(8)
	if err != nil {
		fmt.Println("error generate nanoid:", err)
		os.Exit(1)
	}

	data := &pkg.DataWhisper{
		ReqID:    reqID,
		Filename: filepath.Base(filePath),
		Content:  content,
	}

	buf, err := json.Marshal(data)
	if err != nil {
		fmt.Println("error json encode:", err)
		os.Exit(1)
	}

	err = source.Write(pkg.TAG_WHISPER, buf)
	if err != nil {
		fmt.Println("error source.Write:", err)
		os.Exit(1)
	}

	time.Sleep(3 * time.Second)
	source.Close()
	time.Sleep(1 * time.Second)
}
