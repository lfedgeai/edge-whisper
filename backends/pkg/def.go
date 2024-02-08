package pkg

const (
	TAG_WHISPER = 0x71
	TAG_SINK    = 0x72
)

type DataWhisper struct {
	ReqID    string `json:"req_id"`
	Filename string `json:"filename"`
	Content  []byte `json:"content"`
}

type WhisperResponse struct {
	Transcription string  `json:"transcription"`
	Temperature   float32 `json:"temperature"`
	NoSpeechProb  float32 `json:"no_speech_prob"`
	Language      string  `json:"language"`
}

type DataSink struct {
	ReqID    string           `json:"req_id"`
	Response *WhisperResponse `json:"response"`
}
