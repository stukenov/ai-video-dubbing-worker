import runpod

def handler(job):
    """Simple hello world handler for RunPod"""
    return {"output": {"message": "Hello World!"}}

if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})
