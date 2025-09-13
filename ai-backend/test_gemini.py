import google.generativeai as genai

genai.configure(api_key="AIzaSyA5NzhTYLC3jvnLWpk8TZn7mJBA71zLR14")
model = genai.GenerativeModel("models/gemini-1.5-flash")
print("Gemini Flash model loaded:", model)
