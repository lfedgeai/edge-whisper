# edge-whisper

https://edge-ai.yomo.run

Realtime transcribe by running whisper model on geo-distributed cloud.

![geo](https://github.com/lfedgeai/edge-whisper/assets/65603/513a6090-6a0f-487e-b4af-6000d6b50214)

This showcase demonstrates real-time speech-to-text transcription using the Whisper model. The model is deployed across geographically distributed cloud infrastructure to ensure optimal performance and low latency for users around the world.

Users are automatically directed to the most suitable backend server based on their location. To determine your assigned backend and hardware configuration, simply ping `edgeai.yomo.dev` and check the returned IP address. Here's an overview of the available backends:

- `3.66.190.18`: run Whisper.cpp inference on AWS Graviton 3 arm-based processor.
- `20.9.141.176`: run Whisper.cpp inference on Azure Ampere arm-based processor.
- `43.131.34.253`: run Whisper inference on NVidia Tesla T4.

By leveraging this geographically distributed architecture, this showcase delivers fast, accurate, and reliable speech transcription for users globally.

## Self-hosting

![yomo.run edge ai inference demo](https://github.com/lfedgeai/edge-whisper/assets/65603/c5cb55bd-e777-4b11-aa00-d32b4c96cd8d)

To deploy this real-time speech transcription system on your own infrastructure, follow these steps:

1. **Start the frontend**: Run`pnpm run dev` to launch the frontend application, which provides the interface for simultaneous interpretation.
2. **Choose your backend**: Backends are located in the `./backends/` directory and are built using [YoMo](https://github.com/yomorun/yomo). Each backend targets a specific type of AI infrastructure.
3. **Select and run the appropriate backend script**:
  - for `Arm` based processors, run [backends/whisper_cpp_arm_server.py](./backends/whisper_cpp_arm_server.py) to load [whisper.cpp](https://github.com/ggerganov/whisper.cpp) model.
  - for `NVidia` GPUs, run [backends/whisper_nvidia_t4_server.py](./backends/whisper_nvidia_t4_server.py) to load [whisper](https://github.com/openai/whisper) model.

Please note: These instructions assume you have the necessary dependencies like Whisper, Whisper.cpp and YoMo Framework installed. Refer to the project documentation for further details.
