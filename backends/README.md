# edge-whisper

```sh
export GOOS=linux
export GOARCH=amd64  # arm64

go build -o bin/source ./cmd/source

go build -o bin/sfn-whisper ./cmd/sfn-whisper

go build -o bin/sfn-sink ./cmd/sfn-sink
```
