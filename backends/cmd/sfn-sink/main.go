package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/yomorun/yomo"
	"github.com/yomorun/yomo/serverless"

	"edge-whisper/pkg"
)

func Handler(ctx serverless.Context) {
	var data pkg.DataSink
	err := json.Unmarshal(ctx.Data(), &data)
	if err != nil {
		fmt.Println("error decode data:", err)
		return
	}

	res := data.Response
	if res == nil {
		fmt.Println("error nil response")
		return
	}

	fmt.Printf(
		"%s: transcription=[%s], temperature=%f, no_speech_prob=%f, language=%s\n",
		data.ReqID, res.Transcription, res.Temperature, res.NoSpeechProb, res.Language,
	)
}

func main() {
	zipper := os.Getenv("ZIPPER")
	if zipper == "" {
		zipper = "localhost:9000"
	}
	cred := os.Getenv("CREDENTIAL")

	sfn := yomo.NewStreamFunction("sfn-sink", zipper, yomo.WithSfnCredential(cred))
	sfn.SetHandler(Handler)
	sfn.SetObserveDataTags(pkg.TAG_SINK)

	err := sfn.Connect()
	if err != nil {
		fmt.Println("error yomo connect:", err)
		os.Exit(1)
	}

	sfn.Wait()
}
