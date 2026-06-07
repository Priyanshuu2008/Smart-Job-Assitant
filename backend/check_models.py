import google.generativeai as genai
genai.configure(api_key="AQ.Ab8RN6I87-2K8LY5mVpdky7P8Bjg6iFjb-EGVBAseRw3eDidCQ")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)
