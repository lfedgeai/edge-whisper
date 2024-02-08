package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/yomorun/yomo"
	"github.com/yomorun/yomo/serverless"

	"edge-whisper/pkg"
)

var WHISPER_SERVER = "http://localhost:8000"

func Handler(ctx serverless.Context) {
	var input pkg.DataWhisper
	err := json.Unmarshal(ctx.Data(), &input)
	if err != nil {
		fmt.Println("error decode input:", err)
		return
	}

	fmt.Printf("%s: %s\n", input.ReqID, input.Filename)

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", input.Filename)
	if err != nil {
		fmt.Println("error CreateFormFile:", err)
		return
	}

	_, err = part.Write(input.Content)
	if err != nil {
		fmt.Println("error part.Write:", err)
		return
	}
	writer.Close()

	url := WHISPER_SERVER + "/transcribe"
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		fmt.Println("error http.NewRequest:", err)
		return
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	r, err := client.Do(req)
	if err != nil {
		fmt.Println("error http post:", err)
		return
	}
	defer r.Body.Close()

	if r.StatusCode != http.StatusOK {
		fmt.Println("error http status:", r.Status)
		return
	}

	buf, err := io.ReadAll(r.Body)
	if err != nil {
		fmt.Println("error read http body:", err)
		return
	}

	var res pkg.WhisperResponse
	err = json.Unmarshal(buf, &res)
	if err != nil {
		fmt.Println("error decode whisper response:", err)
		return
	}

	fmt.Printf(
		"transcription=[%s], temperature=%f, no_speech_prob=%f, language=%s\n",
		res.Transcription, res.Temperature, res.NoSpeechProb, res.Language,
	)

	output := &pkg.DataSink{
		ReqID:    input.ReqID,
		Response: &res,
	}

	buf, err = json.Marshal(output)
	if err != nil {
		fmt.Println("error encode output:", err)
		return
	}

	ctx.Write(pkg.TAG_SINK, buf)
}

func main() {
	zipper := os.Getenv("ZIPPER")
	if zipper == "" {
		zipper = "localhost:9000"
	}
	cred := os.Getenv("CREDENTIAL")

	if v := os.Getenv("WHISPER_SERVER"); v != "" {
		WHISPER_SERVER = v
	}

	sfn := yomo.NewStreamFunction("sfn-whisper", zipper, yomo.WithSfnCredential(cred))
	sfn.SetHandler(Handler)
	sfn.SetObserveDataTags(pkg.TAG_WHISPER)

	err := sfn.Connect()
	if err != nil {
		fmt.Println("error yomo connect:", err)
		os.Exit(1)
	}

	sfn.Wait()
}
